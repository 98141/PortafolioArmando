const cloudinary = require("cloudinary").v2;

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

const isProduction = process.env.NODE_ENV === "production";

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  if (isProduction) {
    // Avoid silent misconfiguration in production.
    throw new Error("Missing Cloudinary env vars (CLOUDINARY_*).");
  }

  // In dev, allow server to boot so you can work without uploads.
  // Upload endpoints will fail at runtime if called.
  // eslint-disable-next-line no-console
  console.warn("Cloudinary env vars are missing; uploads will fail.");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;

