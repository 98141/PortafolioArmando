const BLOCKED_PROTOCOLS = new Set(["javascript:", "data:", "vbscript:", "file:"]);

const getAllowedHosts = (): string[] => {
  const fromEnv = (process.env.NEXT_PUBLIC_ALLOWED_CANONICAL_HOSTS || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

  if (fromEnv.length > 0) return fromEnv;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://armandomora.dev";
  try {
    return [new URL(siteUrl).hostname.toLowerCase()];
  } catch {
    return ["localhost"];
  }
};

export const validateCanonicalBaseUrl = (
  url: string | undefined
): { ok: true; value?: string } | { ok: false; message: string } => {
  if (!url || url === "") return { ok: true, value: undefined };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, message: "URL canónica inválida" };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (BLOCKED_PROTOCOLS.has(protocol)) {
    return { ok: false, message: "Protocolo no permitido (javascript:, data:, etc.)" };
  }

  if (protocol !== "http:" && protocol !== "https:") {
    return { ok: false, message: "La URL canónica debe usar http o https" };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, message: "La URL no puede incluir credenciales" };
  }

  const hostname = parsed.hostname.toLowerCase();
  const allowed = getAllowedHosts();
  if (!allowed.includes(hostname)) {
    return {
      ok: false,
      message: `Dominio "${hostname}" no permitido. Permitidos: ${allowed.join(", ")}`,
    };
  }

  return { ok: true, value: parsed.origin };
};
