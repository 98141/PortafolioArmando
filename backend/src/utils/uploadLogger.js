/**
 * Controlled operational logs for upload/delete flows.
 * Never log secrets, cookies, tokens, or file buffers.
 */

const sanitizeMeta = (meta = {}) => {
  const safe = {};
  if (meta.endpoint) safe.endpoint = meta.endpoint;
  if (meta.publicId) safe.publicId = meta.publicId;
  if (meta.resourceType) safe.resourceType = meta.resourceType;
  if (meta.statusCode) safe.statusCode = meta.statusCode;
  return safe;
};

const logUploadFailure = (context, err, meta = {}) => {
  console.error(`[upload:${context}]`, {
    message: err?.message || "Unknown upload error",
    ...sanitizeMeta(meta),
  });
};

const logDeleteFailure = (context, err, meta = {}) => {
  console.error(`[upload:delete:${context}]`, {
    message: err?.message || "Unknown delete error",
    ...sanitizeMeta(meta),
  });
};

module.exports = { logUploadFailure, logDeleteFailure };
