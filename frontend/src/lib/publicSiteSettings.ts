import type { SiteSettings } from "@/src/types/siteSettings";
import { apiBaseUrl } from "@/src/lib/publicConfig";

const fallback: SiteSettings = {};

export const getPublicSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const res = await fetch(`${apiBaseUrl}/site-settings`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { data?: { settings?: SiteSettings } };
    return json.data?.settings || fallback;
  } catch {
    return fallback;
  }
};
