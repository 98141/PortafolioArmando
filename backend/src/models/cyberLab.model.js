const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const evidenceSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true, maxlength: 200 },
    caption: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    label: { type: String, trim: true, maxlength: 150 },
  },
  { _id: false }
);

const cyberLabSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, "Subtitle cannot exceed 200 characters"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [600, "Short description cannot exceed 600 characters"],
    },
    fullDescription: {
      type: String,
      trim: true,
      maxlength: [15000, "Full description cannot exceed 15000 characters"],
    },
    category: {
      type: String,
      enum: {
        values: [
          "web_security",
          "pentesting",
          "forensics",
          "malware_analysis",
          "network_security",
          "appsec",
          "devsecops",
          "secure_coding",
          "incident_response",
          "threat_detection",
          "cloud_security",
          "mobile_security",
          "other",
        ],
        message: "Invalid lab category",
      },
      default: "web_security",
    },
    severity: {
      type: String,
      enum: {
        values: ["informational", "low", "medium", "high", "critical"],
        message: "Invalid severity level",
      },
      default: "medium",
    },
    status: {
      type: String,
      enum: {
        values: ["planned", "in_progress", "completed", "archived"],
        message: "Invalid lab status",
      },
      default: "planned",
    },
    methodology: { type: [String], default: [] },
    tools: { type: [String], default: [] },
    findings: { type: [String], default: [] },
    mitigations: { type: [String], default: [] },
    references: { type: [String], default: [] },
    evidence: { type: [evidenceSchema], default: [] },
    report: { type: reportSchema, default: undefined },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    priority: {
      type: Number,
      default: 100,
      min: [0, "Priority cannot be negative"],
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cyberLabSchema.index({ slug: 1 });
cyberLabSchema.index({ category: 1 });
cyberLabSchema.index({ severity: 1 });
cyberLabSchema.index({ status: 1 });
cyberLabSchema.index({ isFeatured: 1 });
cyberLabSchema.index({ isActive: 1 });
cyberLabSchema.index({ priority: 1 });
cyberLabSchema.index({ createdAt: -1 });

cyberLabSchema.virtual("readingTime").get(function () {
  if (!this.fullDescription) return 0;
  const words = this.fullDescription.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
});

cyberLabSchema.pre("validate", async function () {
  if (!this.slug && this.title) {
    let baseSlug = slugify(this.title);
    if (!baseSlug) {
      baseSlug = `lab-${Date.now()}`;
    }

    let candidate = baseSlug;
    let counter = 1;

    while (
      await mongoose.models.CyberLab.findOne({
        slug: candidate,
        _id: { $ne: this._id },
      })
    ) {
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }

    this.slug = candidate;
  }
});

const CyberLab = mongoose.model("CyberLab", cyberLabSchema);

module.exports = CyberLab;
