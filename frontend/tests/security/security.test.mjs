import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import loadTs from "./load-ts.cjs";
const require = createRequire(import.meta.url);
const axios = require("axios");
const { renderToStaticMarkup } = require("react-dom/server");
const React = require("react");
const config = { apiBaseUrl: "https://api.armandomora.com.co/api" };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("JSON-LD payloads cannot close their script element and round-trip without losing text", () => {
  const safe = loadTs("src/lib/serializeJsonLd.ts");
  const { default: JsonLd } = loadTs("src/components/seo/JsonLd.tsx", { "@/src/lib/serializeJsonLd": safe });
  const data = { name: '</script><script>alert("x")</script><!--', description: "Texto <b> & español \u2028" };
  const html = renderToStaticMarkup(React.createElement(JsonLd, { data }));
  assert.equal((html.match(/<script/g) || []).length, 1);
  assert.equal((html.match(/<\/script>/g) || []).length, 1);
  const encoded = html.match(/>(.*)<\/script>/s)[1];
  assert.deepEqual(JSON.parse(encoded), data);
  assert.ok(!encoded.includes("<"));
});

test("admin proxy permits session validation without an API-domain cookie and prevents caching/indexing", () => {
  const { proxy } = loadTs("src/proxy.ts");
  const response = proxy();
  assert.equal(response.headers.get("location"), null);
  assert.equal(response.headers.get("x-middleware-next"), "1");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
});

function apiModule(browser = true) {
  const redirects = [];
  const window = { location: { pathname: "/admin/projects", origin: "https://armandomora.com.co", replace: (url) => redirects.push(url) } };
  return { ...loadTs("src/services/api.ts", { "@/src/lib/publicConfig": config }, browser ? { window } : {}), redirects };
}
function result(request, status, data = {}) {
  const response = { config: request, status, statusText: String(status), headers: {}, data };
  if (status >= 400) throw new axios.AxiosError("fixture", "ERR_BAD_RESPONSE", request, {}, response);
  return response;
}

test("simultaneous and late 401s share one refresh and retry their private requests", async () => {
  const { api } = apiModule();
  let refreshes = 0;
  api.defaults.adapter = async (request) => {
    if (request.url === "/auth/refresh-token") { refreshes++; await wait(5); return result(request, 200); }
    if (!request._retry) { if (request.url.endsWith("slow")) await wait(25); return result(request, 401); }
    return result(request, 200, { saved: true });
  };
  const responses = await Promise.all(["/admin/fast", "/admin/other", "/admin/slow"].map((url) => api.get(url)));
  assert.equal(refreshes, 1); assert.ok(responses.every((response) => response.status === 200));
});
test("failed refresh terminates without a loop and redirects only on an auth failure", async () => {
  const { api, redirects } = apiModule();
  let attempts = 0;
  api.defaults.adapter = async (request) => { attempts++; return result(request, 401); };
  await assert.rejects(api.get("/auth/me"));
  assert.equal(attempts, 2); assert.deepEqual(redirects, ["https://armandomora.com.co/admin/login"]);
});
test("public and login failures never refresh; server-side failures never navigate", async () => {
  for (const browser of [true, false]) {
    const { api, redirects } = apiModule(browser); const seen = [];
    api.defaults.adapter = async (request) => { seen.push(request.url); return result(request, 401); };
    await assert.rejects(api.get(browser ? "/projects" : "/auth/me"));
    await assert.rejects(api.post("/auth/login"));
    assert.equal(seen.length, 2); assert.deepEqual(redirects, []);
  }
});
test("a temporary refresh outage does not redirect or repeat writes", async () => {
  const { api, redirects } = apiModule(); const seen = [];
  api.defaults.adapter = async (request) => { seen.push(request.url); return result(request, request.url === "/auth/refresh-token" ? 503 : 401); };
  await assert.rejects(api.post("/admin/projects", { title: "test" }));
  assert.deepEqual(seen, ["/admin/projects", "/auth/refresh-token"]); assert.deepEqual(redirects, []);
});
test("multipart upload refreshes once on 401 and retries the intact file without setting Content-Type", async () => {
  let refreshes = 0; const sent = [];
  const { uploadService } = loadTs("src/services/uploadService.ts", {
    "@/src/lib/publicConfig": config, "@/src/services/api": { refreshSession: async () => { refreshes++; } },
  }, { fetch: async (_url, options) => {
    sent.push(options); return new Response(JSON.stringify({ data: { publicId: "new" } }), { status: sent.length === 1 ? 401 : 201 });
  } });
  const file = new File(["%PDF"], "cv.pdf", { type: "application/pdf" });
  const uploaded = await uploadService.uploadCv(file);
  assert.equal(uploaded.publicId, "new"); assert.equal(refreshes, 1); assert.equal(sent.length, 2);
  assert.equal(sent[0].body, sent[1].body); assert.equal(await sent[1].body.get("file").text(), "%PDF");
  assert.equal(sent[0].credentials, "include"); assert.equal(sent[0].headers, undefined);
});
test("multipart upload stops after a second 401", async () => {
  let calls = 0;
  const { uploadService } = loadTs("src/services/uploadService.ts", {
    "@/src/lib/publicConfig": config, "@/src/services/api": { refreshSession: async () => {} },
  }, { fetch: async () => { calls++; return new Response("{}", { status: 401 }); } });
  await assert.rejects(uploadService.uploadCv(new File(["pdf"], "cv.pdf"))); assert.equal(calls, 2);
});

