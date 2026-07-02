import type { SiteSettings } from "@/src/types/siteSettings";

const fallback: SiteSettings = {};

const resolveApiUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const getPublicSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const res = await fetch(`${resolveApiUrl()}/site-settings`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { data?: { settings?: SiteSettings } };
    return json.data?.settings || fallback;
  } catch {
    return fallback;
  }
};
