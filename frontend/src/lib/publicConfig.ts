// Next inlines these public values during build. Production validation lives in next.config.ts.
// The deployment origin is authoritative, including when the CMS still has an old domain.
export const siteOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).origin;

export const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");
