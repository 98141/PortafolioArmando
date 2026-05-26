export type BlogCategory =
  | "cybersecurity"
  | "software_development"
  | "appsec"
  | "devsecops"
  | "web_security"
  | "forensics"
  | "cloud_security"
  | "architecture"
  | "backend"
  | "frontend"
  | "databases"
  | "tutorials"
  | "case_study"
  | "writeup"
  | "career"
  | "other";

export type BlogStatus = "draft" | "published" | "archived";

export interface BlogCoverImage {
  url?: string;
  alt?: string;
}

export interface BlogSeo {
  title?: string;
  description?: string;
  canonicalUrl?: string;
}

export interface BlogAuthor {
  name?: string;
  role?: string;
  avatarUrl?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: BlogCoverImage;
  category: BlogCategory;
  tags: string[];
  status: BlogStatus;
  seo?: BlogSeo;
  author?: BlogAuthor;
  readingTime: number;
  relatedTopics: string[];
  allowComments: boolean;
  isFeatured: boolean;
  isActive: boolean;
  priority: number;
  publishedAt?: string;
  lastReviewedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostFormValues {
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  coverAlt: string;
  category: BlogCategory;
  tagsInput: string;
  status: BlogStatus;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  authorName: string;
  authorRole: string;
  authorAvatarUrl: string;
  relatedTopicsInput: string;
  allowComments: boolean;
  isFeatured: boolean;
  isActive: boolean;
  priority: number;
  publishedAt: string;
  lastReviewedAt: string;
}

export interface BlogPostQueryParams {
  page?: number;
  limit?: number;
  category?: BlogCategory;
  status?: BlogStatus;
  tag?: string;
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

export interface BlogPostListResponse {
  status: string;
  data: {
    posts: BlogPost[];
    pagination?: PaginationMeta;
  };
}

export interface BlogPostResponse {
  status: string;
  data: {
    post: BlogPost;
  };
}

export interface FeaturedBlogPostsResponse {
  status: string;
  data: {
    posts: BlogPost[];
  };
}
