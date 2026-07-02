const AuditLog = require("../models/auditLog.model");

const writeAudit = async ({
  actor,
  actorEmail,
  action,
  entityType,
  entityId,
  req,
  metadata,
  severity = "info",
}) => {
  try {
    await AuditLog.create({
      actor: actor?._id || actor || undefined,
      actorEmail: actorEmail || actor?.email || undefined,
      action,
      entityType,
      entityId: entityId ? String(entityId) : undefined,
      route: req?.originalUrl,
      method: req?.method,
      ip: req?.ip,
      userAgent: req?.headers?.["user-agent"]?.slice(0, 500),
      requestId: req?.requestId,
      metadata,
      severity,
    });
  } catch (err) {
    console.error("[audit] write failed:", err?.message || "unknown");
  }
};

module.exports = { writeAudit };
