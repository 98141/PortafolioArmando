const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
  deleteFromCloudinary,
} = require("../services/upload.service");
const { validateDeletePayload } = require("../utils/validateUploadDelete");
const { writeAudit } = require("../services/audit.service");
const { logSecurityEvent } = require("../utils/securityLogger");

const requireFile = (req) => {
  if (!req.file) {
    throw new AppError("No file provided", 400);
  }
  return req.file;
};

const respondUpload = async (req, res, data, endpoint) => {
  await writeAudit({
    actor: req.user,
    action: "upload.success",
    entityType: "upload",
    entityId: data.publicId,
    req,
    metadata: { endpoint, resourceType: data.resourceType },
  });
  res.status(201).json({ status: "success", data });
};

const uploadProjectImage = catchAsync(async (req, res) => {
  const file = requireFile(req);
  const data = await uploadImageToCloudinary(
    file,
    "portfolio/projects",
    "project-image"
  );
  await respondUpload(req, res, data, "project-image");
});

const uploadCyberEvidence = catchAsync(async (req, res) => {
  const file = requireFile(req);
  const data = await uploadImageToCloudinary(
    file,
    "portfolio/cyber-labs/evidence",
    "cyber-evidence"
  );
  await respondUpload(req, res, data, "cyber-evidence");
});

const uploadCyberReportPdf = catchAsync(async (req, res) => {
  const file = requireFile(req);
  const data = await uploadPdfToCloudinary(
    file,
    "portfolio/cyber-labs/reports",
    "cyber-report"
  );
  await respondUpload(req, res, data, "cyber-report");
});

const uploadCertificationBadge = catchAsync(async (req, res) => {
  const file = requireFile(req);
  const data = await uploadImageToCloudinary(
    file,
    "portfolio/certifications/badges",
    "certification-badge"
  );
  await respondUpload(req, res, data, "certification-badge");
});

const uploadEducationLogo = catchAsync(async (req, res) => {
  const file = requireFile(req);
  const data = await uploadImageToCloudinary(
    file,
    "portfolio/education/logos",
    "education-logo"
  );
  await respondUpload(req, res, data, "education-logo");
});

const uploadBlogCover = catchAsync(async (req, res) => {
  const file = requireFile(req);
  const data = await uploadImageToCloudinary(
    file,
    "portfolio/blog/covers",
    "blog-cover"
  );
  await respondUpload(req, res, data, "blog-cover");
});

const uploadAuthorAvatar = catchAsync(async (req, res) => {
  const file = requireFile(req);
  const data = await uploadImageToCloudinary(
    file,
    "portfolio/authors",
    "author-avatar"
  );
  await respondUpload(req, res, data, "author-avatar");
});

const uploadCvPdf = catchAsync(async (req, res) => {
  const file = requireFile(req);
  const data = await uploadPdfToCloudinary(file, "portfolio/cv", "cv");
  await respondUpload(req, res, data, "cv");
});

const deleteUploadedAsset = catchAsync(async (req, res, next) => {
  const { publicId, resourceType } = req.body || {};
  const validated = validateDeletePayload(publicId, resourceType);

  try {
    await deleteFromCloudinary(
      validated.publicId,
      validated.resourceType,
      "delete"
    );
  } catch (err) {
    logSecurityEvent("upload_delete_failed", err.message, {
      requestId: req.requestId,
      publicId: validated.publicId,
      route: req.originalUrl,
    });
    await writeAudit({
      actor: req.user,
      action: "upload.delete_failed",
      entityType: "upload",
      entityId: validated.publicId,
      req,
      severity: "warning",
    });
    return next(err);
  }

  await writeAudit({
    actor: req.user,
    action: "upload.delete",
    entityType: "upload",
    entityId: validated.publicId,
    req,
    metadata: { resourceType: validated.resourceType },
  });

  res.status(200).json({
    status: "success",
    data: validated,
  });
});

module.exports = {
  uploadProjectImage,
  uploadCyberEvidence,
  uploadCyberReportPdf,
  uploadCertificationBadge,
  uploadEducationLogo,
  uploadBlogCover,
  uploadAuthorAvatar,
  uploadCvPdf,
  deleteUploadedAsset,
};
