const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { createContactRouter } = require("../../src/routes/contact.routes");
const trustedOrigin = require("../../src/middlewares/requireTrustedOrigin");
const errors = require("../../src/middlewares/globalErrorHandler");

const valid = { name: "Prueba local", email: "visitor@example.com", subject: "Consulta técnica", message: "Este mensaje nunca sale del entorno de pruebas.", website: "" };
async function fixture(t, send, configured = true) {
  process.env.FRONTEND_URL = "http://localhost:3000";
  const app = express();
  app.use(trustedOrigin, express.json());
  app.use("/api/contact", createContactRouter({ send, env: configured ? { RESEND_API_KEY: "test-only", CONTACT_FROM: "Portfolio <contact@example.com>", CONTACT_TO: "admin@example.com" } : {} }));
  app.use(errors);
  const server = await new Promise(resolve => { const s = app.listen(0, "127.0.0.1", () => resolve(s)); });
  t.after(() => new Promise(resolve => server.close(resolve)));
  return (body = valid, origin = process.env.FRONTEND_URL) => fetch(`http://127.0.0.1:${server.address().port}/api/contact`, { method: "POST", headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify(body) });
}
test("contact forwards only to the configured inbox, with visitor Reply-To and plain text", async t => {
  let payload;
  const post = await fixture(t, async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(options.headers.Authorization, "Bearer test-only");
    payload = JSON.parse(options.body);
    return Response.json({ id: "provider-id" });
  });
  const response = await post({ ...valid, to: "attacker@example.com", from: "forged@example.com" });
  assert.equal(response.status, 202);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(payload.to, ["admin@example.com"]);
  assert.equal(payload.from, "Portfolio <contact@example.com>");
  assert.equal(payload.reply_to, valid.email);
  assert.equal(payload.html, undefined);
  assert.match(payload.text, /Este mensaje/);
});
test("invalid input and honeypot never reach Resend", async t => {
  const post = await fixture(t, () => assert.fail("Provider must not be called"));
  for (const body of [{ ...valid, email: "invalid" }, { ...valid, subject: "x\r\nBcc: bad@example.com" }, { ...valid, message: "short" }, { ...valid, website: "spam" }, { ...valid, message: "x".repeat(5001) }]) {
    assert.equal((await post(body)).status, 400);
  }
});
test("untrusted and missing origins are rejected", async t => {
  const post = await fixture(t, () => assert.fail("Provider must not be called"));
  assert.equal((await post(valid, "https://attacker.example")).status, 403);
  assert.equal((await post(valid, "")).status, 403);
});
test("unconfigured contact is unavailable, never a demo success", async t => {
  const post = await fixture(t, () => assert.fail("Provider must not be called"), false);
  assert.equal((await post()).status, 503);
});
test("provider rejection, malformed success and timeout do not claim success", async t => {
  for (const send of [async () => Response.json({ message: "secret provider details" }, { status: 403 }), async () => Response.json({}), async () => { throw new DOMException("Timed out", "TimeoutError"); }]) {
    const post = await fixture(t, send);
    const response = await post();
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /secret provider details|test-only/);
  }
});
test("sixth submission is rate limited before provider call", async t => {
  let calls = 0;
  const post = await fixture(t, async () => { calls++; return Response.json({ id: "accepted" }); });
  for (let i = 0; i < 5; i++) assert.equal((await post()).status, 202);
  const response = await post();
  assert.equal(response.status, 429);
  assert.ok(response.headers.get("retry-after"));
  assert.equal(calls, 5);
});
