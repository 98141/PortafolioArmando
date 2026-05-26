const express = require("express");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");
const { uploadRateLimit } = require("../middlewares/rateLimiters");
const { uploadImage, uploadPdf } = require("../middlewares/upload");
const {
  validateImageMagic,
  validatePdfMagic,
} = require("../middlewares/validateFileMagic");
const {
  uploadProjectImage,
  uploadCyberEvidence,
  uploadCyberReportPdf,
  uploadCertificationBadge,
  uploadEducationLogo,
  uploadBlogCover,
  uploadAuthorAvatar,
  uploadCvPdf,
  deleteUploadedAsset,
} = require("../controllers/upload.controller");

const adminRouter = express.Router();

adminRouter.use(protect, restrictTo("admin"));

adminRouter.post(
  "/project-image",
  uploadRateLimit,
  uploadImage.single("file"),
  validateImageMagic,
  uploadProjectImage
);

adminRouter.post(
  "/cyber-evidence",
  uploadRateLimit,
  uploadImage.single("file"),
  validateImageMagic,
  uploadCyberEvidence
);

adminRouter.post(
  "/cyber-report",
  uploadRateLimit,
  uploadPdf.single("file"),
  validatePdfMagic,
  uploadCyberReportPdf
);

adminRouter.post(
  "/certification-badge",
  uploadRateLimit,
  uploadImage.single("file"),
  validateImageMagic,
  uploadCertificationBadge
);

adminRouter.post(
  "/education-logo",
  uploadRateLimit,
  uploadImage.single("file"),
  validateImageMagic,
  uploadEducationLogo
);

adminRouter.post(
  "/blog-cover",
  uploadRateLimit,
  uploadImage.single("file"),
  validateImageMagic,
  uploadBlogCover
);

adminRouter.post(
  "/author-avatar",
  uploadRateLimit,
  uploadImage.single("file"),
  validateImageMagic,
  uploadAuthorAvatar
);

adminRouter.post(
  "/cv",
  uploadRateLimit,
  uploadPdf.single("file"),
  validatePdfMagic,
  uploadCvPdf
);

adminRouter.delete("/", deleteUploadedAsset);

module.exports = adminRouter;
