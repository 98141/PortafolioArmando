/**
 * Suspicious activity logs — never log secrets, tokens, cookies, or passwords.
 */

const sanitize = (meta = {}) => {
  const safe = {};
  if (meta.requestId) safe.requestId = meta.requestId;
  if (meta.ip) safe.ip = meta.ip;
  if (meta.route) safe.route = meta.route;
  if (meta.method) safe.method = meta.method;
  if (meta.email) safe.email = meta.email;
  if (meta.endpoint) safe.endpoint = meta.endpoint;
  if (meta.publicId) safe.publicId = meta.publicId;
  if (meta.reason) safe.reason = meta.reason;
  if (meta.statusCode) safe.statusCode = meta.statusCode;
  return safe;
};

const logSecurityEvent = (event, message, meta = {}) => {
  console.warn(`[security:${event}]`, {
    message,
    ...sanitize(meta),
  });
};

module.exports = { logSecurityEvent };
