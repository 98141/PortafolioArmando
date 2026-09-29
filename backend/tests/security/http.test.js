const { test, before, after, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// No dotenv, MongoDB connection or Cloudinary request is made by this test suite.
Object.assign(process.env, { NODE_ENV: "production", FRONTEND_URL: "https://armandomora.com.co",
  JWT_ACCESS_SECRET: "test-access-" + "a".repeat(40), JWT_REFRESH_SECRET: "test-refresh-" + "b".repeat(40),
  CLOUDINARY_CLOUD_NAME: "fixture", CLOUDINARY_API_KEY: "fixture", CLOUDINARY_API_SECRET: "fixture", TRUST_PROXY: "0" });
require("mongoose").set("bufferCommands", false);
const User = require("../../src/models/user.model");
const Settings = require("../../src/models/siteSettings.model");
const Audit = require("../../src/models/auditLog.model");
const upload = require("../../src/services/upload.service");
const models = ["project", "cyberLab", "certification", "education", "blogPost"].map((name) => require(`../../src/models/${name}.model`));
const rates = require("../../src/middlewares/rateLimiters");
let user, settings, calls, audit, uploadFailure, saveFailure, deleteFailure, referenced;
const userId = "507f1f77bcf86cd799439011";
const passwordHash = bcrypt.hashSync("FixturePassword123!", 4);
const snapshot = () => user && ({ ...user, changedPasswordAfter: () => false,
  async save() { user = { ...this }; delete user.save; delete user.changedPasswordAfter; } });
const queryUser = (found) => ({ select: async () => found ? snapshot() : null });
mock.method(User, "findOne", ({ email }) => queryUser(user && email === user.email));
mock.method(User, "findById", (id) => queryUser(user && String(id) === userId));
mock.method(User, "findOneAndUpdate", async (filter, update) => {
  if (!Object.entries(filter).every(([key, value]) => String(user?.[key]) === String(value))) return null;
  Object.assign(user, update.$set);
  return snapshot();
});
mock.method(User, "updateOne", async (filter, update) => {
  if (user?.sessionId === filter.sessionId && String(filter._id) === userId) {
    for (const key of Object.keys(update.$unset)) delete user[key];
  }
  return { acknowledged: true };
});
mock.method(Audit, "create", async (entry) => { audit.push(entry); return entry; });
mock.method(Settings, "findOne", async () => settings);
mock.method(Settings, "updateMany", async () => ({ acknowledged: true }));
mock.method(Settings, "create", async () => { throw new Error("Public GET must not create settings"); });
mock.method(Settings, "findOneAndUpdate", async (_filter, update) => {
  calls.push("save");
  if (saveFailure) {
    if (saveFailure === "ambiguous") settings.cv = update.$set.cv;
    throw new Error("simulated persistence failure");
  }
  const previous = settings ? structuredClone(settings) : null;
  settings ||= { _id: userId };
  if (update.$set?.cv) settings.cv = update.$set.cv;
  if (update.$unset?.cv) delete settings.cv;
  return previous;
});
mock.method(Settings, "exists", async (filter) => filter.$or.some((condition) =>
  Object.values(condition).includes(settings?.cv?.publicId)) ? { _id: userId } : null);
for (const model of models) mock.method(model, "exists", async () => referenced ? { _id: userId } : null);
mock.method(upload, "uploadPdfToCloudinary", async () => {
  calls.push("upload");
  if (uploadFailure) throw new Error("simulated Cloudinary upload failure");
  return { publicId: "portfolio/cv/new", resourceType: "raw", secureUrl: "https://example.com/new.pdf", originalName: "new.pdf" };
});
mock.method(upload, "deleteFromCloudinary", async (id) => {
  calls.push(`delete:${id}`);
  if (deleteFailure) throw new Error("simulated Cloudinary delete failure");
});
const app = require("../../src/app");
let server, base;
before(async () => { server = app.listen(0, "127.0.0.1"); await once(server, "listening"); base = `http://127.0.0.1:${server.address().port}`; });
after(async () => { await new Promise((resolve) => server.close(resolve)); mock.restoreAll(); });
beforeEach(() => {
  user = { _id: userId, name: "Fixture", email: "admin@example.test", password: passwordHash, isActive: true, role: "admin" };
  settings = { _id: userId, cv: { publicId: "portfolio/cv/old", url: "https://example.com/old.pdf" } };
  calls = []; audit = []; uploadFailure = saveFailure = deleteFailure = referenced = false;
  for (const limiter of Object.values(rates)) limiter.resetKey("127.0.0.1");
});
const cookies = (res) => res.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
async function request(path, { method = "GET", body, cookie, origin = process.env.FRONTEND_URL } = {}) {
  const headers = {};
  if (origin !== null) headers.Origin = origin;
  if (cookie) headers.Cookie = cookie;
  if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  return fetch(base + path, { method, headers, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
}
async function login() {
  const res = await request("/api/auth/login", { method: "POST", body: { email: user.email, password: "FixturePassword123!" } });
  assert.equal(res.status, 200);
  return res;
}
function pdf() { const form = new FormData(); form.append("file", new Blob(["%PDF-1.4\n%%EOF"], { type: "application/pdf" }), "cv.pdf"); return form; }

test("login uses host-only secure HttpOnly cookies; me omits session secrets; logout revokes access and refresh", async () => {
  const res = await login();
  for (const value of res.headers.getSetCookie()) {
    assert.match(value, /HttpOnly/); assert.match(value, /Secure/); assert.match(value, /SameSite=Lax/); assert.doesNotMatch(value, /Domain=/i);
  }
  const cookie = cookies(res);
  const me = await request("/api/auth/me", { cookie });
  assert.equal(me.status, 200); assert.equal(me.headers.get("cache-control"), "no-store");
  const body = await me.text(); assert.doesNotMatch(body, /sessionId|refreshTokenHash|password/);
  const out = await request("/api/auth/logout", { method: "POST", cookie });
  assert.equal(out.status, 200);
  assert.ok(out.headers.getSetCookie().every((value) => value.includes("Expires=Thu, 01 Jan 1970")));
  assert.equal((await request("/api/auth/me", { cookie })).status, 401);
  assert.equal((await request("/api/auth/refresh-token", { method: "POST", cookie })).status, 401);
});
test("expired access recovers through refresh; rotation is unique and old refresh cannot be replayed", async () => {
  const old = cookies(await login());
  const expired = jwt.sign({ id: userId, sid: user.sessionId }, process.env.JWT_ACCESS_SECRET, { expiresIn: -1 });
  const cookie = old.replace(/accessToken=[^;]+/, `accessToken=${expired}`);
  assert.equal((await request("/api/auth/me", { cookie })).status, 401);
  const refresh = await request("/api/auth/refresh-token", { method: "POST", cookie });
  assert.equal(refresh.status, 200); assert.notEqual(cookies(refresh), old);
  assert.equal((await request("/api/auth/me", { cookie: cookies(refresh) })).status, 200);
  assert.equal((await request("/api/auth/refresh-token", { method: "POST", cookie: old })).status, 401);
});
test("concurrent refresh requests have exactly one winner", async () => {
  const cookie = cookies(await login());
  const results = await Promise.all([1, 2].map(() => request("/api/auth/refresh-token", { method: "POST", cookie })));
  assert.deepEqual(results.map((res) => res.status).sort(), [200, 401]);
});
test("logout from an old session cannot revoke a newer login", async () => {
  const old = cookies(await login()); const current = cookies(await login());
  assert.equal((await request("/api/auth/me", { cookie: old })).status, 401);
  await request("/api/auth/logout", { method: "POST", cookie: old });
  assert.equal((await request("/api/auth/me", { cookie: current })).status, 200);
});
test("forged, deactivated and non-admin sessions are denied", async () => {
  assert.equal((await request("/api/auth/me", { cookie: "accessToken=fake" })).status, 401);
  const cookie = cookies(await login());
  user.isActive = false;
  assert.equal((await request("/api/auth/me", { cookie })).status, 401);
  user.isActive = true; user.role = "viewer";
  assert.equal((await request("/api/auth/me", { cookie })).status, 403);
});
test("hostile, sibling, null and missing origins cannot write; preflight permits only trusted origin", async () => {
  for (const origin of ["https://evil.test", "https://other.armandomora.com.co", "null", null]) {
    assert.equal((await request("/api/auth/logout", { method: "POST", origin })).status, 403);
  }
  const good = await request("/api/auth/login", { method: "OPTIONS" });
  assert.equal(good.headers.get("access-control-allow-origin"), process.env.FRONTEND_URL);
  const bad = await request("/api/auth/login", { method: "OPTIONS", origin: "https://evil.test" });
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
});
test("all admin resource groups require authentication", async () => {
  for (const path of ["projects", "cyber-labs", "certifications", "education", "blog", "site-settings"]) {
    assert.equal((await request(`/api/admin/${path}`)).status, 401);
  }
  assert.equal((await request("/api/admin/uploads/cv", { method: "POST", body: pdf() })).status, 401);
  assert.deepEqual(calls, []);
});
test("public settings GET has no database-write side effect", async () => {
  settings = null;
  const res = await request("/api/site-settings");
  assert.equal(res.status, 200); assert.deepEqual((await res.json()).data.settings, {});
  const admin = await request("/api/admin/site-settings", { cookie: cookies(await login()) });
  assert.equal(admin.status, 200); assert.deepEqual((await admin.json()).data.settings, {});
});
test("saving stale general settings cannot overwrite the separately managed CV", async () => {
  const res = await request("/api/admin/site-settings", { method: "PUT", cookie: cookies(await login()),
    body: { cv: { publicId: "portfolio/cv/stale", url: "https://example.com/stale.pdf" } } });
  assert.equal(res.status, 200);
  assert.equal(settings.cv.publicId, "portfolio/cv/old");
});
test("CV replacement persists the new asset before deleting the previous asset", async () => {
  const res = await request("/api/admin/uploads/cv", { method: "POST", cookie: cookies(await login()), body: pdf() });
  assert.equal(res.status, 201);
  assert.deepEqual(calls, ["upload", "save", "delete:portfolio/cv/old"]);
  assert.equal(settings.cv.publicId, "portfolio/cv/new");
});
test("failed CV upload leaves the old CV intact", async () => {
  uploadFailure = true;
  const res = await request("/api/admin/uploads/cv", { method: "POST", cookie: cookies(await login()), body: pdf() });
  assert.equal(res.status, 500); assert.deepEqual(calls, ["upload"]);
  assert.equal(settings.cv.publicId, "portfolio/cv/old");
});
test("failed CV save cleans only the unreferenced new upload", async () => {
  saveFailure = true;
  const res = await request("/api/admin/uploads/cv", { method: "POST", cookie: cookies(await login()), body: pdf() });
  assert.equal(res.status, 500); assert.deepEqual(calls, ["upload", "save", "delete:portfolio/cv/new"]);
  assert.equal(settings.cv.publicId, "portfolio/cv/old");
});
test("uncertain persistence outcome does not delete a new asset that was actually committed", async () => {
  saveFailure = "ambiguous";
  const res = await request("/api/admin/uploads/cv", { method: "POST", cookie: cookies(await login()), body: pdf() });
  assert.equal(res.status, 500); assert.deepEqual(calls, ["upload", "save"]);
  assert.equal(settings.cv.publicId, "portfolio/cv/new");
});
test("cleanup failure is audited without undoing a successful CV replacement", async () => {
  deleteFailure = true;
  const res = await request("/api/admin/uploads/cv", { method: "POST", cookie: cookies(await login()), body: pdf() });
  assert.equal(res.status, 201); assert.equal(settings.cv.publicId, "portfolio/cv/new");
  assert.ok(audit.some((entry) => entry.action === "upload.cleanup_failed"));
});
test("CV deletion removes its reference before Cloudinary; failed save never deletes the file", async () => {
  const cookie = cookies(await login()); saveFailure = true;
  assert.equal((await request("/api/admin/site-settings/cv", { method: "DELETE", cookie })).status, 500);
  assert.deepEqual(calls, ["save"]);
  calls = []; saveFailure = false;
  assert.equal((await request("/api/admin/site-settings/cv", { method: "DELETE", cookie })).status, 200);
  assert.deepEqual(calls, ["save", "delete:portfolio/cv/old"]); assert.equal(settings.cv, undefined);
});
test("generic deletion refuses an asset referenced by saved or soft-deleted content", async () => {
  referenced = true;
  const res = await request("/api/admin/uploads", { method: "DELETE", cookie: cookies(await login()), body: { publicId: "portfolio/projects/saved", resourceType: "image" } });
  assert.equal(res.status, 409); assert.deepEqual(calls, []);
});
