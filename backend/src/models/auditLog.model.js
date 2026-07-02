const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorEmail: { type: String, trim: true, maxlength: 200 },
    action: { type: String, required: true, trim: true, maxlength: 120 },
    entityType: { type: String, trim: true, maxlength: 80 },
    entityId: { type: String, trim: true, maxlength: 120 },
    route: { type: String, trim: true, maxlength: 300 },
    method: { type: String, trim: true, maxlength: 10 },
    ip: { type: String, trim: true, maxlength: 64 },
    userAgent: { type: String, trim: true, maxlength: 500 },
    requestId: { type: String, trim: true, maxlength: 64 },
    metadata: { type: mongoose.Schema.Types.Mixed },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
