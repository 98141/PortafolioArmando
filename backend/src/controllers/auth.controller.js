const User = require("../models/user.model");
const { randomUUID } = require("node:crypto");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sanitizeUser = require("../utils/sanitizeUser");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  decodeAccessTokenSafe,
  decodeRefreshTokenSafe,
} = require("../utils/jwt");
const {
  comparePassword,
  hashRefreshToken,
  compareRefreshTokenHash,
} = require("../utils/password");
const { writeAudit } = require("../services/audit.service");
const { logSecurityEvent } = require("../utils/securityLogger");
const {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} = require("../config/cookies");

const sendAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
};

const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, clearCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, clearCookieOptions);
};

const persistRefreshToken = async (user, refreshToken) => {
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
};

const issueTokensAndRespond = async (
  user,
  res,
  req,
  statusCode = 200,
  auditAction = "auth.login_success"
) => {
  user.sessionId = randomUUID();
  const accessToken = signAccessToken(user._id, user.sessionId);
  const refreshToken = signRefreshToken(user._id, user.sessionId);

  await persistRefreshToken(user, refreshToken);
  sendAuthCookies(res, accessToken, refreshToken);

  await writeAudit({
    actor: user,
    action: auditAction,
    entityType: "auth",
    entityId: user._id,
    req,
  });

  res.status(statusCode).json({
    status: "success",
    data: {
      user: sanitizeUser(user),
    },
  });
};

const revokeSessionFromCookies = async (req) => {
  const candidates = [];
  const refreshCookie = req.cookies?.[REFRESH_TOKEN_COOKIE];
  const accessCookie = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (refreshCookie) {
    const decoded = decodeRefreshTokenSafe(refreshCookie);
    if (decoded?.id && decoded?.sid) {
      candidates.push(decoded);
    }
  }

  if (accessCookie) {
    const decoded = decodeAccessTokenSafe(accessCookie);
    if (decoded?.id && decoded?.sid) {
      candidates.push(decoded);
    }
  }

  await Promise.all(
    candidates.map((decoded) => User.updateOne(
      { _id: decoded.id, sessionId: decoded.sid },
      { $unset: { refreshTokenHash: 1, sessionId: 1 } }
    ))
  );
};

/**
 * TEMPORARY: Bootstrap first admin in non-production only.
 * Production: always blocked — use seed script instead.
 */
const registerAdmin = catchAsync(async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(new AppError("Admin registration is disabled", 403));
  }

  const adminCount = await User.countDocuments({ role: "admin" });
  const allowBootstrap = adminCount === 0;
  const allowExplicit =
    process.env.ALLOW_REGISTER_ADMIN === "true" &&
    process.env.NODE_ENV === "development";

  if (!allowBootstrap && !allowExplicit) {
    return next(new AppError("Admin registration is disabled", 403));
  }

  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(new AppError("Email already in use", 400));
  }

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: "admin",
  });

  await issueTokensAndRespond(user, res, req, 201, "auth.register_admin");
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await comparePassword(password, user.password))) {
    logSecurityEvent("login_failed", "Invalid login attempt", {
      requestId: req.requestId,
      ip: req.ip,
      route: req.originalUrl,
      email,
    });

    await writeAudit({
      action: "auth.login_failed",
      entityType: "auth",
      req,
      severity: "warning",
      metadata: { email },
    });

    return next(new AppError("Invalid email or password", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated", 401));
  }

  await issueTokensAndRespond(user, res, req);
});

const refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (!token) {
    clearAuthCookies(res);
    return next(new AppError("Refresh token not provided", 401));
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    clearAuthCookies(res);
    return next(error);
  }

  const user = await User.findById(decoded.id).select("+refreshTokenHash +sessionId");

  if (!user || !user.isActive) {
    clearAuthCookies(res);
    return next(new AppError("Invalid refresh session", 401));
  }

  if (!decoded.sid || decoded.sid !== user.sessionId || !user.refreshTokenHash || !compareRefreshTokenHash(token, user.refreshTokenHash)) {
    clearAuthCookies(res);
    return next(new AppError("Invalid refresh session", 401));
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    clearAuthCookies(res);
    return next(new AppError("User recently changed password. Please log in again.", 401));
  }

  const newAccessToken = signAccessToken(user._id, user.sessionId);
  const newRefreshToken = signRefreshToken(user._id, user.sessionId);

  const rotated = await User.findOneAndUpdate(
    { _id: user._id, sessionId: decoded.sid, refreshTokenHash: hashRefreshToken(token), isActive: true },
    { $set: { refreshTokenHash: hashRefreshToken(newRefreshToken) } },
    { new: true }
  );
  if (!rotated) {
    clearAuthCookies(res);
    return next(new AppError("Refresh session already used or revoked", 401));
  }

  sendAuthCookies(res, newAccessToken, newRefreshToken);

  await writeAudit({
    actor: user,
    action: "auth.refresh",
    entityType: "auth",
    entityId: user._id,
    req,
  });

  res.status(200).json({
    status: "success",
    message: "Token refreshed successfully",
  });
});

/** Clear the browser cookies even if persistence is temporarily unavailable. */
const logout = catchAsync(async (req, res) => {
  clearAuthCookies(res);
  await revokeSessionFromCookies(req);

  await writeAudit({
    actor: req.user,
    action: "auth.logout",
    entityType: "auth",
    entityId: req.user?._id,
    req,
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: sanitizeUser(req.user),
    },
  });
});

module.exports = {
  registerAdmin,
  login,
  refreshToken,
  logout,
  getMe,
};
