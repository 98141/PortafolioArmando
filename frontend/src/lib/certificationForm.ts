import type { Certification, CertificationFormValues } from "@/src/types/certification";

export const parseCommaList = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const joinCommaList = (items: string[] = []): string => items.join(", ");

export const toDateInput = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export const defaultCertificationFormValues: CertificationFormValues = {
  title: "",
  issuer: "",
  credentialId: "",
  credentialUrl: "",
  badgeUrl: "",
  badgeAlt: "",
  description: "",
  category: "other",
  skillsInput: "",
  issuedAt: "",
  expiresAt: "",
  status: "active",
  isFeatured: false,
  isActive: true,
  priority: 100,
};

export const formValuesToPayload = (values: CertificationFormValues) => {
  const payload: Record<string, unknown> = {
    title: values.title,
    issuer: values.issuer,
    credentialId: values.credentialId || undefined,
    credentialUrl: values.credentialUrl || undefined,
    description: values.description || undefined,
    category: values.category,
    skills: parseCommaList(values.skillsInput),
    status: values.status,
    isFeatured: values.isFeatured,
    isActive: values.isActive,
    priority: values.priority,
  };

  if (values.badgeUrl) {
    payload.badge = { url: values.badgeUrl, alt: values.badgeAlt || undefined };
  }

  if (values.issuedAt) {
    payload.issuedAt = new Date(values.issuedAt).toISOString();
  }
  if (values.expiresAt) {
    payload.expiresAt = new Date(values.expiresAt).toISOString();
  }

  return payload;
};

export const certificationToFormValues = (
  cert: Certification
): CertificationFormValues => ({
  title: cert.title,
  issuer: cert.issuer,
  credentialId: cert.credentialId ?? "",
  credentialUrl: cert.credentialUrl ?? "",
  badgeUrl: cert.badge?.url ?? "",
  badgeAlt: cert.badge?.alt ?? "",
  description: cert.description ?? "",
  category: cert.category,
  skillsInput: joinCommaList(cert.skills),
  issuedAt: toDateInput(cert.issuedAt),
  expiresAt: toDateInput(cert.expiresAt),
  status: cert.status,
  isFeatured: cert.isFeatured,
  isActive: cert.isActive,
  priority: cert.priority,
});
