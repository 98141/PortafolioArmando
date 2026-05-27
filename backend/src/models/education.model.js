const mongoose = require("mongoose");
const slugify = require("../utils/slugify");
const { softDeleteFields } = require("../utils/softDelete");

const logoSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
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
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
      maxlength: [200, "Institution cannot exceed 200 characters"],
    },
    academicLevel: {
      type: String,
      enum: {
        values: [
          "diploma",
          "technical",
          "technologist",
          "undergraduate",
          "specialization",
          "masters",
          "doctorate",
          "bootcamp",
          "certification_program",
          "other",
        ],
        message: "Invalid academic level",
      },
      default: "undergraduate",
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: [200, "Field of study cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    achievements: { type: [String], default: [] },
    focusAreas: { type: [String], default: [] },
    logo: { type: logoSchema, default: undefined },
    startedAt: { type: Date },
    completedAt: { type: Date },
    isCurrent: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    priority: {
      type: Number,
      default: 100,
      min: [0, "Priority cannot be negative"],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ...softDeleteFields,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

educationSchema.index({ slug: 1 });
educationSchema.index({ institution: 1 });
educationSchema.index({ academicLevel: 1 });
educationSchema.index({ isFeatured: 1 });
educationSchema.index({ isActive: 1 });
educationSchema.index({ priority: 1 });
educationSchema.index({ createdAt: -1 });

educationSchema.pre("validate", async function () {
  if (!this.slug && this.title) {
    let baseSlug = slugify(this.title);
    if (!baseSlug) baseSlug = `edu-${Date.now()}`;

    let candidate = baseSlug;
    let counter = 1;

    while (
      await mongoose.models.Education.findOne({
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

const Education = mongoose.model("Education", educationSchema);

module.exports = Education;
