import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import PublicListing from "@/src/components/portfolio/PublicListing";
import type { SearchParams } from "@/src/lib/publicContent";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return buildMetadata({
    title: "Proyectos | Armando Mora",
    description: "Proyectos de desarrollo full stack, APIs, e-commerce y herramientas de seguridad.",
    path: "/projects",
    seo: settings.seo,
    branding: settings.branding,
  });
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const listing = await PublicListing({ resource: "projects", searchParams: await searchParams });
  return (
    <>
      <PageHero
        eyebrow="Software Development"
        title="Proyectos"
        description="Aplicaciones web, APIs y soluciones con arquitectura moderna, validación robusta y enfoque en mantenibilidad."
      />
      <section className="px-4 pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {listing}
        </div>
      </section>
    </>
  );
}
