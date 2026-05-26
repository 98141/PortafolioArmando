const multer = require("multer");
const path = require("path");
const AppError = require("../utils/AppError");

const memoryStorage = multer.memoryStorage();

const dangerousExtensions = new Set([
  ".exe",
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".html",
  ".htm",
  ".php",
  ".phtml",
  ".phar",
  ".svg", // Explicitly blocked (and also by mimetype)
  ".xml",
  ".xhtml",
  ".bat",
  ".cmd",
  ".sh",
  ".bash",
  ".cmdlet",
]);

const rejectFile = (message) => new AppError(message, 400);

const normalizeExt = (fileName = "") => path.extname(fileName).toLowerCase();

const createUpload = ({ allowedMimes, maxSizeBytes }) => {
  const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: maxSizeBytes },
    fileFilter: (req, file, cb) => {
      const ext = normalizeExt(file.originalname);
      if (dangerousExtensions.has(ext)) {
        return cb(rejectFile("File type is not allowed."));
      }

      if (!allowedMimes.includes(file.mimetype)) {
        return cb(rejectFile("Unsupported file mimetype."));
      }

      // Additional explicit block for SVG by mimetype (even if someone spoofs ext).
      if (file.mimetype === "image/svg+xml") {
        return cb(rejectFile("SVG files are not allowed."));
      }

      cb(null, true);
    },
  });

  return upload;
};

const uploadImage = createUpload({
  allowedMimes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  maxSizeBytes: 5 * 1024 * 1024,
});

const uploadPdf = createUpload({
  allowedMimes: ["application/pdf"],
  maxSizeBytes: 10 * 1024 * 1024,
});

module.exports = {
  uploadImage,
  uploadPdf,
};

