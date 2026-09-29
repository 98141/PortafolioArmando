const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const express = require("express");
const { createVisitRouter } = require("../../src/routes/visit.routes");
const errors = require("../../src/middlewares/globalErrorHandler");

async function fixture(t, options = {}) {
  process.env.FRONTEND_URL = "https://portfolio.example.com";
  const sessions = new Set();
  const app = express();
  app.use(express.json());
  app.use("/visits", createVisitRouter({ store: { record: async id => { sessions.add(id); }, total: async () => sessions.size }, ...options }));
  app.use(errors);
  const server = await new Promise(resolve => { const s = app.listen(0, "127.0.0.1", () => resolve(s)); });
  t.after(() => { server.closeAllConnections(); server.close(); });
  const url = `http://127.0.0.1:${server.address().port}/visits`;
  const post = (body, headers = {}) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Origin: process.env.FRONTEND_URL, ...headers }, body: JSON.stringify(body) });
  return { url, post, sessions };
}
test("reads do not count; concurrent retries count a session once and store only its hash", async t => {
  const { post, url, sessions } = await fixture(t);
  assert.equal((await (await fetch(url)).json()).data.visits, 0);
  const sessionId = randomUUID();
  const responses = await Promise.all(Array.from({ length: 8 }, () => post({ sessionId })));
  assert.ok(responses.every(r => r.status === 200));
  assert.equal(sessions.size, 1);
  assert.match([...sessions][0], /^[a-f0-9]{64}$/);
  assert.ok(!sessions.has(sessionId));
  const another = await post({ sessionId: randomUUID() });
  assert.equal((await another.json()).data.visits, 2);
  assert.equal(another.headers.get("cache-control"), "no-store");
  assert.equal(another.headers.get("set-cookie"), null);
});
test("invalid input and untrusted origins cannot record visits", async t => {
  const { post, sessions } = await fixture(t);
  for (const body of [{}, { sessionId: "x" }, { sessionId: randomUUID(), total: 999 }]) assert.equal((await post(body)).status, 400);
  for (const Origin of ["", "https://attacker.example"]) assert.equal((await post({ sessionId: randomUUID() }, { Origin })).status, 403);
  assert.equal(sessions.size, 0);
});
test("known crawlers can read the total without increasing it", async t => {
  const { post, sessions } = await fixture(t);
  for (const ua of ["Googlebot/2.1", "bingbot/2.0", "Chrome-Lighthouse", "Google-InspectionTool/1.0"]) {
    assert.equal((await post({ sessionId: randomUUID() }, { "User-Agent": ua })).status, 200);
  }
  assert.equal(sessions.size, 0);
});
test("recording is rate limited", async t => {
  const { post, sessions } = await fixture(t, { limit: 2 });
  for (let n = 0; n < 2; n++) assert.equal((await post({ sessionId: randomUUID() })).status, 200);
  assert.equal((await post({ sessionId: randomUUID() })).status, 429);
  assert.equal(sessions.size, 2);
});
test("a duplicate-key race returns the persisted total; database failures do not invent a count", async t => {
  const duplicate = await fixture(t, { store: { record: async () => { throw Object.assign(new Error("duplicate"), { code: 11000 }); }, total: async () => 1 } });
  assert.equal((await (await duplicate.post({ sessionId: randomUUID() })).json()).data.visits, 1);
  const failed = await fixture(t, { store: { record: async () => { throw new Error("simulated database outage"); }, total: async () => { throw new Error("simulated database outage"); } } });
  assert.equal((await failed.post({ sessionId: randomUUID() })).status, 500);
  assert.equal((await fetch(failed.url)).status, 500);
});
