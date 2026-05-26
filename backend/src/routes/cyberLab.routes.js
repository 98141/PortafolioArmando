const express = require("express");
const {
  getPublicCyberLabs,
  getFeaturedCyberLabs,
  getCyberLabBySlug,
  getAdminCyberLabs,
  getAdminCyberLabById,
  createCyberLab,
  updateCyberLab,
  deleteCyberLab,
} = require("../controllers/cyberLab.controller");
const validateRequest = require("../middlewares/validateRequest");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");
const {
  createCyberLabSchema,
  updateCyberLabSchema,
  cyberLabQuerySchema,
} = require("../validators/cyberLab.validator");

const publicRouter = express.Router();
const adminRouter = express.Router();

const validateQuery = validateRequest(cyberLabQuerySchema, "query");

publicRouter.get("/", validateQuery, getPublicCyberLabs);
publicRouter.get("/featured", getFeaturedCyberLabs);
publicRouter.get("/:slug", getCyberLabBySlug);

adminRouter.use(protect, restrictTo("admin"));
adminRouter.get("/", validateQuery, getAdminCyberLabs);
adminRouter.get("/:id", getAdminCyberLabById);
adminRouter.post("/", validateRequest(createCyberLabSchema), createCyberLab);
adminRouter.patch("/:id", validateRequest(updateCyberLabSchema), updateCyberLab);
adminRouter.delete("/:id", deleteCyberLab);

module.exports = { publicRouter, adminRouter };
