const mongoose = require("mongoose");
const slugify = require("../utils/slugify");
const { calculateReadingTime } = require("../utils/readingTime");

const coverImageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 320 },
    canonicalUrl: { type: String, trim: true },
  },
  { _id: false }
);

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 120 },
    role: { type: String, trim: true, maxlength: 200 },
    avatarUrl: { type: String, trim: true },
    avatarPublicId: { type: String, trim: true },
  },
  { _id: false }
);

const blogPostSchema = new mongoose.Schema(
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
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      trim: true,
      maxlength: [600, "Excerpt cannot exceed 600 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [80000, "Content cannot exceed 80000 characters"],
    },
    coverImage: { type: coverImageSchema, default: undefined },
    category: {
      type: String,
      enum: {
        values: [
          "cybersecurity",
          "software_development",
          "appsec",
          "devsecops",
          "web_security",
          "forensics",
          "cloud_security",
          "architecture",
          "backend",
          "frontend",
          "databases",
          "tutorials",
          "case_study",
          "writeup",
          "career",
          "other",
        ],
        message: "Invalid blog category",
      },
      default: "other",
    },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Invalid blog status",
      },
      default: "draft",
    },
    seo: { type: seoSchema, default: undefined },
    author: { type: authorSchema, default: undefined },
    readingTime: {
      type: Number,
      min: [1, "Reading time must be at least 1 minute"],
    },
    relatedTopics: { type: [String], default: [] },
    allowComments: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    priority: {
      type: Number,
      default: 100,
      min: [0, "Priority cannot be negative"],
    },
    publishedAt: { type: Date },
    lastReviewedAt: { type: Date },
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

blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ isFeatured: 1 });
blogPostSchema.index({ isActive: 1 });
blogPostSchema.index({ priority: 1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ tags: 1 });

blogPostSchema.pre("validate", async function () {
  if (this.content) {
    this.readingTime = calculateReadingTime(this.content);
  }

  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (!this.slug && this.title) {
    let baseSlug = slugify(this.title);
    if (!baseSlug) baseSlug = `post-${Date.now()}`;

    let candidate = baseSlug;
    let counter = 1;

    while (
      await mongoose.models.BlogPost.findOne({
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

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = BlogPost;
