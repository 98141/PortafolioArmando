const AppError = require("../utils/AppError");
const { buildSafeErrorLog, logUploadFailure } = require("../utils/uploadLogger");

const handleCastErrorDB = () =>
  new AppError("The requested resource was not found", 404);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  return new AppError(`Duplicate value for ${field}`, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors || {}).map((e) => e.message);
  const message = errors.length ? errors.join(". ") : "Validation failed";
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again.", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res, req, originalErr) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error("ERROR:", buildSafeErrorLog(originalErr, req));

  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

const globalErrorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, res);
  }

  let error = Object.assign(new Error(err.message), {
    name: err.name,
    code: err.code,
    statusCode: err.statusCode,
    status: err.status,
    isOperational: err.isOperational,
    phase: err.phase,
    http_code: err.http_code,
  });
  error.stack = err.stack;

  if (err.name === "CastError") error = handleCastErrorDB();
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_UNEXPECTED_FILE") {
    logUploadFailure("request", err, {
      phase: "validation",
      requestId: req.requestId,
      route: req.originalUrl,
      providerCode: err.code,
    });
    error = err.code === "LIMIT_FILE_SIZE"
      ? new AppError("File too large", 413)
      : new AppError("Unexpected file field", 400);
    error.phase = "validation";
  }
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  return sendErrorProd(error, res, req, err);
};

module.exports = globalErrorHandler;
