const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const http = require("node:http");
const express = require("express");
const { createHealthRouter } = require("../../src/routes/health.routes");
const { createShutdown } = require("../../src/utils/shutdown");

async function serve(t, handler) {
  const server = http.createServer(handler).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => { server.closeAllConnections(); server.close(); });
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
async function health(t, options) {
  const app = express();
  app.use("/api", createHealthRouter(options));
  app.get("/api/content", (_req, res) => res.json({ ok: true }));
  return serve(t, app);
}
test("liveness stays live without MongoDB; readiness is unavailable and uncached", async (t) => {
  const { url } = await health(t, { connection: { readyState: 0 } });
  const live = await fetch(`${url}/api/health`);
  assert.equal(live.status, 200);
  assert.equal(live.headers.get("cache-control"), "no-store");
  const ready = await fetch(`${url}/api/ready`);
  assert.equal(ready.status, 503);
  assert.deepEqual(await ready.json(), { status: "error", data: { ready: false } });
  assert.equal(ready.headers.get("cache-control"), "no-store");
  assert.equal((await fetch(`${url}/api/content`)).headers.get("cache-control"), null);
});
test("concurrent probes share a ping; disconnect and draining override successful cache", async (t) => {
  let calls = 0, draining = false;
  const connection = { readyState: 1, db: { command: async () => { calls++; await new Promise(resolve => setTimeout(resolve, 30)); return { ok: 1 }; } } };
  const { url } = await health(t, { connection, isDraining: () => draining });
  const responses = await Promise.all(Array.from({ length: 6 }, () => fetch(`${url}/api/ready`)));
  assert.ok(responses.every(response => response.status === 200));
  assert.equal(calls, 1);
  connection.readyState = 0;
  assert.equal((await fetch(`${url}/api/ready`)).status, 503);
  connection.readyState = 1;
  draining = true;
  assert.equal((await fetch(`${url}/api/ready`)).status, 503);
});
test("failed ping hides database details and recovers on the next uncached probe", async (t) => {
  let failed = true;
  const { url } = await health(t, { cacheMs: 0, connection: { readyState: 1, db: { command: async () => { if (failed) throw new Error("private database credentials"); } } } });
  const result = await fetch(`${url}/api/ready`);
  assert.equal(result.status, 503);
  assert.doesNotMatch(await result.text(), /private|credentials/);
  failed = false;
  assert.equal((await fetch(`${url}/api/ready`)).status, 200);
});
test("a stuck database ping is bounded", async (t) => {
  const { url } = await health(t, { timeoutMs: 20, connection: { readyState: 1, db: { command: () => new Promise(() => {}) } } });
  const result = await fetch(`${url}/api/ready`, { signal: AbortSignal.timeout(2000) });
  assert.equal(result.status, 503);
});
const logger = { info() {}, error() {} };
test("shutdown completes an active request before disconnecting, even after repeated signals", async (t) => {
  let release, entered, disconnected = 0, drained = 0, finish;
  const arrived = new Promise(resolve => { entered = resolve; });
  const completed = new Promise(resolve => { finish = resolve; });
  const { server, url } = await serve(t, (_req, res) => { release = () => res.end("complete"); entered(); });
  const shutdown = createShutdown({ server, disconnect: async () => { disconnected++; }, markDraining: () => { drained++; }, exit: finish, timeoutMs: 2000, logger });
  const request = fetch(url).then(response => response.text());
  await arrived;
  shutdown("SIGTERM");
  shutdown("SIGINT");
  assert.equal(disconnected, 0);
  assert.equal(drained, 1);
  release();
  assert.equal(await request, "complete");
  assert.equal(await completed, 0);
  assert.equal(disconnected, 1);
});
test("shutdown deadline force-closes connections and exits unsuccessfully", async () => {
  let closed = 0, forced = 0;
  const result = await new Promise(resolve => {
    const shutdown = createShutdown({ server: { close() { closed++; }, closeAllConnections() { forced++; } }, disconnect: async () => {}, markDraining() {}, exit: resolve, timeoutMs: 20, logger });
    shutdown("SIGTERM");
  });
  assert.equal(result, 1);
  assert.equal(closed, 1);
  assert.equal(forced, 1);
});
test("database disconnect error results in failed shutdown", async () => {
  const result = await new Promise(resolve => createShutdown({ server: { close(cb) { cb(); } }, disconnect: async () => { throw new Error("failure"); }, markDraining() {}, exit: resolve, logger })("SIGTERM"));
  assert.equal(result, 1);
});
