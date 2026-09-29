const AppError = require("../utils/AppError");

// CORS controls reads in the browser; it does not stop a cross-origin POST.
module.exports = (req, _res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (!process.env.FRONTEND_URL || req.get("origin") !== process.env.FRONTEND_URL) {
    return next(new AppError("Untrusted or missing request origin", 403));
  }
  next();
};
