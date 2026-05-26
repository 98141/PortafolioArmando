export type ProjectCategory =
  | "fullstack"
  | "frontend"
  | "backend"
  | "ecommerce"
  | "cybersecurity"
  | "appsec"
  | "devops"
  | "other";

export type ProjectStatus = "planned" | "in_progress" | "completed" | "archived";

export interface ProjectImage {
  url?: string;
  publicId?: string;
  alt?: string;
}

export interface ProjectLinks {
  demo?: string;
  github?: string;
  documentation?: string;
  caseStudy?: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  shortDescription: string;
  longDescription?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  technologies: string[];
  features: string[];
  challenges: string[];
  learnings: string[];
  image?: ProjectImage;
  gallery?: ProjectImage[];
  links?: ProjectLinks;
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

export interface ProjectFormValues {
  title: string;
  subtitle: string;
  shortDescription: string;
  longDescription: string;
  category: ProjectCategory;
  status: ProjectStatus;
  technologiesInput: string;
  featuresInput: string;
  challengesInput: string;
  learningsInput: string;
  imageUrl: string;
  imageAlt: string;
  linksDemo: string;
  linksGithub: string;
  linksDocumentation: string;
  linksCaseStudy: string;
  isFeatured: boolean;
  isActive: boolean;
  priority: number;
  startedAt: string;
  completedAt: string;
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  category?: ProjectCategory;
  status?: ProjectStatus;
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

export interface ProjectListResponse {
  status: string;
  data: {
    projects: Project[];
    pagination?: PaginationMeta;
  };
}

export interface ProjectResponse {
  status: string;
  data: {
    project: Project;
  };
}

export interface FeaturedProjectsResponse {
  status: string;
  data: {
    projects: Project[];
  };
}
