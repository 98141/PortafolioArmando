const express = require("express");
const {
  getPublicCertifications,
  getFeaturedCertifications,
  getPublicCertificationBySlug,
  getAdminCertifications,
  getAdminCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
  restoreCertification,
} = require("../controllers/certification.controller");
const validateRequest = require("../middlewares/validateRequest");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");
const {
  createCertificationSchema,
  updateCertificationSchema,
  certificationQuerySchema,
} = require("../validators/certification.validator");

const publicRouter = express.Router();
const adminRouter = express.Router();

const validateQuery = validateRequest(certificationQuerySchema, "query");

publicRouter.get("/", validateQuery, getPublicCertifications);
publicRouter.get("/featured", getFeaturedCertifications);
publicRouter.get("/:slug", getPublicCertificationBySlug);

adminRouter.use(protect, restrictTo("admin"));
adminRouter.get("/", validateQuery, getAdminCertifications);
adminRouter.get("/:id", getAdminCertificationById);
adminRouter.post("/", validateRequest(createCertificationSchema), createCertification);
adminRouter.patch("/:id", validateRequest(updateCertificationSchema), updateCertification);
adminRouter.post("/:id/restore", restoreCertification);
adminRouter.delete("/:id", deleteCertification);

module.exports = { publicRouter, adminRouter };
