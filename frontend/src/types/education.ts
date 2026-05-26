export type AcademicLevel =
  | "diploma"
  | "technical"
  | "technologist"
  | "undergraduate"
  | "specialization"
  | "masters"
  | "doctorate"
  | "bootcamp"
  | "certification_program"
  | "other";

export interface EducationLogo {
  url?: string;
  publicId?: string;
  alt?: string;
}

export interface Education {
  _id: string;
  title: string;
  slug: string;
  institution: string;
  academicLevel: AcademicLevel;
  fieldOfStudy?: string;
  description?: string;
  achievements: string[];
  focusAreas: string[];
  logo?: EducationLogo;
  startedAt?: string;
  completedAt?: string;
  isCurrent: boolean;
  isFeatured: boolean;
  isActive: boolean;
  priority: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EducationFormValues {
  title: string;
  institution: string;
  academicLevel: AcademicLevel;
  fieldOfStudy: string;
  description: string;
  achievementsInput: string;
  focusAreasInput: string;
  logoUrl: string;
  logoPublicId?: string;
  logoAlt: string;
  startedAt: string;
  completedAt: string;
  isCurrent: boolean;
  isFeatured: boolean;
  isActive: boolean;
  priority: number;
}

export interface EducationQueryParams {
  page?: number;
  limit?: number;
  academicLevel?: AcademicLevel;
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

export interface EducationListResponse {
  status: string;
  data: {
    education: Education[];
    pagination?: PaginationMeta;
  };
}

export interface EducationResponse {
  status: string;
  data: {
    education: Education;
  };
}

export interface FeaturedEducationResponse {
  status: string;
  data: {
    education: Education[];
  };
}
