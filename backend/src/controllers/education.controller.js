const Education = require("../models/education.model");
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
      { institution: regex },
      { fieldOfStudy: regex },
      { description: regex },
      { achievements: regex },
      { focusAreas: regex },
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

  if (query.academicLevel) filter.academicLevel = query.academicLevel;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;

  return { ...filter, ...buildSearchFilter(query.search) };
};

const formatEducation = (doc) => (doc.toObject ? doc.toObject() : doc);

const listEducation = async (req, res, { publicOnly }) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildListFilter(req.query, { publicOnly });

  const [education, total] = await Promise.all([
    Education.find(filter).sort(SORT_ORDER).skip(skip).limit(limit),
    Education.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      education: education.map(formatEducation),
      pagination: paginationMeta(total, page, limit),
    },
  });
};

const getPublicEducation = catchAsync(async (req, res) => {
  await listEducation(req, res, { publicOnly: true });
});

const getFeaturedEducation = catchAsync(async (req, res) => {
  const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 6));

  const education = await Education.find({ isActive: true, isFeatured: true })
    .sort(SORT_ORDER)
    .limit(limit);

  res.status(200).json({
    status: "success",
    data: { education: education.map(formatEducation) },
  });
});

const getPublicEducationBySlug = catchAsync(async (req, res, next) => {
  const entry = await Education.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!entry) {
    return next(new AppError("Education entry not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { education: formatEducation(entry) },
  });
});

const getAdminEducation = catchAsync(async (req, res) => {
  await listEducation(req, res, { publicOnly: false });
});

const getAdminEducationById = catchAsync(async (req, res, next) => {
  const entry = await Education.findById(req.params.id);

  if (!entry) {
    return next(new AppError("Education entry not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { education: formatEducation(entry) },
  });
});

const createEducation = catchAsync(async (req, res, next) => {
  try {
    const entry = await Education.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: { education: formatEducation(entry) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("An education entry with this slug already exists", 400));
    }
    throw err;
  }
});

const updateEducation = catchAsync(async (req, res, next) => {
  try {
    const entry = await Education.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return next(new AppError("Education entry not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { education: formatEducation(entry) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("An education entry with this slug already exists", 400));
    }
    throw err;
  }
});

const deleteEducation = catchAsync(async (req, res, next) => {
  const entry = await Education.findByIdAndDelete(req.params.id);

  if (!entry) {
    return next(new AppError("Education entry not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Education entry deleted successfully",
  });
});

module.exports = {
  getPublicEducation,
  getFeaturedEducation,
  getPublicEducationBySlug,
  getAdminEducation,
  getAdminEducationById,
  createEducation,
  updateEducation,
  deleteEducation,
};
