import { cache } from "react";
import { notFound } from "next/navigation";
import { apiBaseUrl } from "@/src/lib/publicConfig";
import type { Project, PaginationMeta } from "@/src/types/project";
import type { CyberLab } from "@/src/types/cyberLab";
import type { Certification } from "@/src/types/certification";
import type { Education } from "@/src/types/education";
import type { BlogPost } from "@/src/types/blogPost";

export interface ContentMap { projects: Project; cybersecurity: CyberLab; certifications: Certification; education: Education; blog: BlogPost }
export type Resource = keyof ContentMap;
export type SearchParams = Record<string, string | string[] | undefined>;
export const resources = {
  projects: { endpoint: "projects", key: "projects", single: "project" },
  cybersecurity: { endpoint: "cyber-labs", key: "labs", single: "lab" },
  certifications: { endpoint: "certifications", key: "certifications", single: "certification" },
  education: { endpoint: "education", key: "education", single: "education" },
  blog: { endpoint: "blog", key: "posts", single: "post" },
} as const;

export class PublicContentError extends Error {
  constructor(public status: number) { super("No se pudo cargar el contenido. Inténtalo de nuevo más tarde."); }
}

async function request(path: string) {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/${path}`, { next: { revalidate: 120 }, signal: AbortSignal.timeout(8000) });
  } catch { throw new PublicContentError(503); }
  if (!response.ok) throw new PublicContentError(response.status);
  try {
    const json = await response.json();
    if (json.status !== "success" || !json.data || typeof json.data !== "object") throw new Error();
    return json.data;
  } catch { throw new PublicContentError(502); }
}

export async function getPublicList<K extends Resource>(resource: K, params: Record<string, string | number> = {}) {
  const config = resources[resource];
  const query = new URLSearchParams(Object.entries({ page: 1, limit: 12, ...params }).map(([k, v]) => [k, String(v)]));
  const data = await request(`${config.endpoint}?${query}`);
  const items = data[config.key];
  const pagination = data.pagination as PaginationMeta;
  if (!Array.isArray(items) || items.some(item => !item || typeof item.slug !== "string" || typeof item.title !== "string") ||
      !pagination || !Number.isInteger(pagination.totalPages) || pagination.totalPages < 0 ||
      pagination.page !== Number(query.get("page")) || pagination.limit !== Number(query.get("limit")) ||
      !Number.isInteger(pagination.total) || pagination.total < 0) throw new PublicContentError(502);
  return { items: items as ContentMap[K][], pagination };
}

export const getPublicDetail = cache(async <K extends Resource>(resource: K, slug: string): Promise<ContentMap[K]> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  const config = resources[resource];
  let data;
  try { data = await request(`${config.endpoint}/${encodeURIComponent(slug)}`); }
  catch (error) {
    if (error instanceof PublicContentError && error.status === 404) notFound();
    throw error;
  }
  const item = data[config.single];
  if (!item || item.slug !== slug || typeof item.title !== "string") throw new PublicContentError(502);
  return item;
});

export async function getAllPublicItems<K extends Resource>(resource: K): Promise<ContentMap[K][]> {
  const first = await getPublicList(resource, { limit: 50 });
  const items = [...first.items];
  for (let page = 2; page <= first.pagination.totalPages; page++) {
    const next = await getPublicList(resource, { limit: 50, page });
    items.push(...next.items);
  }
  return Array.from(new Map(items.map(item => [item.slug, item])).values());
}
