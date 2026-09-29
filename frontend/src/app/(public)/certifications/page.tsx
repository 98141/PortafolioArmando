import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import PublicListing from "@/src/components/portfolio/PublicListing";
import type { SearchParams } from "@/src/lib/publicContent";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return buildMetadata({
    title: "Certificaciones | Armando Mora",
    description: "Certificaciones y formación continua en desarrollo, cloud y ciberseguridad.",
    path: "/certifications",
    seo: settings.seo,
    branding: settings.branding,
  });
}

export default async function CertificationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const listing = await PublicListing({ resource: "certifications", searchParams: await searchParams });
  return (
    <>
      <PageHero
        eyebrow="Formación continua"
        title="Certificaciones"
        description="Credenciales y cursos que respaldan mi perfil dual: desarrollo de software y seguridad aplicada."
      />
      <section className="px-4 pb-20 lg:px-8"><div className="mx-auto max-w-6xl">{listing}</div></section>
    </>
  );
}
