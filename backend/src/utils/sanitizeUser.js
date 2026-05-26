const PUBLIC_USER_FIELDS = [
  "_id",
  "name",
  "email",
  "role",
  "isActive",
  "lastLogin",
  "createdAt",
  "updatedAt",
];

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const raw = typeof user.toJSON === "function" ? user.toJSON() : { ...user };

  return PUBLIC_USER_FIELDS.reduce((acc, field) => {
    if (raw[field] !== undefined) {
      acc[field] = raw[field];
    }
    return acc;
  }, {});
};

module.exports = sanitizeUser;
