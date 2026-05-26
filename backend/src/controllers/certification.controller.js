const Certification = require("../models/certification.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { getPagination, paginationMeta } = require("../utils/pagination");
const { applySoftDeleteFilter } = require("../utils/softDelete");
const { performSoftDelete, performRestore } = require("../utils/crudHelpers");
const { writeAudit } = require("../services/audit.service");

const SORT_ORDER = { priority: 1, createdAt: -1 };
const ENTITY = "certification";

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

  applySoftDeleteFilter(filter, query, { publicOnly });
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

  const certifications = await Certification.find({
    isActive: true,
    isFeatured: true,
    isDeleted: { $ne: true },
  })
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
    isDeleted: { $ne: true },
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

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.create`,
      entityType: ENTITY,
      entityId: certification._id,
      req,
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

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.update`,
      entityType: ENTITY,
      entityId: certification._id,
      req,
    });

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
  try {
    const certification = await performSoftDelete(Certification, req.params.id, req);

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.soft_delete`,
      entityType: ENTITY,
      entityId: certification._id,
      req,
      severity: "warning",
    });

    res.status(200).json({
      status: "success",
      message: "Certification deleted successfully",
    });
  } catch (err) {
    return next(err);
  }
});

const restoreCertification = catchAsync(async (req, res, next) => {
  try {
    const certification = await performRestore(Certification, req.params.id, req);

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.restore`,
      entityType: ENTITY,
      entityId: certification._id,
      req,
    });

    res.status(200).json({
      status: "success",
      data: { certification: formatCertification(certification) },
    });
  } catch (err) {
    return next(err);
  }
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
  restoreCertification,
};
