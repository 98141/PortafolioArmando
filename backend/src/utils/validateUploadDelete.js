const AppError = require("./AppError");

const PORTFOLIO_PREFIX = "portfolio/";

const validateDeletePayload = (publicId, resourceType) => {
  if (!publicId || typeof publicId !== "string") {
    throw new AppError("publicId is required", 400);
  }

  const trimmedPublicId = publicId.trim();

  if (!trimmedPublicId.startsWith(PORTFOLIO_PREFIX)) {
    throw new AppError("publicId must belong to portfolio namespace", 403);
  }

  if (
    trimmedPublicId.includes("..") ||
    trimmedPublicId.includes("\\") ||
    trimmedPublicId.includes("<") ||
    trimmedPublicId.includes(">")
  ) {
    throw new AppError("Invalid publicId format", 400);
  }

  if (resourceType !== "image" && resourceType !== "raw") {
    throw new AppError("resourceType must be image or raw", 400);
  }

  return { publicId: trimmedPublicId, resourceType };
};

module.exports = { validateDeletePayload, PORTFOLIO_PREFIX };
