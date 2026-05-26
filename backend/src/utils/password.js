const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, 12);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const compareRefreshTokenHash = (plainToken, storedHash) => {
  const incomingHash = hashRefreshToken(plainToken);

  try {
    const a = Buffer.from(incomingHash, "hex");
    const b = Buffer.from(storedHash, "hex");

    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  hashRefreshToken,
  compareRefreshTokenHash,
};
