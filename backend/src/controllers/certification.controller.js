const Certification = require("../models/certification.model");
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
      { issuer: regex },
      { credentialId: regex },
      { description: regex },
      { skills: regex },
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

const formatCertification = (doc) => (doc.toObject ? doc.toObject() : doc);

const listCertifications = async (req, res, { publicOnly }) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildListFilter(req.query, { publicOnly });

  const [certifications, total] = await Promise.all([
    Certification.find(filter).sort(SORT_ORDER).skip(skip).limit(limit),
    Certification.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      certifications: certifications.map(formatCertification),
      pagination: paginationMeta(total, page, limit),
    },
  });
};

const getPublicCertifications = catchAsync(async (req, res) => {
  await listCertifications(req, res, { publicOnly: true });
});

const getFeaturedCertifications = catchAsync(async (req, res) => {
  const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 6));

  const certifications = await Certification.find({ isActive: true, isFeatured: true })
    .sort(SORT_ORDER)
    .limit(limit);

  res.status(200).json({
    status: "success",
    data: { certifications: certifications.map(formatCertification) },
  });
});

const getPublicCertificationBySlug = catchAsync(async (req, res, next) => {
  const certification = await Certification.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!certification) {
    return next(new AppError("Certification not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { certification: formatCertification(certification) },
  });
});

const getAdminCertifications = catchAsync(async (req, res) => {
  await listCertifications(req, res, { publicOnly: false });
});

const getAdminCertificationById = catchAsync(async (req, res, next) => {
  const certification = await Certification.findById(req.params.id);

  if (!certification) {
    return next(new AppError("Certification not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { certification: formatCertification(certification) },
  });
});

const createCertification = catchAsync(async (req, res, next) => {
  try {
    const certification = await Certification.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: { certification: formatCertification(certification) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("A certification with this slug already exists", 400));
    }
    throw err;
  }
});

const updateCertification = catchAsync(async (req, res, next) => {
  try {
    const certification = await Certification.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!certification) {
      return next(new AppError("Certification not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { certification: formatCertification(certification) },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("A certification with this slug already exists", 400));
    }
    throw err;
  }
});

const deleteCertification = catchAsync(async (req, res, next) => {
  const certification = await Certification.findByIdAndDelete(req.params.id);

  if (!certification) {
    return next(new AppError("Certification not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Certification deleted successfully",
  });
});

module.exports = {
  getPublicCertifications,
  getFeaturedCertifications,
  getPublicCertificationBySlug,
  getAdminCertifications,
  getAdminCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
};
