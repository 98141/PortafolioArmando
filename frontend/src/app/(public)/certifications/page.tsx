import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import CertificationsPageClient from "@/src/app/(public)/certifications/CertificationsPageClient";
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

export default function CertificationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Formación continua"
        title="Certificaciones"
        description="Credenciales y cursos que respaldan mi perfil dual: desarrollo de software y seguridad aplicada."
      />
      <CertificationsPageClient />
    </>
  );
}
