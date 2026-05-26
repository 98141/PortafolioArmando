const AppError = require("./AppError");

const performSoftDelete = async (Model, id, req) => {
  const doc = await Model.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user?._id,
      isActive: false,
      updatedBy: req.user?._id,
    },
    { new: true }
  );

  if (!doc) {
    throw new AppError("Resource not found or already deleted", 404);
  }

  return doc;
};

const performRestore = async (Model, id, req) => {
  const doc = await Model.findOneAndUpdate(
    { _id: id, isDeleted: true },
    {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      isActive: true,
      updatedBy: req.user?._id,
    },
    { new: true }
  );

  if (!doc) {
    throw new AppError("Deleted resource not found", 404);
  }

  return doc;
};

module.exports = { performSoftDelete, performRestore };
