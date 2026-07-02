const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");
const hpp = require("hpp");
const mongoose = require("mongoose");

const { helmetConfig } = require("./config/helmet");
const requestId = require("./middlewares/requestId");
const globalErrorHandler = require("./middlewares/globalErrorHandler");

const app = express();
const serverStartedAt = Date.now();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(requestId);
app.use(helmet(helmetConfig));

const corsOrigin = process.env.FRONTEND_URL;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === corsOrigin) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: true, limit: "500kb" }));
app.use(cookieParser());

morgan.token("request-id", (req) => req.requestId || "-");
app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? ':remote-addr - :request-id ":method :url" :status :res[content-length] - :response-time ms'
      : ':method :url :status :request-id - :response-time ms'
  )
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
      status: "error",
      message: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use((req, res, next) => {
  req.body = mongoSanitize(req.body);
  req.params = mongoSanitize(req.params);
  req.query = mongoSanitize(req.query);
  next();
});

app.use(hpp());

const authRoutes = require("./routes/auth.routes");
const { publicRouter: projectPublicRoutes, adminRouter: projectAdminRoutes } =
  require("./routes/project.routes");
const { publicRouter: cyberLabPublicRoutes, adminRouter: cyberLabAdminRoutes } =
  require("./routes/cyberLab.routes");
const {
  publicRouter: certificationPublicRoutes,
  adminRouter: certificationAdminRoutes,
} = require("./routes/certification.routes");
const {
  publicRouter: educationPublicRoutes,
  adminRouter: educationAdminRoutes,
} = require("./routes/education.routes");
const { publicRouter: blogPublicRoutes, adminRouter: blogAdminRoutes } =
  require("./routes/blogPost.routes");
const uploadAdminRoutes = require("./routes/upload.routes");
const {
  publicRouter: siteSettingsPublicRoutes,
  adminRouter: siteSettingsAdminRoutes,
} = require("./routes/siteSettings.routes");

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      uptime: Math.floor((Date.now() - serverStartedAt) / 1000),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectPublicRoutes);
app.use("/api/admin/projects", projectAdminRoutes);
app.use("/api/cyber-labs", cyberLabPublicRoutes);
app.use("/api/admin/cyber-labs", cyberLabAdminRoutes);
app.use("/api/certifications", certificationPublicRoutes);
app.use("/api/admin/certifications", certificationAdminRoutes);
app.use("/api/education", educationPublicRoutes);
app.use("/api/admin/education", educationAdminRoutes);
app.use("/api/blog", blogPublicRoutes);
app.use("/api/admin/blog", blogAdminRoutes);
app.use("/api/admin/uploads", uploadAdminRoutes);
app.use("/api/site-settings", siteSettingsPublicRoutes);
app.use("/api/admin/site-settings", siteSettingsAdminRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(globalErrorHandler);

module.exports = app;
