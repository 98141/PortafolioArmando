/**
 * Environment validation — fail fast on startup.
 */

const REQUIRED_ALWAYS = [
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "FRONTEND_URL",
];

const REQUIRED_PRODUCTION = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const validateEnv = () => {
  const missing = [];
  const isProduction = process.env.NODE_ENV === "production";

  for (const key of REQUIRED_ALWAYS) {
    if (!process.env[key]?.trim()) {
      missing.push(key);
    }
  }

  if (isProduction) {
    for (const key of REQUIRED_PRODUCTION) {
      if (!process.env[key]?.trim()) {
        missing.push(key);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (process.env.PORT && (!/^\d+$/.test(process.env.PORT) || Number(process.env.PORT) < 1 || Number(process.env.PORT) > 65535)) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  let frontend;
  try {
    frontend = new URL(process.env.FRONTEND_URL);
  } catch {
    throw new Error("FRONTEND_URL must be a valid URL");
  }
  if (!["http:", "https:"].includes(frontend.protocol) || frontend.origin !== process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL must be an exact HTTP(S) origin, without a trailing slash or path");
  }
  if (isProduction && frontend.protocol !== "https:") throw new Error("FRONTEND_URL must use HTTPS in production");
  if (process.env.COOKIE_SECURE && !["true", "false"].includes(process.env.COOKIE_SECURE)) throw new Error("COOKIE_SECURE must be true or false");
  if (isProduction && process.env.COOKIE_SECURE === "false") throw new Error("Production cookies must be Secure");
  const sameSite = process.env.COOKIE_SAME_SITE || "lax";
  if (!["lax", "strict", "none"].includes(sameSite)) throw new Error("Invalid COOKIE_SAME_SITE");
  const secure = process.env.COOKIE_SECURE === "true" || (isProduction && process.env.COOKIE_SECURE !== "false");
  if (sameSite === "none" && !secure) throw new Error("SameSite=None requires Secure cookies");
  if (process.env.TRUST_PROXY && !/^\d+$/.test(process.env.TRUST_PROXY)) throw new Error("TRUST_PROXY must be a non-negative hop count");
  for (const key of ["JWT_ACCESS_EXPIRES_IN", "JWT_REFRESH_EXPIRES_IN"]) {
    if (process.env[key] && !/^[1-9]\d*[smhd]$/.test(process.env[key])) throw new Error(`${key} must be a positive duration such as 15m or 7d`);
  }
  if (isProduction) {
    for (const key of ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"]) {
      if (process.env[key].length < 32 || /your_|change.?me|example/i.test(process.env[key])) throw new Error(`${key} must be a strong secret of at least 32 characters`);
    }
    if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) throw new Error("JWT secrets must be different");
  }
};

module.exports = { validateEnv };
