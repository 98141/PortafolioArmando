const AppError = require("../utils/AppError");

const validateRequest = (schema, source = "body") => (req, res, next) => {
  const data = req[source];

  const result = schema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : source;
      return `${path}: ${issue.message}`;
    });

    return next(new AppError(issues.join(". "), 400));
  }

  if (source === "query") {
    Object.defineProperty(req, source, {
      value: result.data, writable: true, configurable: true, enumerable: true,
    });
  } else {
    req[source] = result.data;
  }
  next();
};

module.exports = validateRequest;
