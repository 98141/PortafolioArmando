const isProduction = process.env.NODE_ENV === "production";

const helmetConfig = {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: "deny" },
  noSniff: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  originAgentCluster: true,
  hidePoweredBy: true,
  hsts: isProduction
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
};

module.exports = { helmetConfig };
