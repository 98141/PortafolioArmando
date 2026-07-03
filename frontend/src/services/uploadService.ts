import { api } from "@/src/services/api";
import axios, { type InternalAxiosRequestConfig } from "axios";

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

const resolveUploadBase = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/**
 * Uses native fetch instead of the axios instance so the browser sets
 * Content-Type: multipart/form-data with the correct boundary automatically.
 * The axios instance default "Content-Type: application/json" would otherwise
 * prevent multer from parsing the multipart body.
 */
const uploadTo = async (url: string, file: UploadFile): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${resolveUploadBase()}${url}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    const err = Object.assign(new Error(body?.message || "Upload failed"), {
      response: { data: body, status: response.status },
    });
    throw err;
  }

  const json = (await response.json()) as { status: string; data: UploadResponse };
  return json.data;
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
