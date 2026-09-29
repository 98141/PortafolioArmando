const jwt = require("jsonwebtoken");
const AppError = require("./AppError");
const { randomUUID } = require("node:crypto");

const signAccessToken = (userId, sessionId) => {
  return jwt.sign({ id: userId, sid: sessionId }, process.env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    jwtid: randomUUID(),
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

const signRefreshToken = (userId, sessionId) => {
  return jwt.sign({ id: userId, sid: sessionId }, process.env.JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    jwtid: randomUUID(),
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] });
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }
};

/** Best-effort decode for logout / session revocation (never throws). */
const decodeAccessTokenSafe = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET, { algorithms: ["HS256"], ignoreExpiration: true });
  } catch {
    return null;
  }
};

const decodeRefreshTokenSafe = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, { algorithms: ["HS256"], ignoreExpiration: true });
  } catch {
    return null;
  }
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeAccessTokenSafe,
  decodeRefreshTokenSafe,
};
