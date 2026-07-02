const rateLimit = require("express-rate-limit");

const rateLimitResponse = (message) => ({
  status: "error",
  message,
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: rateLimitResponse(
    "Too many authentication attempts, please try again later."
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: rateLimitResponse(
    "Too many login attempts, please try again in 15 minutes."
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/** POST upload endpoints only — DELETE is not counted toward this limit. */
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: rateLimitResponse(
    "Too many upload attempts, please try again in 15 minutes."
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

module.exports = {
  authRateLimit,
  loginRateLimit,
  uploadRateLimit,
};
