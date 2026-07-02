const CyberLab = require("../models/cyberLab.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { getPagination, paginationMeta } = require("../utils/pagination");
const { applySoftDeleteFilter } = require("../utils/softDelete");
const { performSoftDelete, performRestore } = require("../utils/crudHelpers");
const { writeAudit } = require("../services/audit.service");

const SORT_ORDER = { priority: 1, createdAt: -1 };
const ENTITY = "cyber_lab";

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
    ],
  };
};

const buildListFilter = (query, { publicOnly = false } = {}) => {
  const filter = {};

  if (publicOnly) {
    filter.isActive = true;
    filter.status = "completed";
  } else if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  if (query.category) filter.category = query.category;
  if (query.severity) filter.severity = query.severity;
  if (!publicOnly && query.status) filter.status = query.status;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;

  applySoftDeleteFilter(filter, query, { publicOnly });
  return { ...filter, ...buildSearchFilter(query.search) };
};

const formatCyberLab = (doc) => {
  return doc.toObject ? doc.toObject() : doc;
};

const PUBLIC_CYBERLAB_PROJECTION =
  "-findings -mitigations -methodology -evidence -report -references -fullDescription";

const listCyberLabs = async (req, res, { publicOnly }) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildListFilter(req.query, { publicOnly });

  const query = CyberLab.find(filter).sort(SORT_ORDER).skip(skip).limit(limit);
  if (publicOnly) {
    query.select(PUBLIC_CYBERLAB_PROJECTION);
  }

  const [labs, total] = await Promise.all([
    query,
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

  const labs = await CyberLab.find({
    isActive: true,
    status: "completed",
    isFeatured: true,
    isDeleted: { $ne: true },
  })
    .sort(SORT_ORDER)
    .limit(limit)
    .select(PUBLIC_CYBERLAB_PROJECTION);

  res.status(200).json({
    status: "success",
    data: { labs: labs.map(formatCyberLab) },
  });
});

const getCyberLabBySlug = catchAsync(async (req, res, next) => {
  const lab = await CyberLab.findOne({
    slug: req.params.slug,
    isActive: true,
    status: "completed",
    isDeleted: { $ne: true },
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

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.create`,
      entityType: ENTITY,
      entityId: lab._id,
      req,
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

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.update`,
      entityType: ENTITY,
      entityId: lab._id,
      req,
    });

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

const deleteCyberLab = catchAsync(async (req, res, next) => {
  try {
    const lab = await performSoftDelete(CyberLab, req.params.id, req);

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.soft_delete`,
      entityType: ENTITY,
      entityId: lab._id,
      req,
      severity: "warning",
    });

    res.status(200).json({
      status: "success",
      message: "Cyber lab deleted successfully",
    });
  } catch (err) {
    return next(err);
  }
});

const restoreCyberLab = catchAsync(async (req, res, next) => {
  try {
    const lab = await performRestore(CyberLab, req.params.id, req);

    await writeAudit({
      actor: req.user,
      action: `${ENTITY}.restore`,
      entityType: ENTITY,
      entityId: lab._id,
      req,
    });

    res.status(200).json({
      status: "success",
      data: { lab: formatCyberLab(lab) },
    });
  } catch (err) {
    return next(err);
  }
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
  restoreCyberLab,
};
