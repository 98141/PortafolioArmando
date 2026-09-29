const { describe, test, before, after, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { Writable } = require("node:stream");
const bcrypt = require("bcryptjs");

// Simulated Cloudinary and MongoDB. This file does not call the real providers.
Object.assign(process.env, {
  NODE_ENV: "production",
  FRONTEND_URL: "https://armandomora.com.co",
  JWT_ACCESS_SECRET: "test-access-" + "a".repeat(40),
  JWT_REFRESH_SECRET: "test-refresh-" + "b".repeat(40),
  CLOUDINARY_CLOUD_NAME: "fixture",
  CLOUDINARY_API_KEY: "fixture-api-key-value",
  CLOUDINARY_API_SECRET: "fixture-api-secret-value",
  TRUST_PROXY: "0",
});
require("mongoose").set("bufferCommands", false);

const User = require("../../src/models/user.model");
const Settings = require("../../src/models/siteSettings.model");
const Audit = require("../../src/models/auditLog.model");
const cloudinary = require("../../src/config/cloudinary");
const rates = require("../../src/middlewares/rateLimiters");
const contentModels = ["project", "cyberLab", "certification", "education", "blogPost"].map((name) => require(`../../src/models/${name}.model`));

const userId = "507f1f77bcf86cd799439011";
const passwordHash = bcrypt.hashSync("FixturePassword123!", 4);
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF", "utf8");
const routes = [
  ["project-image", "image", "portfolio/projects"],
  ["cyber-evidence", "image", "portfolio/cyber-labs/evidence"],
  ["certification-badge", "image", "portfolio/certifications/badges"],
  ["education-logo", "image", "portfolio/education/logos"],
  ["blog-cover", "image", "portfolio/blog/covers"],
  ["author-avatar", "image", "portfolio/authors"],
  ["cyber-report", "raw", "portfolio/cyber-labs/reports"],
  ["cv", "raw", "portfolio/cv"],
];

let user, settings, uploads, destroyed, audit, failProvider, saveFailure, destroyFailure, referenced;
const snapshot = () => user && ({
  ...user,
  changedPasswordAfter: () => false,
  async save() {
    user = { ...this };
    delete user.save;
    delete user.changedPasswordAfter;
  },
});
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
    for (const key of Object.keys(update.$unset || {})) delete user[key];
  }
  return { acknowledged: true };
});
mock.method(Audit, "create", async (entry) => { audit.push(entry); return entry; });
mock.method(Settings, "findOne", async () => settings);
mock.method(Settings, "updateMany", async () => ({ acknowledged: true }));
mock.method(Settings, "create", async () => { throw new Error("unexpected settings create"); });
mock.method(Settings, "findOneAndUpdate", async (_filter, update) => {
  if (saveFailure) throw new Error("simulated persistence failure");
  const previous = settings ? structuredClone(settings) : null;
  settings ||= { _id: userId };
  if (update.$set?.cv) settings.cv = update.$set.cv;
  if (update.$unset?.cv) delete settings.cv;
  return previous;
});
mock.method(Settings, "exists", async (filter) => filter.$or.some((condition) =>
  Object.values(condition).includes(settings?.cv?.publicId)) ? { _id: userId } : null);
for (const model of contentModels) {
  mock.method(model, "exists", async () => referenced ? { _id: userId } : null);
}
mock.method(cloudinary.uploader, "upload_stream", (options, callback) => {
  uploads.push(options);
  const stream = new Writable({ write(_chunk, _encoding, done) { done(); } });
  stream.on("finish", () => {
    if (failProvider) {
      const error = new Error(`provider rejected secret=${process.env.CLOUDINARY_API_SECRET}`);
      error.http_code = 401;
      error.code = "provider_rejected";
      callback(error);
      return;
    }
    callback(null, {
      resource_type: options.resource_type,
      public_id: `${options.folder}/${options.public_id}`,
      url: "http://fixture.example/asset",
      secure_url: "https://fixture.example/asset",
      bytes: 32,
      format: options.resource_type === "image" ? "png" : undefined,
    });
  });
  return stream;
});
mock.method(cloudinary.uploader, "destroy", async (publicId) => {
  destroyed.push(publicId);
  if (destroyFailure) throw new Error("simulated delete failure");
  return { result: "ok" };
});

