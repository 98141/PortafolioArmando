const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

const parseExpiresInMs = (value, fallbackMs) => {
  if (!value || typeof value !== "string") {
    return fallbackMs;
  }

  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return fallbackMs;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * (multipliers[unit] || 0) || fallbackMs;
};

const isProduction = process.env.NODE_ENV === "production";

const cookieSecure =
  process.env.COOKIE_SECURE === "true" ||
  (process.env.COOKIE_SECURE !== "false" && isProduction);

const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax");

const baseCookieOptions = {
  httpOnly: true,
  secure: cookieSecure,
  sameSite: cookieSameSite,
  path: "/",
};

const accessTokenCookieOptions = {
  ...baseCookieOptions,
  maxAge: parseExpiresInMs(process.env.JWT_ACCESS_EXPIRES_IN, 15 * 60 * 1000),
};

const refreshTokenCookieOptions = {
  ...baseCookieOptions,
  maxAge: parseExpiresInMs(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000),
};

const clearCookieOptions = {
  ...baseCookieOptions,
  maxAge: 0,
};

module.exports = {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
};
