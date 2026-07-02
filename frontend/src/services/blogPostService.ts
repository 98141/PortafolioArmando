import { api } from "@/src/services/api";
import type {
  BlogPostListResponse,
  BlogPostQueryParams,
  BlogPostResponse,
  FeaturedBlogPostsResponse,
} from "@/src/types/blogPost";

const buildParams = (params?: BlogPostQueryParams) => {
  const search = new URLSearchParams();
  if (!params) return search;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      search.set(key, String(value));
    }
  });

  return search;
};

export const blogPostService = {
  async getBlogPosts(params?: BlogPostQueryParams) {
    const { data } = await api.get<BlogPostListResponse>("/blog", {
      params: buildParams(params),
    });
    return data.data;
  },

  async getFeaturedBlogPosts(limit = 6) {
    const { data } = await api.get<FeaturedBlogPostsResponse>("/blog/featured", {
      params: { limit },
    });
    return data.data.posts;
  },

  async getBlogPostBySlug(slug: string) {
    const { data } = await api.get<BlogPostResponse>(`/blog/${slug}`);
    return data.data.post;
  },

  async getAdminBlogPosts(params?: BlogPostQueryParams) {
    const { data } = await api.get<BlogPostListResponse>("/admin/blog", {
      params: buildParams(params),
    });
    return data.data;
  },

  async getAdminBlogPostById(id: string) {
    const { data } = await api.get<BlogPostResponse>(`/admin/blog/${id}`);
    return data.data.post;
  },

  async createBlogPost(payload: Record<string, unknown>) {
    const { data } = await api.post<BlogPostResponse>("/admin/blog", payload);
    return data.data.post;
  },

  async updateBlogPost(id: string, payload: Record<string, unknown>) {
    const { data } = await api.patch<BlogPostResponse>(`/admin/blog/${id}`, payload);
    return data.data.post;
  },

  async deleteBlogPost(id: string) {
    await api.delete(`/admin/blog/${id}`);
  },
};
