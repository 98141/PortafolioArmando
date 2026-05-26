import { api } from "@/src/services/api";
import type {
  FeaturedProjectsResponse,
  ProjectListResponse,
  ProjectQueryParams,
  ProjectResponse,
} from "@/src/types/project";

const buildParams = (params?: ProjectQueryParams) => {
  const search = new URLSearchParams();
  if (!params) return search;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      search.set(key, String(value));
    }
  });

  return search;
};

export const projectService = {
  async getProjects(params?: ProjectQueryParams) {
    const { data } = await api.get<ProjectListResponse>("/projects", {
      params: buildParams(params),
    });
    return data.data;
  },

  async getFeaturedProjects(limit = 6) {
    const { data } = await api.get<FeaturedProjectsResponse>("/projects/featured", {
      params: { limit },
    });
    return data.data.projects;
  },

  async getProjectBySlug(slug: string) {
    const { data } = await api.get<ProjectResponse>(`/projects/${slug}`);
    return data.data.project;
  },

  async getAdminProjects(params?: ProjectQueryParams) {
    const { data } = await api.get<ProjectListResponse>("/admin/projects", {
      params: buildParams(params),
    });
    return data.data;
  },

  async getAdminProjectById(id: string) {
    const { data } = await api.get<ProjectResponse>(`/admin/projects/${id}`);
    return data.data.project;
  },

  async createProject(payload: Record<string, unknown>) {
    const { data } = await api.post<ProjectResponse>("/admin/projects", payload);
    return data.data.project;
  },

  async updateProject(id: string, payload: Record<string, unknown>) {
    const { data } = await api.patch<ProjectResponse>(`/admin/projects/${id}`, payload);
    return data.data.project;
  },

  async deleteProject(id: string) {
    await api.delete(`/admin/projects/${id}`);
  },
};
