const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { logSecurityEvent } = require("../utils/securityLogger");
const { writeAudit } = require("../services/audit.service");

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MIME_TO_EXTENSIONS = {
  "image/jpeg": new Set(["jpg", "jpeg"]),
  "image/png": new Set(["png"]),
  "image/webp": new Set(["webp"]),
  "image/gif": new Set(["gif"]),
};

const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

const assertMagicBytes = async (file, expectedKind) => {
  if (!file?.buffer?.length) {
    throw new AppError("No file provided", 400);
  }

  const { fileTypeFromBuffer } = await import("file-type");
  const detected = await fileTypeFromBuffer(file.buffer);

  if (!detected) {
    throw new AppError("Unable to detect file type from content", 400);
  }

  if (detected.mime === "image/svg+xml" || detected.ext === "svg") {
    throw new AppError("SVG files are not allowed", 400);
  }

  if (expectedKind === "image") {
    if (!ALLOWED_IMAGE_EXTENSIONS.has(detected.ext)) {
      throw new AppError("File content is not a supported image type", 400);
    }

    if (!ALLOWED_IMAGE_MIMES.has(detected.mime)) {
      throw new AppError("File content is not a supported image type", 400);
    }

    if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      throw new AppError("Declared mimetype is not allowed for this endpoint", 400);
    }

    const expectedExts = MIME_TO_EXTENSIONS[file.mimetype];
    if (!expectedExts?.has(detected.ext)) {
      throw new AppError("Declared mimetype does not match file content", 400);
    }

    if (detected.mime !== file.mimetype) {
      throw new AppError("Declared mimetype does not match file content", 400);
    }

    return;
  }

  if (expectedKind === "pdf") {
    if (detected.ext !== "pdf" || detected.mime !== "application/pdf") {
      throw new AppError("File content is not a valid PDF", 400);
    }

    if (file.mimetype !== "application/pdf") {
      throw new AppError("Declared mimetype does not match file content", 400);
    }

    return;
  }

  throw new AppError("Invalid file validation configuration", 500);
};

const validateImageMagic = catchAsync(async (req, _res, next) => {
  try {
    await assertMagicBytes(req.file, "image");
    next();
  } catch (err) {
    logSecurityEvent("upload_rejected", err.message, {
      requestId: req.requestId,
      ip: req.ip,
      route: req.originalUrl,
      endpoint: "image",
    });
    await writeAudit({
      actor: req.user,
      action: "upload.rejected",
      entityType: "upload",
      req,
      severity: "warning",
      metadata: { reason: err.message },
    });
    throw err;
  }
});

const validatePdfMagic = catchAsync(async (req, _res, next) => {
  try {
    await assertMagicBytes(req.file, "pdf");
    next();
  } catch (err) {
    logSecurityEvent("upload_rejected", err.message, {
      requestId: req.requestId,
      ip: req.ip,
      route: req.originalUrl,
      endpoint: "pdf",
    });
    await writeAudit({
      actor: req.user,
      action: "upload.rejected",
      entityType: "upload",
      req,
      severity: "warning",
      metadata: { reason: err.message },
    });
    throw err;
  }
});

module.exports = {
  validateImageMagic,
  validatePdfMagic,
  assertMagicBytes,
};
