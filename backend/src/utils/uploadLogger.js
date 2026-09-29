/**
 * Controlled operational logs for upload/delete flows.
 * Never log secrets, cookies, tokens, file buffers, or SDK objects.
 */

const REDACTED = "[redacted]";
const MAX_TEXT = 1500;

const secretValues = () =>
  [
    process.env.CLOUDINARY_API_SECRET,
    process.env.CLOUDINARY_API_KEY,
    process.env.MONGO_URI,
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_REFRESH_SECRET,
    process.env.RESEND_API_KEY,
  ].filter((value) => typeof value === "string" && value.length >= 8);

const redact = (value) => {
  if (value == null) return undefined;
  let text = String(value);
  for (const secret of secretValues()) {
    if (text.includes(secret)) text = text.split(secret).join(REDACTED);
  }
  text = text
    .replace(/mongodb(?:\+srv)?:\/\/\S+/gi, REDACTED)
    .replace(/cloudinary:\/\/\S+/gi, REDACTED)
    .replace(/\b(?:bearer|basic)\s+[a-z0-9._~+/=-]+/gi, REDACTED)
    .replace(
      /\b(?:api[_-]?key|api[_-]?secret|authorization|password|cookie|token|secret)\b\s*[:=]\s*\S+/gi,
      REDACTED
    );
  return text.slice(0, MAX_TEXT);
};

const primitive = (value) =>
  typeof value === "string" || typeof value === "number" ? value : undefined;

const sanitizeMeta = (meta = {}) => {
  const safe = {};
  if (meta.endpoint) safe.endpoint = redact(meta.endpoint);
  if (meta.publicId) safe.publicId = redact(meta.publicId).slice(0, 200);
  if (meta.resourceType) safe.resourceType = redact(meta.resourceType);
  if (meta.requestId) safe.requestId = redact(meta.requestId).slice(0, 64);
  if (meta.phase) safe.phase = redact(meta.phase);
  if (meta.route) safe.route = redact(String(meta.route).split("?")[0]).slice(0, 300);
  if (meta.reason) safe.reason = redact(meta.reason).slice(0, 120);
  if (Number.isInteger(meta.statusCode)) safe.statusCode = meta.statusCode;
  if (Number.isInteger(meta.providerStatus)) safe.providerStatus = meta.providerStatus;
  if (primitive(meta.providerCode) !== undefined) safe.providerCode = primitive(meta.providerCode);
  return safe;
};

const providerDetails = (err) => ({
  providerStatus: Number.isInteger(err?.http_code) ? err.http_code : undefined,
  providerCode: primitive(err?.code),
});

const buildSafeErrorLog = (err, req, extras = {}) => ({
  requestId: req?.requestId,
  method: req?.method,
  route: typeof req?.originalUrl === "string" ? req.originalUrl.split("?")[0] : undefined,
  phase: extras.phase || (typeof err?.phase === "string" ? err.phase : undefined),
  name: err?.name,
  message: redact(err?.message) || "Unknown error",
  code: primitive(err?.code),
  statusCode: Number.isInteger(err?.statusCode) ? err.statusCode : undefined,
  providerStatus: Number.isInteger(err?.http_code) ? err.http_code : undefined,
  stack: redact(err?.stack),
});

const logUploadFailure = (context, err, meta = {}) => {
  console.error(`[upload:${context}]`, {
    phase: meta.phase || "provider",
    message: redact(err?.message) || "Unknown upload error",
    name: err?.name,
    stack: redact(err?.stack),
    ...providerDetails(err),
    ...sanitizeMeta(meta),
  });
};

const logDeleteFailure = (context, err, meta = {}) => {
  console.error(`[upload:delete:${context}]`, {
    phase: meta.phase || "cleanup",
    message: redact(err?.message) || "Unknown delete error",
    name: err?.name,
    stack: redact(err?.stack),
    ...providerDetails(err),
    ...sanitizeMeta(meta),
  });
};

module.exports = {
  logUploadFailure,
  logDeleteFailure,
  buildSafeErrorLog,
  redact,
};
