const mongoSanitize = require("mongo-sanitize");
const AppError = require("../utils/AppError");

module.exports = (req, _res, next) => {
  const query = req.query;
  if (Object.values(query).some(Array.isArray)) {
    return next(new AppError("Repeated query parameters are not allowed", 400));
  }
  // Express 5 exposes query through a getter. Materialize it once per request.
  Object.defineProperty(req, "query", {
    value: mongoSanitize(query), writable: true, configurable: true, enumerable: true,
  });
  req.body = mongoSanitize(req.body);
  next();
};
