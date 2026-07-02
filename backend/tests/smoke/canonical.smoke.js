const assert = require("node:assert/strict");

process.env.FRONTEND_URL = "https://armandomora.dev";

const { validateCanonicalBaseUrl } = require("../../src/utils/canonicalUrl");

assert.throws(() => validateCanonicalBaseUrl("javascript:alert(1)", { optional: false }));
assert.throws(() => validateCanonicalBaseUrl("https://evil.example.com", { optional: false }));

const ok = validateCanonicalBaseUrl("https://armandomora.dev", { optional: false });
assert.equal(ok, "https://armandomora.dev");

console.log("canonical.smoke.js passed");
