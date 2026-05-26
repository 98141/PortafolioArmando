import { api } from "@/src/services/api";
import type { InternalAxiosRequestConfig } from "axios";

export type UploadResourceType = "image" | "raw";

export interface UploadResponse {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: UploadResourceType;
  format?: string;
  bytes?: number;
  originalName?: string;
}

type UploadFile = File;

/** Upload requests must never be retried by the auth refresh interceptor. */
const uploadRequestConfig = (): InternalAxiosRequestConfig & { _retry?: boolean } =>
  ({ _retry: true }) as InternalAxiosRequestConfig & { _retry?: boolean };

const uploadTo = async (url: string, file: UploadFile): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<{ status: string; data: UploadResponse }>(
    url,
    formData,
    uploadRequestConfig()
  );

  return data.data;
};

export const uploadService = {
  uploadProjectImage: (file: UploadFile) =>
    uploadTo("/admin/uploads/project-image", file),
  uploadCyberEvidence: (file: UploadFile) =>
    uploadTo("/admin/uploads/cyber-evidence", file),
  uploadCyberReport: (file: UploadFile) =>
    uploadTo("/admin/uploads/cyber-report", file),
  uploadCertificationBadge: (file: UploadFile) =>
    uploadTo("/admin/uploads/certification-badge", file),
  uploadEducationLogo: (file: UploadFile) =>
    uploadTo("/admin/uploads/education-logo", file),
  uploadBlogCover: (file: UploadFile) =>
    uploadTo("/admin/uploads/blog-cover", file),
  uploadAuthorAvatar: (file: UploadFile) =>
    uploadTo("/admin/uploads/author-avatar", file),
  uploadCv: (file: UploadFile) => uploadTo("/admin/uploads/cv", file),

  deleteUploadedAsset: async (publicId: string, resourceType: UploadResourceType) => {
    await api.delete("/admin/uploads", {
      data: { publicId, resourceType },
      _retry: true,
    } as InternalAxiosRequestConfig & { _retry?: boolean; data: object });
  },

  /** Best-effort cleanup; returns false if delete failed (non-blocking). */
  tryDeleteUploadedAsset: async (
    publicId: string,
    resourceType: UploadResourceType
  ): Promise<boolean> => {
    try {
      await uploadService.deleteUploadedAsset(publicId, resourceType);
      return true;
    } catch {
      return false;
    }
  },
};
