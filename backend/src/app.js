const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");
const hpp = require("hpp");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      status: "error",
      message: "Too many requests, please try again later.",
    },
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
const globalErrorHandler = require("./middlewares/globalErrorHandler");

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Portfolio API is running",
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

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(globalErrorHandler);

module.exports = app;