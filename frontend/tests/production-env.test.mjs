import assert from "node:assert/strict";
import { test } from "node:test";
import { validateProductionEnv } from "../config/production-env.mjs";

const valid = {
  NEXT_PUBLIC_SITE_URL: "https://armandomora.com.co",
  NEXT_PUBLIC_API_URL: "https://api.armandomora.com.co/api",
};

test("accepts public HTTPS origins with an API path and optional trailing slash", () => {
  validateProductionEnv(valid);
  validateProductionEnv({ ...valid, NEXT_PUBLIC_SITE_URL: `${valid.NEXT_PUBLIC_SITE_URL}/` });
});

for (const key of Object.keys(valid)) {
  for (const value of [undefined, "", "/api", "http://armandomora.com.co", "http://localhost:5000/api",
    "https://localhost:3000", "https://dev.localhost", "https://localhost.",
    "https://127.0.0.1", "https://127.2.3.4", "https://[::1]", "https://0.0.0.0",
    "https://host.local", "https://user:password@example.com", "https://example.com/?preview=1",
    "https://example.com/#preview"]) {
    test(`rejects ${key}=${value}`, () => {
      assert.throws(() => validateProductionEnv({ ...valid, [key]: value }), new RegExp(key));
    });
  }
}

test("rejects a site path that would diverge from canonical origins", () => {
  assert.throws(() => validateProductionEnv({ ...valid, NEXT_PUBLIC_SITE_URL: "https://example.com/portfolio" }), /no path/);
});
