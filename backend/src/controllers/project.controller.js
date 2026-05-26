const Project = require("../models/project.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { getPagination, paginationMeta } = require("../utils/pagination");

const SORT_ORDER = { priority: 1, createdAt: -1 };

const buildSearchFilter = (search) => {
  if (!search) return {};
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return {
    $or: [
      { title: regex },
      { subtitle: regex },
      { shortDescription: regex },
      { technologies: regex },
    ],
  };
};

const buildListFilter = (query, { publicOnly = false } = {}) => {
  const filter = {};

  if (publicOnly) {
    filter.isActive = true;
  } else if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;

  return { ...filter, ...buildSearchFilter(query.search) };
};

const formatProject = (doc) => {
  const project = doc.toObject ? doc.toObject() : doc;
  return project;
};

const listProjects = async (req, res, { publicOnly }) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildListFilter(req.query, { publicOnly });

  const [projects, total] = await Promise.all([
    Project.find(filter).sort(SORT_ORDER).skip(skip).limit(limit),
    Project.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      projects: projects.map(formatProject),
      pagination: paginationMeta(total, page, limit),
    },
  });
};

const getPublicProjects = catchAsync(async (req, res) => {
  await listProjects(req, res, { publicOnly: true });
});

const getPublicFeaturedProjects = catchAsync(async (req, res) => {
  const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 6));

  const projects = await Project.find({ isActive: true, isFeatured: true })
    .sort(SORT_ORDER)
    .limit(limit);

  res.status(200).json({
    status: "success",
    data: { projects: projects.map(formatProject) },
  });
});

const getPublicProjectBySlug = catchAsync(async (req, res, next) => {
  const project = await Project.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!project) {
    return next(new AppError("Project not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { project: formatProject(project) },
  });
});

const getAdminProjects = catchAsync(async (req, res) => {
  await listProjects(req, res, { publicOnly: false });
});

const getAdminProjectById = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError("Project not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { project: formatProject(project) },
  });
});

const createProject = catchAsync(async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: { project: formatProject(project) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("A project with this slug already exists", 400));
    }
    throw err;
  }
});

const updateProject = catchAsync(async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { project: formatProject(project) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("A project with this slug already exists", 400));
    }
    throw err;
  }
});

/**
 * Hard delete. Sprint 4 may add soft delete (isActive=false or deletedAt).
 */
const deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return next(new AppError("Project not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Project deleted successfully",
  });
});

module.exports = {
  getPublicProjects,
  getPublicFeaturedProjects,
  getPublicProjectBySlug,
  getAdminProjects,
  getAdminProjectById,
  createProject,
  updateProject,
  deleteProject,
};