const app = require("../../src/app");
let server, base;
const logs = [];
const originalError = console.error;
console.error = (...args) => { logs.push(args); };

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  console.error = originalError;
  await new Promise((resolve) => server.close(resolve));
  mock.restoreAll();
});
beforeEach(() => {
  user = { _id: userId, name: "Fixture", email: "admin@example.test", password: passwordHash, isActive: true, role: "admin" };
  settings = { _id: userId };
  uploads = [];
  destroyed = [];
  audit = [];
  logs.length = 0;
  failProvider = saveFailure = destroyFailure = referenced = false;
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
  return cookies(res);
}
function fileForm(bytes, type, filename) {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type }), filename);
  return form;
}
const imageForm = (filename = "foto.png") => fileForm(png, "image/png", filename);
const pdfForm = (filename = "curriculum") => fileForm(pdfBytes, "application/pdf", filename);
const loggedText = () => JSON.stringify(logs);

describe("upload contract", { concurrency: 1 }, () => {
  test("eight upload routes map to the validated resource type, folder and public id", async () => {
    const cookie = await login();
    const ids = [];
    for (const [endpoint, resourceType, folder] of routes) {
      const body = resourceType === "raw" ? pdfForm("curriculum") : imageForm("foto.png");
      const res = await request(`/api/admin/uploads/${endpoint}`, { method: "POST", cookie, body });
      const json = await res.json();
      assert.equal(res.status, 201, endpoint);
      assert.equal(json.status, "success");
      assert.equal(json.data.resourceType, resourceType);
      assert.equal(json.data.secureUrl, "https://fixture.example/asset");
      assert.equal(json.data.originalName, resourceType === "raw" ? "curriculum" : "foto.png");
      assert.equal(json.stack, undefined);
      const options = uploads.at(-1);
      assert.equal(options.folder, folder);
      assert.equal(options.resource_type, resourceType);
      assert.equal(options.overwrite, false);
      if (resourceType === "raw") {
        assert.match(options.public_id, /^curriculum-[0-9a-f-]{36}\.pdf$/);
        assert.match(json.data.publicId, /\/curriculum-[0-9a-f-]{36}\.pdf$/);
      } else {
        assert.match(options.public_id, /^foto-[0-9a-f-]{36}$/);
        assert.equal(options.public_id.endsWith(".png"), false);
        assert.equal(options.public_id.endsWith(".pdf"), false);
      }
      ids.push(options.public_id);
    }
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(settings.cv.publicId.endsWith(".pdf"), true);
    assert.equal(settings.cv.fileName, "curriculum");
  });

  test("an image whose filename ends in .pdf keeps an image identifier", async () => {
    const cookie = await login();
    const res = await request("/api/admin/uploads/project-image", { method: "POST", cookie, body: imageForm("foto.pdf") });
    assert.equal(res.status, 201);
    assert.equal(uploads[0].resource_type, "image");
    assert.equal(uploads[0].public_id.endsWith(".pdf"), false);
    assert.equal(uploads[0].overwrite, false);
  });

  test("invalid content, a dangerous name and an oversized file are rejected before Cloudinary", async () => {
    const cookie = await login();
    const bad = await request("/api/admin/uploads/project-image", {
      method: "POST", cookie, body: fileForm(Buffer.from("not-an-image"), "image/png", "nota.png"),
    });
    assert.equal(bad.status, 400);
    const disguised = await request("/api/admin/uploads/cv", {
      method: "POST", cookie, body: fileForm(png, "application/pdf", "fake.pdf"),
    });
    assert.equal(disguised.status, 400);
    const dangerous = await request("/api/admin/uploads/cv", {
      method: "POST", cookie, body: fileForm(pdfBytes, "application/pdf", "cv.pdf.exe"),
    });
    assert.equal(dangerous.status, 400);
    const oversized = await request("/api/admin/uploads/project-image", {
      method: "POST", cookie, body: fileForm(Buffer.alloc(5 * 1024 * 1024 + 1), "image/png", "grande.png"),
    });
    assert.equal(oversized.status, 413);
    assert.match(await oversized.text(), /File too large/);
    assert.equal(uploads.length, 0);
    assert.match(loggedText(), /"phase":"validation"/);
    assert.doesNotMatch(loggedText(), /fixture-api-secret-value/);
  });

  test("uploads without a session, without the admin role or from another origin never reach Cloudinary", async () => {
    assert.equal((await request("/api/admin/uploads/project-image", { method: "POST", body: imageForm() })).status, 401);
    const cookie = await login();
    user.role = "viewer";
    assert.equal((await request("/api/admin/uploads/project-image", { method: "POST", cookie, body: imageForm() })).status, 403);
    user.role = "admin";
    assert.equal((await request("/api/admin/uploads/cv", { method: "POST", cookie, origin: "https://evil.test", body: pdfForm() })).status, 403);
    assert.equal(uploads.length, 0);
  });

  test("a provider failure is distinguishable, sanitized and keeps the previous CV", async () => {
    settings.cv = { publicId: "portfolio/cv/old.pdf", url: "https://fixture.example/old.pdf", fileName: "old.pdf" };
    failProvider = true;
    const cookie = await login();
    const res = await request("/api/admin/uploads/cv", { method: "POST", cookie, body: pdfForm("curriculum") });
    const body = await res.json();
    assert.equal(res.status, 500);
    assert.equal(body.message, "PDF upload failed");
    assert.equal(body.stack, undefined);
    assert.equal(settings.cv.publicId, "portfolio/cv/old.pdf");
    assert.match(loggedText(), /"phase":"provider"/);
    assert.match(loggedText(), /"providerStatus":401/);
    assert.match(loggedText(), new RegExp(res.headers.get("x-request-id")));
    assert.doesNotMatch(loggedText(), /fixture-api-secret-value|fixture-api-key-value/);
    assert.equal(destroyed.length, 0);
  });

  test("a persistence failure is distinguishable and does not leave the previous CV deleted", async () => {
    settings.cv = { publicId: "portfolio/cv/old.pdf", url: "https://fixture.example/old.pdf", fileName: "old.pdf" };
    saveFailure = true;
    const cookie = await login();
    const res = await request("/api/admin/uploads/cv", { method: "POST", cookie, body: pdfForm() });
    const body = await res.json();
    assert.equal(res.status, 500);
    assert.equal(body.message, "Something went wrong");
    assert.equal(body.stack, undefined);
    assert.equal(settings.cv.publicId, "portfolio/cv/old.pdf");
    assert.equal(destroyed.length, 1);
    assert.match(destroyed[0], /\.pdf$/);
    assert.match(loggedText(), /"phase":"persistence"/);
    assert.match(loggedText(), new RegExp(res.headers.get("x-request-id")));
    assert.doesNotMatch(JSON.stringify(body), /stack|fixture-api-secret-value/);
  });

  test("cleanup failure after a saved replacement stays a success and keeps the new CV", async () => {
    settings.cv = { publicId: "portfolio/cv/old.pdf", url: "https://fixture.example/old.pdf", fileName: "old.pdf" };
    destroyFailure = true;
    const cookie = await login();
    const res = await request("/api/admin/uploads/cv", { method: "POST", cookie, body: pdfForm() });
    assert.equal(res.status, 201);
    assert.equal(settings.cv.fileName, "curriculum");
    assert.match(settings.cv.publicId, /\.pdf$/);
    assert.ok(audit.some((entry) => entry.action === "upload.cleanup_failed"));
    assert.match(loggedText(), /"phase":"cleanup"/);
    assert.doesNotMatch(loggedText(), /fixture-api-secret-value/);
  });

  test("a referenced asset is not deleted", async () => {
    referenced = true;
    const cookie = await login();
    const res = await request("/api/admin/uploads", {
      method: "DELETE",
      cookie,
      body: { publicId: "portfolio/projects/saved-file", resourceType: "image" },
    });
    assert.equal(res.status, 409);
    assert.equal(destroyed.length, 0);
  });

  test("the eleventh upload attempt is rate limited", async () => {
    const cookie = await login();
    for (let index = 0; index < 10; index += 1) {
      assert.equal((await request("/api/admin/uploads/project-image", { method: "POST", cookie, body: imageForm() })).status, 201);
    }
    const limited = await request("/api/admin/uploads/project-image", { method: "POST", cookie, body: imageForm() });
    assert.equal(limited.status, 429);
  });
});
