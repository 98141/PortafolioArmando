const SiteSettings = require("../models/siteSettings.model");
const catchAsync = require("../utils/catchAsync");
const { validateCanonicalBaseUrl } = require("../utils/canonicalUrl");
const { writeAudit } = require("../services/audit.service");
const { deleteFromCloudinary } = require("../services/upload.service");

const SETTINGS_KEY = "global";

const normalizeSettings = (doc) => {
  const settings = doc.toObject ? doc.toObject() : doc;
  settings.social = (settings.social || []).sort(
    (a, b) => (a.priority || 100) - (b.priority || 100)
  );
  return settings;
};

const toPublicSettings = (settingsDoc) => {
  const settings = normalizeSettings(settingsDoc);

  return {
    profile: {
      fullName: settings.profile?.fullName,
      professionalTitle: settings.profile?.professionalTitle,
      tagline: settings.profile?.tagline,
      shortBio: settings.profile?.shortBio,
      longBio: settings.profile?.longBio,
      location: settings.profile?.location,
      email: settings.profile?.email,
      phone: settings.profile?.phone,
      whatsapp: settings.profile?.whatsapp,
      linkedin: settings.profile?.linkedin,
      github: settings.profile?.github,
      website: settings.profile?.website,
    },
    branding: {
      logo: settings.branding?.logo,
      avatar: settings.branding?.avatar,
      primaryColor: settings.branding?.primaryColor,
      accentColor: settings.branding?.accentColor,
    },
    cv: settings.cv,
    seo: settings.seo,
    social: (settings.social || []).filter((item) => item?.isActive !== false),
    availability: settings.availability,
    updatedAt: settings.updatedAt,
  };
};

const getOrCreateSingleton = async () => {
  let settings = await SiteSettings.findOne({ singletonKey: SETTINGS_KEY });
  if (!settings) {
    settings = await SiteSettings.create({
      singletonKey: SETTINGS_KEY,
      isActive: true,
    });
  }
  return settings;
};

const sanitizePayload = (body) => {
  const payload = { ...body, singletonKey: SETTINGS_KEY, isActive: true };

  if (payload.seo?.canonicalBaseUrl) {
    payload.seo.canonicalBaseUrl = validateCanonicalBaseUrl(
      payload.seo.canonicalBaseUrl,
      { optional: false }
    );
  }

  return payload;
};

const getPublicSiteSettings = catchAsync(async (_req, res) => {
  const settings = await getOrCreateSingleton();
  res.status(200).json({
    status: "success",
    data: { settings: toPublicSettings(settings) },
  });
});

const getAdminSiteSettings = catchAsync(async (_req, res) => {
  const settings = await getOrCreateSingleton();
  res.status(200).json({
    status: "success",
    data: { settings: normalizeSettings(settings) },
  });
});

const updateAdminSiteSettings = catchAsync(async (req, res) => {
  const payload = sanitizePayload({
    ...req.body,
    updatedBy: req.user?._id,
  });

  const existing = await SiteSettings.findOne({ singletonKey: SETTINGS_KEY });
  const updated = await SiteSettings.findOneAndUpdate(
    { singletonKey: SETTINGS_KEY },
    {
      ...payload,
      ...(existing ? {} : { createdBy: req.user?._id }),
    },
    { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
  );

  await SiteSettings.updateMany(
    { singletonKey: { $ne: SETTINGS_KEY }, isActive: true },
    { isActive: false }
  );

  await writeAudit({
    actor: req.user,
    action: existing ? "site_settings.update" : "site_settings.create",
    entityType: "site_settings",
    entityId: updated._id,
    req,
    severity: "info",
  });

  res.status(existing ? 200 : 201).json({
    status: "success",
    data: { settings: normalizeSettings(updated) },
  });
});

const deleteCv = catchAsync(async (req, res) => {
  const settings = await getOrCreateSingleton();
  const publicId = settings.cv?.publicId;

  if (publicId) {
    await deleteFromCloudinary(publicId, "raw", "cv-delete");
  }

  await SiteSettings.findOneAndUpdate(
    { singletonKey: SETTINGS_KEY },
    { $unset: { cv: 1 }, $set: { updatedBy: req.user?._id } },
    { new: true }
  );

  await writeAudit({
    actor: req.user,
    action: "site_settings.cv_delete",
    entityType: "site_settings",
    entityId: settings._id,
    req,
    severity: "info",
  });

  res.status(200).json({ status: "success" });
});

module.exports = {
  getPublicSiteSettings,
  getAdminSiteSettings,
  updateAdminSiteSettings,
  deleteCv,
};
