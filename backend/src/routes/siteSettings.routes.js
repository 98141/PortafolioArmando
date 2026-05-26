const express = require("express");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");
const validateRequest = require("../middlewares/validateRequest");
const { updateSiteSettingsSchema } = require("../validators/siteSettings.validator");
const {
  getPublicSiteSettings,
  getAdminSiteSettings,
  updateAdminSiteSettings,
} = require("../controllers/siteSettings.controller");

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.get("/", getPublicSiteSettings);

adminRouter.use(protect, restrictTo("admin"));
adminRouter.get("/", getAdminSiteSettings);
adminRouter.put("/", validateRequest(updateSiteSettingsSchema), updateAdminSiteSettings);

module.exports = { publicRouter, adminRouter };
