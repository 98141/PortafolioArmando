const User = require("../models/user.model");
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

const issueTokensAndRespond = async (user, res, statusCode = 200) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  await persistRefreshToken(user, refreshToken);
  sendAuthCookies(res, accessToken, refreshToken);

  res.status(statusCode).json({
    status: "success",
    data: {
      user: sanitizeUser(user),
    },
  });
};

const revokeSessionFromCookies = async (req) => {
  const candidateIds = new Set();
  const refreshCookie = req.cookies?.[REFRESH_TOKEN_COOKIE];
  const accessCookie = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (refreshCookie) {
    const decoded = decodeRefreshTokenSafe(refreshCookie);
    if (decoded?.id) {
      candidateIds.add(String(decoded.id));
    }
  }

  if (accessCookie) {
    const decoded = decodeAccessTokenSafe(accessCookie);
    if (decoded?.id) {
      candidateIds.add(String(decoded.id));
    }
  }

  await Promise.all(
    [...candidateIds].map(async (userId) => {
      const user = await User.findById(userId).select("+refreshTokenHash");
      if (!user?.refreshTokenHash) {
        return;
      }
      user.refreshTokenHash = undefined;
      await user.save({ validateBeforeSave: false });
    })
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

  await issueTokensAndRespond(user, res, 201);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await comparePassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated", 401));
  }

  await issueTokensAndRespond(user, res);
});

const refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (!token) {
    return next(new AppError("Refresh token not provided", 401));
  }

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select("+refreshTokenHash");

  if (!user || !user.isActive) {
    clearAuthCookies(res);
    return next(new AppError("Invalid refresh session", 401));
  }

  if (!user.refreshTokenHash || !compareRefreshTokenHash(token, user.refreshTokenHash)) {
    user.refreshTokenHash = undefined;
    await user.save({ validateBeforeSave: false });
    clearAuthCookies(res);
    return next(new AppError("Invalid refresh session", 401));
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    clearAuthCookies(res);
    return next(new AppError("User recently changed password. Please log in again.", 401));
  }

  const newAccessToken = signAccessToken(user._id);
  const newRefreshToken = signRefreshToken(user._id);

  user.refreshTokenHash = hashRefreshToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  sendAuthCookies(res, newAccessToken, newRefreshToken);

  res.status(200).json({
    status: "success",
    message: "Token refreshed successfully",
  });
});

/** Always succeeds: clears cookies and revokes refresh when identifiable. */
const logout = catchAsync(async (req, res) => {
  await revokeSessionFromCookies(req);
  clearAuthCookies(res);

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
