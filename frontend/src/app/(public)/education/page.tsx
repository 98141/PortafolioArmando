import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import PublicListing from "@/src/components/portfolio/PublicListing";
import type { SearchParams } from "@/src/lib/publicContent";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return buildMetadata({
    title: "Educación | Armando Mora",
    description: "Formación académica y especialización técnica en sistemas y ciberseguridad.",
    path: "/education",
    seo: settings.seo,
    branding: settings.branding,
  });
}

export default async function EducationPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const listing = await PublicListing({ resource: "education", searchParams: await searchParams });
  return (
    <>
      <PageHero
        eyebrow="Academic"
        title="Educación"
        description="Trayectoria académica con enfoque en ingeniería de software, redes y seguridad informática."
      />
      <section className="px-4 pb-20 lg:px-8"><div className="mx-auto max-w-6xl">{listing}</div></section>
    </>
  );
}
