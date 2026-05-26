const AppError = require("../utils/AppError");
const { logSecurityEvent } = require("../utils/securityLogger");
const { writeAudit } = require("../services/audit.service");

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logSecurityEvent("access_denied", "Admin access denied", {
        requestId: req.requestId,
        ip: req.ip,
        route: req.originalUrl,
        method: req.method,
      });

      writeAudit({
        actor: req.user,
        action: "auth.access_denied",
        entityType: "auth",
        req,
        severity: "warning",
        metadata: { requiredRoles: roles },
      }).catch(() => {});

      return next(new AppError("You do not have permission to perform this action", 403));
    }

    next();
  };

module.exports = restrictTo;
