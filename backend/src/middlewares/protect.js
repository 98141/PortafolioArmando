const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { verifyAccessToken } = require("../utils/jwt");
const { ACCESS_TOKEN_COOKIE } = require("../config/cookies");

const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to continue.", 401));
  }

  const decoded = verifyAccessToken(token);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }

  if (!currentUser.isActive) {
    return next(new AppError("Your account has been deactivated.", 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password. Please log in again.", 401));
  }

  req.user = currentUser;
  next();
});

module.exports = protect;
