const express = require("express");
const {
  getPublicBlogPosts,
  getFeaturedBlogPosts,
  getPublicBlogPostBySlug,
  getAdminBlogPosts,
  getAdminBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  restoreBlogPost,
} = require("../controllers/blogPost.controller");
const validateRequest = require("../middlewares/validateRequest");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");
const {
  createBlogPostSchema,
  updateBlogPostSchema,
  blogQuerySchema,
} = require("../validators/blogPost.validator");

const publicRouter = express.Router();
const adminRouter = express.Router();

const validateQuery = validateRequest(blogQuerySchema, "query");

publicRouter.get("/", validateQuery, getPublicBlogPosts);
publicRouter.get("/featured", getFeaturedBlogPosts);
publicRouter.get("/:slug", getPublicBlogPostBySlug);

adminRouter.use(protect, restrictTo("admin"));
adminRouter.get("/", validateQuery, getAdminBlogPosts);
adminRouter.get("/:id", getAdminBlogPostById);
adminRouter.post("/", validateRequest(createBlogPostSchema), createBlogPost);
adminRouter.patch("/:id", validateRequest(updateBlogPostSchema), updateBlogPost);
adminRouter.post("/:id/restore", restoreBlogPost);
adminRouter.delete("/:id", deleteBlogPost);

module.exports = { publicRouter, adminRouter };
