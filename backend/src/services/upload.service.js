const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const AppError = require("../utils/AppError");
const { logUploadFailure, logDeleteFailure } = require("../utils/uploadLogger");

const sanitizePublicIdBase = (name = "") =>
  name
    .toString()
    .trim()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const buildPublicId = (file) => {
  const base = sanitizePublicIdBase(file?.originalname ?? "asset");
  const unique = Date.now();
  return `${base || "asset"}-${unique}`;
};

const buildUploadResponse = (result, originalName) => {
  const resourceType =
    result.resource_type === "raw"
      ? "raw"
      : result.resource_type === "image"
        ? "image"
        : "image";

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType,
    format: result.format,
    bytes: result.bytes,
    originalName,
  };
};

const uploadBufferToCloudinary = (file, { folder, resource_type }) =>
  new Promise((resolve, reject) => {
    const publicId = buildPublicId(file);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type,
        public_id: publicId,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });

const uploadImageToCloudinary = async (file, folder, endpoint) => {
  try {
    const result = await uploadBufferToCloudinary(file, {
      folder,
      resource_type: "image",
    });
    return buildUploadResponse(result, file.originalname);
  } catch (err) {
    logUploadFailure(endpoint || "image", err, { endpoint });
    throw err.isOperational
      ? err
      : new AppError("Image upload failed", 500);
  }
};

const uploadPdfToCloudinary = async (file, folder, endpoint) => {
  try {
    const result = await uploadBufferToCloudinary(file, {
      folder,
      resource_type: "raw",
    });
    return buildUploadResponse(result, file.originalname);
  } catch (err) {
    logUploadFailure(endpoint || "pdf", err, { endpoint });
    throw err.isOperational ? err : new AppError("PDF upload failed", 500);
  }
};

const deleteFromCloudinary = async (publicId, resourceType, endpoint) => {
  const resource_type = resourceType === "raw" ? "raw" : "image";
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type });
  } catch (err) {
    logDeleteFailure(endpoint || "delete", err, { publicId, resourceType });
    throw err.isOperational
      ? err
      : new AppError("Failed to delete asset from Cloudinary", 500);
  }
};

module.exports = {
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
  deleteFromCloudinary,
  buildUploadResponse,
};
