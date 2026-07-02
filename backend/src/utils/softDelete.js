/**
 * Shared soft-delete helpers for CMS entities.
 */

const applySoftDeleteFilter = (filter, query = {}, { publicOnly = false } = {}) => {
  if (publicOnly) {
    filter.isDeleted = { $ne: true };
    return filter;
  }

  const includeDeleted =
    query.includeDeleted === true || query.includeDeleted === "true";

  if (!includeDeleted) {
    filter.isDeleted = { $ne: true };
  }

  return filter;
};

const softDeleteFields = {
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
  deletedBy: { type: require("mongoose").Schema.Types.ObjectId, ref: "User" },
};

module.exports = {
  applySoftDeleteFilter,
  softDeleteFields,
};
