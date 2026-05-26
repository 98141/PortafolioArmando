const express = require("express");
const {
  getPublicEducation,
  getFeaturedEducation,
  getPublicEducationBySlug,
  getAdminEducation,
  getAdminEducationById,
  createEducation,
  updateEducation,
  deleteEducation,
  restoreEducation,
} = require("../controllers/education.controller");
const validateRequest = require("../middlewares/validateRequest");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");
const {
  createEducationSchema,
  updateEducationSchema,
  educationQuerySchema,
} = require("../validators/education.validator");

const publicRouter = express.Router();
const adminRouter = express.Router();

const validateQuery = validateRequest(educationQuerySchema, "query");

publicRouter.get("/", validateQuery, getPublicEducation);
publicRouter.get("/featured", getFeaturedEducation);
publicRouter.get("/:slug", getPublicEducationBySlug);

adminRouter.use(protect, restrictTo("admin"));
adminRouter.get("/", validateQuery, getAdminEducation);
adminRouter.get("/:id", getAdminEducationById);
adminRouter.post("/", validateRequest(createEducationSchema), createEducation);
adminRouter.patch("/:id", validateRequest(updateEducationSchema), updateEducation);
adminRouter.post("/:id/restore", restoreEducation);
adminRouter.delete("/:id", deleteEducation);

module.exports = { publicRouter, adminRouter };
