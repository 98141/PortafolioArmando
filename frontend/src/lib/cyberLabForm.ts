import type { CyberLab, CyberLabEvidence, CyberLabFormValues } from "@/src/types/cyberLab";

export const parseCommaList = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const parseLines = (value: string): string[] =>
  value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export const joinCommaList = (items: string[] = []): string => items.join(", ");

export const joinLines = (items: string[] = []): string => items.join("\n");

/** Format: url|alt|caption per line */
export const parseEvidenceInput = (value: string): CyberLabEvidence[] => {
  const items: CyberLabEvidence[] = [];
  for (const line of parseLines(value)) {
    const parts = line.split("|").map((p) => p.trim());
    const url = parts[0];
    if (!url) continue;

    // Backwards compatible:
    // - legacy: url|alt|caption
    // - new:    url|publicId|alt|caption
    if (parts.length >= 4) {
      const publicId = parts[1];
      const alt = parts[2];
      const caption = parts[3];
      items.push({
        url,
        publicId: publicId || undefined,
        alt: alt || undefined,
        caption: caption || undefined,
      });
    } else {
      const alt = parts[1];
      const caption = parts[2];
      items.push({
        url,
        publicId: undefined,
        alt: alt || undefined,
        caption: caption || undefined,
      });
    }
  }
  return items;
};

export const formatEvidenceInput = (evidence: CyberLabEvidence[] = []): string =>
  evidence
    .map((e) => {
      if (e.publicId) {
        return [e.url ?? "", e.publicId ?? "", e.alt ?? "", e.caption ?? ""].join("|");
      }
      return [e.url ?? "", e.alt ?? "", e.caption ?? ""].join("|");
    })
    .join("\n");

export const formValuesToPayload = (values: CyberLabFormValues) => {
  const payload: Record<string, unknown> = {
    title: values.title,
    subtitle: values.subtitle || undefined,
    shortDescription: values.shortDescription,
    fullDescription: values.fullDescription || undefined,
    category: values.category,
    severity: values.severity,
    status: values.status,
    methodology: parseLines(values.methodologyInput),
    tools: parseCommaList(values.toolsInput),
    findings: parseLines(values.findingsInput),
    mitigations: parseLines(values.mitigationsInput),
    references: parseLines(values.referencesInput),
    tags: parseCommaList(values.tagsInput),
    evidence: parseEvidenceInput(values.evidenceInput),
    isFeatured: values.isFeatured,
    isActive: values.isActive,
    priority: values.priority,
  };

  if (values.reportUrl) {
    payload.report = {
      url: values.reportUrl,
      publicId: values.reportPublicId || undefined,
      label: values.reportLabel || "Security Report (PDF)",
    };
  }

  if (values.startedAt) {
    payload.startedAt = new Date(values.startedAt).toISOString();
  }
  if (values.completedAt) {
    payload.completedAt = new Date(values.completedAt).toISOString();
  }

  return payload;
};

export const labToFormValues = (lab: CyberLab): CyberLabFormValues => ({
  title: lab.title,
  subtitle: lab.subtitle ?? "",
  shortDescription: lab.shortDescription,
  fullDescription: lab.fullDescription ?? "",
  category: lab.category,
  severity: lab.severity,
  status: lab.status,
  methodologyInput: joinLines(lab.methodology),
  toolsInput: joinCommaList(lab.tools),
  findingsInput: joinLines(lab.findings),
  mitigationsInput: joinLines(lab.mitigations),
  referencesInput: joinLines(lab.references),
  tagsInput: joinCommaList(lab.tags),
  reportUrl: lab.report?.url ?? "",
  reportLabel: lab.report?.label ?? "",
  reportPublicId: lab.report?.publicId ?? "",
  evidenceInput: formatEvidenceInput(lab.evidence),
  isFeatured: lab.isFeatured,
  isActive: lab.isActive,
  priority: lab.priority,
  startedAt: lab.startedAt ? lab.startedAt.slice(0, 10) : "",
  completedAt: lab.completedAt ? lab.completedAt.slice(0, 10) : "",
});

export const defaultCyberLabFormValues: CyberLabFormValues = {
  title: "",
  subtitle: "",
  shortDescription: "",
  fullDescription: "",
  category: "web_security",
  severity: "medium",
  status: "planned",
  methodologyInput: "",
  toolsInput: "",
  findingsInput: "",
  mitigationsInput: "",
  referencesInput: "",
  tagsInput: "defensive, professional, documented",
  reportUrl: "",
  reportLabel: "Security Assessment Report",
  reportPublicId: "",
  evidenceInput: "",
  isFeatured: false,
  isActive: true,
  priority: 100,
  startedAt: "",
  completedAt: "",
};
