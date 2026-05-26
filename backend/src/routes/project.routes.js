const express = require("express");
const {
  getPublicProjects,
  getPublicFeaturedProjects,
  getPublicProjectBySlug,
  getAdminProjects,
  getAdminProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");
const validateRequest = require("../middlewares/validateRequest");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");
const {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} = require("../validators/project.validator");

const publicRouter = express.Router();
const adminRouter = express.Router();

const validateQuery = validateRequest(projectQuerySchema, "query");

publicRouter.get("/", validateQuery, getPublicProjects);
publicRouter.get("/featured", getPublicFeaturedProjects);
publicRouter.get("/:slug", getPublicProjectBySlug);

adminRouter.use(protect, restrictTo("admin"));
adminRouter.get("/", validateQuery, getAdminProjects);
adminRouter.get("/:id", getAdminProjectById);
adminRouter.post("/", validateRequest(createProjectSchema), createProject);
adminRouter.patch("/:id", validateRequest(updateProjectSchema), updateProject);
adminRouter.delete("/:id", deleteProject);

module.exports = { publicRouter, adminRouter };
