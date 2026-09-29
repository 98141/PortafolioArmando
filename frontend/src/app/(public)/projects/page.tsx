import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import PublicListing from "@/src/components/portfolio/PublicListing";
import type { SearchParams } from "@/src/lib/publicContent";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return buildMetadata({
    title: "Desarrollo web full stack | Proyectos de Armando Mora",
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
        eyebrow="Desarrollo de software"
        title="Proyectos de desarrollo full stack"
        description="Desarrollo web con React, Node.js y MongoDB: aplicaciones, APIs y e-commerce con validación de datos y enfoque en seguridad y mantenibilidad."
      />
      <section className="px-4 pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {listing}
        </div>
      </section>
    </>
  );
}