function findInput(tree) {
  if (tree?.type === "input") return tree;
  const children = tree?.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = child && findInput(child); if (found) return found;
  }
}
for (const fails of [false, true]) {
  test(`file field retains the saved asset until persistence (upload ${fails ? "fails" : "succeeds"})`, async () => {
    const changes = []; let deletions = 0;
    const uploadService = { uploadProjectImage: async () => { if (fails) throw new Error("offline"); return { publicId: "new" }; },
      tryDeleteUploadedAsset: async () => { deletions++; } };
    const { default: Field } = loadTs("src/components/admin/uploads/FileUploadField.tsx", {
      react: { ...React, useMemo: (fn) => fn(), useState: (initial) => [initial, () => {}], useRef: (v) => ({ current: v }), useId: () => "file", useEffect: () => {} },
      "./UploadForm": { useUploadForm: () => null },
      "next/image": () => null, "@/src/services/uploadService": { uploadService },
    });
    const tree = Field({ label: "Image", value: { publicId: "old", url: "https://example.com/old.png" }, onChange: (value) => changes.push(value),
      uploadType: "project-image", accept: "image/png", maxSize: 1000, previewType: "image" });
    await findInput(tree).props.onChange({ target: { files: [new File(["png"], "new.png")] } });
    assert.equal(deletions, 0); assert.equal(changes.length, fails ? 0 : 1);
    if (!fails) assert.equal(changes[0].publicId, "new");
  });
}
test("session checks coalesce and cannot resurrect a session after logout", async () => {
  let resolveMe, checks = 0;
  const authService = { getMe: () => { checks++; return new Promise((resolve) => { resolveMe = resolve; }); }, logout: async () => {} };
  const { useAuthStore } = loadTs("src/store/authStore.ts", { "@/src/services/authService": { authService } });
  const first = useAuthStore.getState().checkSession(); const second = useAuthStore.getState().checkSession();
  assert.equal(checks, 1);
  await useAuthStore.getState().logout(); resolveMe({ name: "old" }); await Promise.all([first, second]);
  assert.equal(useAuthStore.getState().isAuthenticated, false); assert.equal(useAuthStore.getState().user, null);
});
test("failed logout does not pretend the server session was closed", async () => {
  const authService = { login: async () => ({ name: "admin" }), logout: async () => { throw new Error("offline"); } };
  const { useAuthStore } = loadTs("src/store/authStore.ts", { "@/src/services/authService": { authService } });
  await useAuthStore.getState().login("test", "test");
  await assert.rejects(useAuthStore.getState().logout());
  assert.equal(useAuthStore.getState().isAuthenticated, true); assert.ok(useAuthStore.getState().error);
});
