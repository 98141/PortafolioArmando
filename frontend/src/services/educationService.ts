import { api } from "@/src/services/api";
import type {
  EducationListResponse,
  EducationQueryParams,
  EducationResponse,
  FeaturedEducationResponse,
} from "@/src/types/education";

const buildParams = (params?: EducationQueryParams) => {
  const search = new URLSearchParams();
  if (!params) return search;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      search.set(key, String(value));
    }
  });

  return search;
};

export const educationService = {
  async getEducation(params?: EducationQueryParams) {
    const { data } = await api.get<EducationListResponse>("/education", {
      params: buildParams(params),
    });
    return data.data;
  },

  async getFeaturedEducation(limit = 6) {
    const { data } = await api.get<FeaturedEducationResponse>("/education/featured", {
      params: { limit },
    });
    return data.data.education;
  },

  async getEducationBySlug(slug: string) {
    const { data } = await api.get<EducationResponse>(`/education/${slug}`);
    return data.data.education;
  },

  async getAdminEducation(params?: EducationQueryParams) {
    const { data } = await api.get<EducationListResponse>("/admin/education", {
      params: buildParams(params),
    });
    return data.data;
  },

  async getAdminEducationById(id: string) {
    const { data } = await api.get<EducationResponse>(`/admin/education/${id}`);
    return data.data.education;
  },

  async createEducation(payload: Record<string, unknown>) {
    const { data } = await api.post<EducationResponse>("/admin/education", payload);
    return data.data.education;
  },

  async updateEducation(id: string, payload: Record<string, unknown>) {
    const { data } = await api.patch<EducationResponse>(`/admin/education/${id}`, payload);
    return data.data.education;
  },

  async deleteEducation(id: string) {
    await api.delete(`/admin/education/${id}`);
  },
};
