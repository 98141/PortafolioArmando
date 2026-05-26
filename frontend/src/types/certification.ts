export type CertificationCategory =
  | "cybersecurity"
  | "software_development"
  | "devops"
  | "cloud"
  | "networking"
  | "database"
  | "programming"
  | "appsec"
  | "compliance"
  | "other";

export type CertificationStatus = "active" | "expired" | "archived";

export interface CertificationBadge {
  url?: string;
  alt?: string;
}

export interface Certification {
  _id: string;
  title: string;
  slug: string;
  issuer: string;
  credentialId?: string;
  credentialUrl?: string;
  badge?: CertificationBadge;
  description?: string;
  category: CertificationCategory;
  skills: string[];
  issuedAt?: string;
  expiresAt?: string;
  status: CertificationStatus;
  isFeatured: boolean;
  isActive: boolean;
  priority: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificationFormValues {
  title: string;
  issuer: string;
  credentialId: string;
  credentialUrl: string;
  badgeUrl: string;
  badgeAlt: string;
  description: string;
  category: CertificationCategory;
  skillsInput: string;
  issuedAt: string;
  expiresAt: string;
  status: CertificationStatus;
  isFeatured: boolean;
  isActive: boolean;
  priority: number;
}

export interface CertificationQueryParams {
  page?: number;
  limit?: number;
  category?: CertificationCategory;
  status?: CertificationStatus;
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

export interface CertificationListResponse {
  status: string;
  data: {
    certifications: Certification[];
    pagination?: PaginationMeta;
  };
}

export interface CertificationResponse {
  status: string;
  data: {
    certification: Certification;
  };
}

export interface FeaturedCertificationsResponse {
  status: string;
  data: {
    certifications: Certification[];
  };
}
