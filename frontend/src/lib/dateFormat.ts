export const formatCertificationDate = (issuedAt?: string, expiresAt?: string): string => {
  if (!issuedAt) return "";
  const issued = new Date(issuedAt);
  if (Number.isNaN(issued.getTime())) return "";

  const issuedStr = issued.toLocaleDateString("es-ES", {
    month: "short",
    year: "numeric",
  });

  if (!expiresAt) return issuedStr;

  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) return issuedStr;

  const expiresStr = expires.toLocaleDateString("es-ES", {
    month: "short",
    year: "numeric",
  });

  return `${issuedStr} — ${expiresStr}`;
};

export const formatEducationPeriod = (
  startedAt?: string,
  completedAt?: string,
  isCurrent?: boolean
): string => {
  const start = startedAt ? new Date(startedAt) : null;
  const end = completedAt ? new Date(completedAt) : null;

  const fmt = (d: Date) =>
    d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });

  if (start && !Number.isNaN(start.getTime())) {
    const startStr = fmt(start);
    if (isCurrent) return `${startStr} — Presente`;
    if (end && !Number.isNaN(end.getTime())) return `${startStr} — ${fmt(end)}`;
    return startStr;
  }

  if (isCurrent) return "En curso";
  return "";
};
