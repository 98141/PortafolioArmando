import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import PublicListing from "@/src/components/portfolio/PublicListing";
import type { SearchParams } from "@/src/lib/publicContent";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return buildMetadata({
    title: "Knowledge Hub | Armando Mora",
    description:
      "Artículos técnicos sobre desarrollo seguro, AppSec, arquitectura y ciberseguridad aplicada.",
    path: "/blog",
    seo: settings.seo,
    branding: settings.branding,
  });
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const listing = await PublicListing({ resource: "blog", searchParams: await searchParams });
  return (
    <>
      <PageHero
        eyebrow="Engineering Blog"
        title="Knowledge Hub"
        description="Writeups, tutoriales y análisis técnicos con enfoque profesional en software y seguridad."
      />
      <section className="px-4 pb-20 lg:px-8"><div className="mx-auto max-w-6xl">{listing}</div></section>
    </>
  );
}
