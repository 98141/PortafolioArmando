import { test } from "node:test";
import assert from "node:assert/strict";
import loadTs from "./load-ts.cjs";

function content(fetch) {
  return loadTs("src/lib/publicContent.ts", {
    react: { cache: fn => fn },
    "next/navigation": { notFound() { throw new Error("HTTP_NOT_FOUND"); } },
    "@/src/lib/publicConfig": { apiBaseUrl: "https://api.example.test/api" },
  }, { fetch, URLSearchParams, AbortSignal });
}
test("empty published content remains empty", async () => {
  const api = content(async () => Response.json({ status: "success", data: { projects: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } } }));
  assert.equal((await api.getPublicList("projects")).items.length, 0);
});
test("detail 404 is distinguished from API errors and invalid responses", async () => {
  await assert.rejects(content(async () => new Response(null, { status: 404 })).getPublicDetail("blog", "missing"), /HTTP_NOT_FOUND/);
  for (const fetch of [async () => new Response(null, { status: 500 }), async () => { throw new Error("offline"); }, async () => Response.json({ data: {} })]) {
    await assert.rejects(content(fetch).getPublicDetail("blog", "outage"), /No se pudo cargar/);
  }
});
test("all sitemap pages are requested with limit 50, including final partial page", async () => {
  const calls = [];
  const api = content(async url => {
    const query = new URL(url).searchParams;
    const page = Number(query.get("page"));
    calls.push([page, Number(query.get("limit"))]);
    return Response.json({ status: "success", data: { projects: Array.from({ length: page === 3 ? 7 : 50 }, (_, i) => ({ slug: `item-${(page - 1) * 50 + i}`, title: "Fixture" })), pagination: { page, limit: 50, total: 107, totalPages: 3 } } });
  });
  assert.equal((await api.getAllPublicItems("projects")).length, 107);
  assert.deepEqual(calls, [[1, 50], [2, 50], [3, 50]]);
});
test("sitemap page failure rejects instead of returning an incomplete sitemap", async () => {
  const api = content(async url => new URL(url).searchParams.get("page") === "2" ? new Response(null, { status: 503 }) :
    Response.json({ status: "success", data: { posts: [{ slug: "post-one", title: "Post" }], pagination: { page: 1, limit: 50, total: 51, totalPages: 2 } } }));
  await assert.rejects(api.getAllPublicItems("blog"), /No se pudo cargar/);
});
test("filters are encoded as values and cannot inject extra API parameters", async () => {
  const api = content(async url => {
    const query = new URL(url).searchParams;
    assert.equal(query.get("search"), "hola&isActive=false");
    assert.equal(query.get("isActive"), null);
    return Response.json({ status: "success", data: { projects: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } } });
  });
  await api.getPublicList("projects", { search: "hola&isActive=false" });
});
