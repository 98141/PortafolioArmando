const Project = require("../models/project.model");
const CyberLab = require("../models/cyberLab.model");
const Certification = require("../models/certification.model");
const Education = require("../models/education.model");
const BlogPost = require("../models/blogPost.model");
const SiteSettings = require("../models/siteSettings.model");
const { deleteFromCloudinary } = require("./upload.service");
const { writeAudit } = require("./audit.service");
const { logDeleteFailure } = require("../utils/uploadLogger");

// Include soft-deleted records: their assets are needed if an administrator restores them.
async function isAssetReferenced(publicId) {
  const references = await Promise.all([
    Project.exists({ $or: [{ "image.publicId": publicId }, { "gallery.publicId": publicId }] }),
    CyberLab.exists({ $or: [{ "evidence.publicId": publicId }, { "report.publicId": publicId }] }),
    Certification.exists({ "badge.publicId": publicId }),
    Education.exists({ "logo.publicId": publicId }),
    BlogPost.exists({ $or: [{ "coverImage.publicId": publicId }, { "author.avatarPublicId": publicId }] }),
    SiteSettings.exists({ $or: ["cv", "branding.logo", "branding.avatar", "seo.ogImage"].map((path) => ({ [`${path}.publicId`]: publicId })) }),
  ]);
  return references.some(Boolean);
}

async function cleanupUnreferencedAsset(publicId, resourceType, req, reason) {
  if (!publicId) return;
  try {
    if (await isAssetReferenced(publicId)) return;
    await deleteFromCloudinary(publicId, resourceType, reason, { requestId: req?.requestId });
  } catch (error) {
    // The database operation has already committed (or its outcome is uncertain).
    // Preserve the user-visible result and record cleanup for operational follow-up.
    logDeleteFailure(reason || "cleanup", error, {
      publicId,
      resourceType,
      requestId: req?.requestId,
      phase: "cleanup",
      route: req?.originalUrl,
    });
    await writeAudit({ actor: req.user, action: "upload.cleanup_failed", entityType: "upload",
      entityId: publicId, req, severity: "warning", metadata: { resourceType, reason } });
  }
}

module.exports = { isAssetReferenced, cleanupUnreferencedAsset };
