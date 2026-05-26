const AppError = require("../utils/AppError");

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

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error("ERROR:", err);

  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

const globalErrorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    let error = { ...err, message: err.message, name: err.name };

    if (err.name === "CastError") error = handleCastErrorDB();
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);
    if (err.code === "LIMIT_FILE_SIZE") error = new AppError("File too large", 413);
    if (err.code === "LIMIT_UNEXPECTED_FILE")
      error = new AppError("Unexpected file field", 400);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    return sendErrorDev(error, res);
  }

  let error = { ...err, message: err.message, name: err.name };

  if (err.name === "CastError") error = handleCastErrorDB();
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.code === "LIMIT_FILE_SIZE") error = new AppError("File too large", 413);
  if (err.code === "LIMIT_UNEXPECTED_FILE")
    error = new AppError("Unexpected file field", 400);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  return sendErrorProd(error, res);
};

module.exports = globalErrorHandler;
