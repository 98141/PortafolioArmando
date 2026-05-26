const express = require("express");
const {
  registerAdmin,
  login,
  refreshToken,
  logout,
  getMe,
} = require("../controllers/auth.controller");
const validateRequest = require("../middlewares/validateRequest");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");
const { authRateLimit, loginRateLimit } = require("../middlewares/rateLimiters");
const {
  registerAdminSchema,
  loginSchema,
} = require("../validators/auth.validator");

const router = express.Router();

router.use(authRateLimit);

router.post(
  "/register-admin",
  validateRequest(registerAdminSchema),
  registerAdmin
);

router.post("/login", loginRateLimit, validateRequest(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

router.use(protect);
router.get("/me", restrictTo("admin"), getMe);

module.exports = router;
