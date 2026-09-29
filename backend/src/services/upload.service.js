const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const { randomUUID } = require("node:crypto");
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

// Images must not carry a file extension in public_id. Raw PDFs must end in
// the validated content extension, not whatever the client named the file.
const buildPublicId = (file, resourceType) => {
  const base = sanitizePublicIdBase(file?.originalname ?? "asset") || "asset";
  const id = `${base}-${randomUUID()}`;
  if (resourceType !== "raw") return id;

  if (file?.validatedKind !== "pdf" || file?.validatedMime !== "application/pdf") {
    const error = new AppError("PDF upload failed", 500);
    error.phase = "validation";
    error.reason = "missing-validated-pdf";
    throw error;
  }

  return `${id}.pdf`;
};

const buildUploadResponse = (result, originalName) => {
  if (result.resource_type !== "raw" && result.resource_type !== "image") {
    throw new AppError(
      `Unexpected Cloudinary resource_type: ${result.resource_type}`,
      500
    );
  }
  const resourceType = result.resource_type;

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

const uploadBufferToCloudinary = (file, { folder, resource_type }) => {
  const publicId = buildPublicId(file, resource_type);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type,
        public_id: publicId,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.on("error", reject);
    Readable.from(file.buffer).on("error", reject).pipe(uploadStream);
  });
};

const logProviderFailure = (endpoint, err, context) => {
  logUploadFailure(endpoint || "upload", err, {
    endpoint,
    phase: err?.phase || "provider",
    requestId: context.requestId,
    reason: err?.reason,
  });
};

const uploadImageToCloudinary = async (file, folder, endpoint, context = {}) => {
  try {
    const result = await uploadBufferToCloudinary(file, {
      folder,
      resource_type: "image",
    });
    return buildUploadResponse(result, file.originalname);
  } catch (err) {
    logProviderFailure(endpoint || "image", err, context);
    throw err.isOperational
      ? err
      : new AppError("Image upload failed", 500);
  }
};

const uploadPdfToCloudinary = async (file, folder, endpoint, context = {}) => {
  try {
    const result = await uploadBufferToCloudinary(file, {
      folder,
      resource_type: "raw",
    });
    return buildUploadResponse(result, file.originalname);
  } catch (err) {
    logProviderFailure(endpoint || "pdf", err, context);
    throw err.isOperational ? err : new AppError("PDF upload failed", 500);
  }
};

const deleteFromCloudinary = async (publicId, resourceType, endpoint, context = {}) => {
  const resource_type = resourceType === "raw" ? "raw" : "image";
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type });
    if (!["ok", "not found"].includes(result?.result)) {
      throw new AppError("Cloudinary did not confirm asset deletion", 502);
    }
  } catch (err) {
    logDeleteFailure(endpoint || "delete", err, {
      publicId,
      resourceType,
      requestId: context.requestId,
      phase: "cleanup",
    });
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
