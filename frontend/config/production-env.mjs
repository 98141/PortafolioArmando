/** Validate after Next has loaded .env files, so .env.local cannot leak into a release. */
export function validateProductionEnv(env) {
  for (const key of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_API_URL"]) {
    let url;
    try {
      url = new URL(env[key]);
    } catch {
      throw new Error(`${key} must be an absolute HTTPS URL in production.`);
    }
    const hostname = url.hostname.replace(/\.$/, "");
    const local = !hostname.includes(".") || hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") || /^127\./.test(hostname) || hostname === "0.0.0.0";
    if (url.protocol !== "https:" || local || url.username || url.password || url.search || url.hash) {
      throw new Error(`${key} must use a public HTTPS host, without credentials, query or fragment. Check .env.production.local and remove production overrides from .env.local.`);
    }
    if (key === "NEXT_PUBLIC_SITE_URL" && url.pathname !== "/") {
      throw new Error("NEXT_PUBLIC_SITE_URL must contain only the public origin (no path).");
    }
  }
}
