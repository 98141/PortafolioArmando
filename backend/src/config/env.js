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

  if (process.env.PORT && Number.isNaN(Number(process.env.PORT))) {
    throw new Error("PORT must be a valid number");
  }

  try {
    new URL(process.env.FRONTEND_URL);
  } catch {
    throw new Error("FRONTEND_URL must be a valid URL");
  }
};

module.exports = { validateEnv };
