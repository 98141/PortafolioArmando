const mongoose = require("mongoose");

const mediaAssetSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, trim: true, maxlength: 80 },
    label: { type: String, trim: true, maxlength: 120 },
    url: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 100, min: 0 },
  },
  { _id: false }
);

const SETTINGS_SINGLETON_KEY = "global";

const siteSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: SETTINGS_SINGLETON_KEY,
      unique: true,
      immutable: true,
    },
    profile: {
      fullName: { type: String, trim: true, maxlength: 120 },
      professionalTitle: { type: String, trim: true, maxlength: 200 },
      tagline: { type: String, trim: true, maxlength: 240 },
      shortBio: { type: String, trim: true, maxlength: 400 },
      longBio: { type: String, trim: true, maxlength: 5000 },
      location: { type: String, trim: true, maxlength: 120 },
      email: { type: String, trim: true, lowercase: true, maxlength: 200 },
      phone: { type: String, trim: true, maxlength: 40 },
      whatsapp: { type: String, trim: true, maxlength: 40 },
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    branding: {
      logo: { type: mediaAssetSchema, default: undefined },
      avatar: { type: mediaAssetSchema, default: undefined },
      primaryColor: { type: String, trim: true, maxlength: 30 },
      accentColor: { type: String, trim: true, maxlength: 30 },
    },
    cv: {
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
      fileName: { type: String, trim: true, maxlength: 255 },
      updatedAt: { type: Date },
    },
    seo: {
      siteName: { type: String, trim: true, maxlength: 120 },
      defaultTitle: { type: String, trim: true, maxlength: 160 },
      defaultDescription: { type: String, trim: true, maxlength: 320 },
      keywords: { type: [String], default: [] },
      ogImage: { type: mediaAssetSchema, default: undefined },
      twitterHandle: { type: String, trim: true, maxlength: 80 },
      canonicalBaseUrl: { type: String, trim: true },
    },
    social: { type: [socialLinkSchema], default: [] },
    availability: {
      status: {
        type: String,
        enum: ["available", "limited", "unavailable"],
        default: "available",
      },
      message: { type: String, trim: true, maxlength: 240 },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

siteSettingsSchema.index({ isActive: 1 });
siteSettingsSchema.index({ updatedAt: -1 });

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);

module.exports = SiteSettings;
