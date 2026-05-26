const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const badgeSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    issuer: {
      type: String,
      required: [true, "Issuer is required"],
      trim: true,
      maxlength: [200, "Issuer cannot exceed 200 characters"],
    },
    credentialId: { type: String, trim: true, maxlength: 120 },
    credentialUrl: { type: String, trim: true },
    badge: { type: badgeSchema, default: undefined },
    description: {
      type: String,
      trim: true,
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    category: {
      type: String,
      enum: {
        values: [
          "cybersecurity",
          "software_development",
          "devops",
          "cloud",
          "networking",
          "database",
          "programming",
          "appsec",
          "compliance",
          "other",
        ],
        message: "Invalid certification category",
      },
      default: "other",
    },
    skills: { type: [String], default: [] },
    issuedAt: { type: Date },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: {
        values: ["active", "expired", "archived"],
        message: "Invalid certification status",
      },
      default: "active",
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    priority: {
      type: Number,
      default: 100,
      min: [0, "Priority cannot be negative"],
    },
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

certificationSchema.index({ slug: 1 });
certificationSchema.index({ issuer: 1 });
certificationSchema.index({ category: 1 });
certificationSchema.index({ status: 1 });
certificationSchema.index({ isFeatured: 1 });
certificationSchema.index({ isActive: 1 });
certificationSchema.index({ priority: 1 });
certificationSchema.index({ createdAt: -1 });

certificationSchema.pre("validate", async function () {
  if (!this.slug && this.title) {
    let baseSlug = slugify(this.title);
    if (!baseSlug) baseSlug = `cert-${Date.now()}`;

    let candidate = baseSlug;
    let counter = 1;

    while (
      await mongoose.models.Certification.findOne({
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

const Certification = mongoose.model("Certification", certificationSchema);

module.exports = Certification;
