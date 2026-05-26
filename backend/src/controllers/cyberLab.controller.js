const CyberLab = require("../models/cyberLab.model");
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
      { tools: regex },
      { tags: regex },
      { findings: regex },
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
  if (query.severity) filter.severity = query.severity;
  if (query.status) filter.status = query.status;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;

  return { ...filter, ...buildSearchFilter(query.search) };
};

const formatCyberLab = (doc) => {
  return doc.toObject ? doc.toObject() : doc;
};

const listCyberLabs = async (req, res, { publicOnly }) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildListFilter(req.query, { publicOnly });

  const [labs, total] = await Promise.all([
    CyberLab.find(filter).sort(SORT_ORDER).skip(skip).limit(limit),
    CyberLab.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      labs: labs.map(formatCyberLab),
      pagination: paginationMeta(total, page, limit),
    },
  });
};

const getPublicCyberLabs = catchAsync(async (req, res) => {
  await listCyberLabs(req, res, { publicOnly: true });
});

const getFeaturedCyberLabs = catchAsync(async (req, res) => {
  const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 6));

  const labs = await CyberLab.find({ isActive: true, isFeatured: true })
    .sort(SORT_ORDER)
    .limit(limit);

  res.status(200).json({
    status: "success",
    data: { labs: labs.map(formatCyberLab) },
  });
});

const getCyberLabBySlug = catchAsync(async (req, res, next) => {
  const lab = await CyberLab.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!lab) {
    return next(new AppError("Cyber lab not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { lab: formatCyberLab(lab) },
  });
});

const getAdminCyberLabs = catchAsync(async (req, res) => {
  await listCyberLabs(req, res, { publicOnly: false });
});

const getAdminCyberLabById = catchAsync(async (req, res, next) => {
  const lab = await CyberLab.findById(req.params.id);

  if (!lab) {
    return next(new AppError("Cyber lab not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { lab: formatCyberLab(lab) },
  });
});

const createCyberLab = catchAsync(async (req, res, next) => {
  try {
    const lab = await CyberLab.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: { lab: formatCyberLab(lab) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("A lab with this slug already exists", 400));
    }
    throw err;
  }
});

const updateCyberLab = catchAsync(async (req, res, next) => {
  try {
    const lab = await CyberLab.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!lab) {
      return next(new AppError("Cyber lab not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { lab: formatCyberLab(lab) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("A lab with this slug already exists", 400));
    }
    throw err;
  }
});

/** Hard delete. Future sprint may add soft delete via isActive/deletedAt. */
const deleteCyberLab = catchAsync(async (req, res, next) => {
  const lab = await CyberLab.findByIdAndDelete(req.params.id);

  if (!lab) {
    return next(new AppError("Cyber lab not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Cyber lab deleted successfully",
  });
});

module.exports = {
  getPublicCyberLabs,
  getFeaturedCyberLabs,
  getCyberLabBySlug,
  getAdminCyberLabs,
  getAdminCyberLabById,
  createCyberLab,
  updateCyberLab,
  deleteCyberLab,
};
