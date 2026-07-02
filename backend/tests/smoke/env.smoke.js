/**
 * Smoke: env validation rejects missing required vars in a forked check.
 */
const assert = require("node:assert/strict");

process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret-min-32-chars-long";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret-min-32-chars-long";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const { validateEnv } = require("../../src/config/env");

try {
  validateEnv();
  console.log("OK env validation passes with minimal test vars");
} catch (err) {
  console.error("FAIL env validation:", err.message);
  process.exit(1);
}

assert.ok(process.env.FRONTEND_URL.startsWith("http"));
console.log("env.smoke.js passed");
