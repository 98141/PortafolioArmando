import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";
import { validateProductionEnv } from "./config/production-env.mjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'" },
      ...(process.env.NODE_ENV === "production"
        ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
    ] }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
          ? `/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/**`
          : "/**",
      },
    ],
  },
};

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_PRODUCTION_SERVER) {
    validateProductionEnv(process.env);
  }
  // Keep the isolated fixture preview separate from a developer's running server.
  return process.env.NODE_ENV === "development" && process.env.PUBLIC_FIXTURE === "1"
    ? { ...nextConfig, distDir: ".next/fixture" }
    : nextConfig;
}
