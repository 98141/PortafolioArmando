const crypto = require("crypto");

const requestId = (req, res, next) => {
  const incoming = req.headers["x-request-id"];
  const id =
    typeof incoming === "string" && incoming.trim().length > 0
      ? incoming.trim().slice(0, 64)
      : crypto.randomUUID();

  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};

module.exports = requestId;
