const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { once } = require("node:events");
const { validateEnv } = require("../../src/config/env");
const validate = require("../../src/middlewares/validateRequest");
const sanitize = require("../../src/middlewares/sanitizeRequest");
const { projectQuerySchema } = require("../../src/validators/project.validator");

const valid = { NODE_ENV: "production", PORT: "5000", MONGO_URI: "mongodb://127.0.0.1/test",
  FRONTEND_URL: "https://armandomora.com.co", JWT_ACCESS_SECRET: "a".repeat(48), JWT_REFRESH_SECRET: "b".repeat(48),
  CLOUDINARY_CLOUD_NAME: "fixture", CLOUDINARY_API_KEY: "fixture", CLOUDINARY_API_SECRET: "fixture",
  COOKIE_SECURE: "true", COOKIE_SAME_SITE: "lax", TRUST_PROXY: "1", JWT_ACCESS_EXPIRES_IN: "15m", JWT_REFRESH_EXPIRES_IN: "7d" };
function withEnv(overrides, run) {
  const previous = { ...process.env };
  Object.assign(process.env, valid, overrides);
  try { run(); } finally {
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
}
test("production environment accepts the documented configuration", () => withEnv({}, validateEnv));
for (const [key, value] of [["PORT", "0"], ["PORT", "1.5"], ["PORT", "65536"],
  ["FRONTEND_URL", "https://example.com/"], ["FRONTEND_URL", "http://example.com"],
  ["COOKIE_SECURE", "false"], ["COOKIE_SAME_SITE", "invalid"], ["TRUST_PROXY", "true"],
  ["JWT_ACCESS_SECRET", "short"], ["JWT_REFRESH_SECRET", valid.JWT_ACCESS_SECRET], ["JWT_ACCESS_EXPIRES_IN", "0m"]]) {
  test(`rejects insecure production configuration: ${key}=${value}`, () => withEnv({ [key]: value }, () => assert.throws(validateEnv)));
}
test("SameSite None requires Secure even in development", () => withEnv({ NODE_ENV: "development", COOKIE_SECURE: "false", COOKIE_SAME_SITE: "none" }, () => assert.throws(validateEnv)));

test("Express 5 preserves query transforms and rejects pollution over real HTTP", async () => {
  const app = express();
  app.use(sanitize);
  app.get("/", validate(projectQuerySchema, "query"), (req, res) => res.json(req.query));
  app.use((err, _req, res, _next) => res.status(err.statusCode || 500).json({ message: err.message }));
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(`${base}/?isFeatured=false&search=%20test%20&page=2&unknown=bad&%24where=bad`);
    assert.equal(response.status, 200);
    const query = await response.json();
    assert.equal(query.isFeatured, false);
    assert.equal(query.page, 2);
    assert.equal(query.limit, 12);
    assert.equal(query.search, "test");
    assert.equal(query.unknown, undefined);
    assert.equal(query.$where, undefined);
    assert.equal((await fetch(`${base}/?page=1&page=2`)).status, 400);
    assert.equal((await fetch(`${base}/?limit=200`)).status, 400);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
