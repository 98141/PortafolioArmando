import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
const load = createRequire(import.meta.url)("./load-ts.cjs");
function setup(send, storage = new Map()) {
  return load("src/lib/visitCounter.ts", { "@/src/lib/publicConfig": { apiBaseUrl: "https://api.example.com/api" } }, {
    fetch: send, crypto: { randomUUID }, AbortSignal,
    window: { sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } },
  });
}
test("simultaneous mounts share one request; reloads reuse the persisted session", async () => {
  const storage = new Map(), ids = [];
  const send = async (url, options) => {
    assert.equal(url, "https://api.example.com/api/visits");
    assert.equal(options.credentials, "omit");
    ids.push(JSON.parse(options.body).sessionId);
    return Response.json({ data: { visits: 12 } });
  };
  const counter = setup(send, storage);
  const first = counter.loadVisitCount();
  assert.equal(counter.loadVisitCount(), first);
  assert.equal(await first, 12);
  assert.equal(ids.length, 1);
  await setup(send, storage).loadVisitCount();
  assert.equal(ids[0], ids[1]);
});
test("blocked storage uses a read-only request", async () => {
  const storage = { get() { throw new Error("disabled"); } };
  const counter = setup(async (_url, options) => {
    assert.equal(options.method, "GET");
    assert.equal(options.body, undefined);
    return Response.json({ data: { visits: 0 } });
  }, storage);
  assert.equal(await counter.loadVisitCount(), 0);
});
test("failed requests can retry with the same session; invalid counts never display", async () => {
  const storage = new Map(), ids = [];
  let fail = true;
  const counter = setup(async (_url, options) => {
    ids.push(JSON.parse(options.body).sessionId);
    return fail ? Response.json({}, { status: 503 }) : Response.json({ data: { visits: 3 } });
  }, storage);
  await assert.rejects(counter.loadVisitCount());
  fail = false;
  assert.equal(await counter.loadVisitCount(), 3);
  assert.equal(ids[0], ids[1]);
  for (const visits of [-1, 1.5, "12", null, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(setup(async () => Response.json({ data: { visits } })).loadVisitCount());
  }
});
