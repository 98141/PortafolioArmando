const AppError = require("./AppError");

const BLOCKED_PROTOCOLS = new Set(["javascript:", "data:", "vbscript:", "file:"]);

const getAllowedCanonicalHosts = () => {
  const fromEnv = (process.env.ALLOWED_CANONICAL_HOSTS || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

  if (fromEnv.length > 0) {
    return fromEnv;
  }

  try {
    const frontendHost = new URL(process.env.FRONTEND_URL || "http://localhost:3000")
      .hostname;
    return [frontendHost.toLowerCase()];
  } catch {
    return ["localhost"];
  }
};

const validateCanonicalBaseUrl = (url, { optional = true } = {}) => {
  if (!url || url === "") {
    if (optional) return undefined;
    throw new AppError("canonicalBaseUrl is required", 400);
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new AppError("canonicalBaseUrl must be a valid URL", 400);
  }

  if (BLOCKED_PROTOCOLS.has(parsed.protocol)) {
    throw new AppError("canonicalBaseUrl uses an unsafe protocol", 400);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError("canonicalBaseUrl must use http or https", 400);
  }

  if (parsed.username || parsed.password) {
    throw new AppError("canonicalBaseUrl must not include credentials", 400);
  }

  const allowedHosts = getAllowedCanonicalHosts();
  const hostname = parsed.hostname.toLowerCase();

  if (!allowedHosts.includes(hostname)) {
    throw new AppError(
      `canonicalBaseUrl domain "${hostname}" is not in the allowed list`,
      400
    );
  }

  return parsed.origin;
};

module.exports = {
  validateCanonicalBaseUrl,
  getAllowedCanonicalHosts,
};
