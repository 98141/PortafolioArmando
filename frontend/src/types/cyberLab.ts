export type CyberLabCategory =
  | "web_security"
  | "pentesting"
  | "forensics"
  | "malware_analysis"
  | "network_security"
  | "appsec"
  | "devsecops"
  | "secure_coding"
  | "incident_response"
  | "threat_detection"
  | "cloud_security"
  | "mobile_security"
  | "other";

export type CyberSeverity =
  | "informational"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type CyberLabStatus = "planned" | "in_progress" | "completed" | "archived";

export interface CyberLabEvidence {
  url?: string;
  publicId?: string;
  alt?: string;
  caption?: string;
}

export interface CyberLabReport {
  url?: string;
  publicId?: string;
  label?: string;
}

export interface CyberLab {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  shortDescription: string;
  fullDescription?: string;
  category: CyberLabCategory;
  severity: CyberSeverity;
  status: CyberLabStatus;
  methodology: string[];
  tools: string[];
  findings: string[];
  mitigations: string[];
  references: string[];
  evidence: CyberLabEvidence[];
  report?: CyberLabReport;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  priority: number;
  startedAt?: string;
  completedAt?: string;
  readingTime?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CyberLabFormValues {
  title: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  category: CyberLabCategory;
  severity: CyberSeverity;
  status: CyberLabStatus;
  methodologyInput: string;
  toolsInput: string;
  findingsInput: string;
  mitigationsInput: string;
  referencesInput: string;
  tagsInput: string;
  reportUrl: string;
  reportLabel: string;
  reportPublicId?: string;
  evidenceInput: string;
  isFeatured: boolean;
  isActive: boolean;
  priority: number;
  startedAt: string;
  completedAt: string;
}

export interface CyberLabQueryParams {
  page?: number;
  limit?: number;
  category?: CyberLabCategory;
  severity?: CyberSeverity;
  status?: CyberLabStatus;
  isFeatured?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CyberLabListResponse {
  status: string;
  data: {
    labs: CyberLab[];
    pagination?: PaginationMeta;
  };
}

export interface CyberLabResponse {
  status: string;
  data: {
    lab: CyberLab;
  };
}

export interface FeaturedCyberLabsResponse {
  status: string;
  data: {
    labs: CyberLab[];
  };
}
