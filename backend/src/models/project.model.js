const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const linksSchema = new mongoose.Schema(
  {
    demo: { type: String, trim: true },
    github: { type: String, trim: true },
    documentation: { type: String, trim: true },
    caseStudy: { type: String, trim: true },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
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
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    longDescription: {
      type: String,
      trim: true,
      maxlength: [10000, "Long description cannot exceed 10000 characters"],
    },
    category: {
      type: String,
      enum: {
        values: [
          "fullstack",
          "frontend",
          "backend",
          "ecommerce",
          "cybersecurity",
          "appsec",
          "devops",
          "other",
        ],
        message: "Invalid project category",
      },
      default: "fullstack",
    },
    status: {
      type: String,
      enum: {
        values: ["planned", "in_progress", "completed", "archived"],
        message: "Invalid project status",
      },
      default: "planned",
    },
    technologies: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    challenges: {
      type: [String],
      default: [],
    },
    learnings: {
      type: [String],
      default: [],
    },
    image: {
      type: imageSchema,
      default: undefined,
    },
    gallery: {
      type: [imageSchema],
      default: [],
    },
    links: {
      type: linksSchema,
      default: () => ({}),
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 100,
      min: [0, "Priority cannot be negative"],
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

projectSchema.index({ slug: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ isFeatured: 1 });
projectSchema.index({ isActive: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ createdAt: -1 });

projectSchema.virtual("readingTime").get(function () {
  if (!this.longDescription) return 0;
  const words = this.longDescription.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
});

projectSchema.pre("validate", async function () {
  if (!this.slug && this.title) {
    let baseSlug = slugify(this.title);
    if (!baseSlug) {
      baseSlug = `project-${Date.now()}`;
    }

    let candidate = baseSlug;
    let counter = 1;

    while (
      await mongoose.models.Project.findOne({
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

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
