const BlogPost = require("../models/blogPost.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { getPagination, paginationMeta } = require("../utils/pagination");
const { applySoftDeleteFilter } = require("../utils/softDelete");
const { performSoftDelete, performRestore } = require("../utils/crudHelpers");
const { writeAudit } = require("../services/audit.service");

const SORT_ORDER = { priority: 1, publishedAt: -1, createdAt: -1 };
const ENTITY = "blog_post";

const buildSearchFilter = (search) => {
  if (!search) return {};
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return {
    $or: [
      { title: regex },
      { excerpt: regex },
      { content: regex },
      { tags: regex },
      { relatedTopics: regex },
      { "author.name": regex },
    ],
  };
};

const buildListFilter = (query, { publicOnly = false } = {}) => {
  const filter = {};

  if (publicOnly) {
    filter.isActive = true;
    filter.status = "published";
  } else {
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.status) filter.status = query.status;
  }

  if (query.category) filter.category = query.category;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;
  if (query.tag) filter.tags = query.tag;

  applySoftDeleteFilter(filter, query, { publicOnly });
  return { ...filter, ...buildSearchFilter(query.search) };
};

const formatBlogPost = (doc) => (doc.toObject ? doc.toObject() : doc);

const listBlogPosts = async (req, res, { publicOnly }) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildListFilter(req.query, { publicOnly });

  const query = BlogPost.find(filter).sort(SORT_ORDER).skip(skip).limit(limit);
  if (publicOnly) {
    // Public endpoints must not ship full Markdown content.
    query.select("-content");
  }

  const [posts, total] = await Promise.all([
    query,
    BlogPost.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      posts: posts.map(formatBlogPost),
      pagination: paginationMeta(total, page, limit),
    },
  });
};

const getPublicBlogPosts = catchAsync(async (req, res) => {
  await listBlogPosts(req, res, { publicOnly: true });
});

const getFeaturedBlogPosts = catchAsync(async (req, res) => {
  const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 6));

  const query = BlogPost.find({
    isActive: true,
    status: "published",
    isFeatured: true,
    isDeleted: { $ne: true },
  })
    .sort(SORT_ORDER)
    .limit(limit);

  query.select("-content");

  const posts = await query;

  res.status(200).json({
    status: "success",
    data: { posts: posts.map(formatBlogPost) },
  });
});

const getPublicBlogPostBySlug = catchAsync(async (req, res, next) => {
  const post = await BlogPost.findOne({
    slug: req.params.slug,
    isActive: true,
    status: "published",
    isDeleted: { $ne: true },
  });

  if (!post) {
    return next(new AppError("Blog post not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { post: formatBlogPost(post) },
  });
});

const getAdminBlogPosts = catchAsync(async (req, res) => {
  await listBlogPosts(req, res, { publicOnly: false });
});

const getAdminBlogPostById = catchAsync(async (req, res, next) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    return next(new AppError("Blog post not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { post: formatBlogPost(post) },
  });
});

const createBlogPost = catchAsync(async (req, res, next) => {
  try {
    const post = await BlogPost.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.create`,
      entityType: ENTITY,
      entityId: post._id,
      req,
    });

    res.status(201).json({
      status: "success",
      data: { post: formatBlogPost(post) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("A blog post with this slug already exists", 400));
    }
    throw err;
  }
});

const updateBlogPost = catchAsync(async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!post) {
      return next(new AppError("Blog post not found", 404));
    }

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.update`,
      entityType: ENTITY,
      entityId: post._id,
      req,
    });

    res.status(200).json({
      status: "success",
      data: { post: formatBlogPost(post) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("A blog post with this slug already exists", 400));
    }
    throw err;
  }
});

const deleteBlogPost = catchAsync(async (req, res, next) => {
  try {
    const post = await performSoftDelete(BlogPost, req.params.id, req);

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.soft_delete`,
      entityType: ENTITY,
      entityId: post._id,
      req,
      severity: "warning",
    });

    res.status(200).json({
      status: "success",
      message: "Blog post deleted successfully",
    });
  } catch (err) {
    return next(err);
  }
});

const restoreBlogPost = catchAsync(async (req, res, next) => {
  try {
    const post = await performRestore(BlogPost, req.params.id, req);

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.restore`,
      entityType: ENTITY,
      entityId: post._id,
      req,
    });

    res.status(200).json({
      status: "success",
      data: { post: formatBlogPost(post) },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = {
  getPublicBlogPosts,
  getFeaturedBlogPosts,
  getPublicBlogPostBySlug,
  getAdminBlogPosts,
  getAdminBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  restoreBlogPost,
};
