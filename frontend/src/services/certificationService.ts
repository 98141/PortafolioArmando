import { api } from "@/src/services/api";
import type {
  CertificationListResponse,
  CertificationQueryParams,
  CertificationResponse,
  FeaturedCertificationsResponse,
} from "@/src/types/certification";

const buildParams = (params?: CertificationQueryParams) => {
  const search = new URLSearchParams();
  if (!params) return search;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      search.set(key, String(value));
    }
  });

  return search;
};

export const certificationService = {
  async getCertifications(params?: CertificationQueryParams) {
    const { data } = await api.get<CertificationListResponse>("/certifications", {
      params: buildParams(params),
    });
    return data.data;
  },

  async getFeaturedCertifications(limit = 6) {
    const { data } = await api.get<FeaturedCertificationsResponse>(
      "/certifications/featured",
      { params: { limit } }
    );
    return data.data.certifications;
  },

  async getCertificationBySlug(slug: string) {
    const { data } = await api.get<CertificationResponse>(`/certifications/${slug}`);
    return data.data.certification;
  },

  async getAdminCertifications(params?: CertificationQueryParams) {
    const { data } = await api.get<CertificationListResponse>("/admin/certifications", {
      params: buildParams(params),
    });
    return data.data;
  },

  async getAdminCertificationById(id: string) {
    const { data } = await api.get<CertificationResponse>(`/admin/certifications/${id}`);
    return data.data.certification;
  },

  async createCertification(payload: Record<string, unknown>) {
    const { data } = await api.post<CertificationResponse>("/admin/certifications", payload);
    return data.data.certification;
  },

  async updateCertification(id: string, payload: Record<string, unknown>) {
    const { data } = await api.patch<CertificationResponse>(
      `/admin/certifications/${id}`,
      payload
    );
    return data.data.certification;
  },

  async deleteCertification(id: string) {
    await api.delete(`/admin/certifications/${id}`);
  },
};
