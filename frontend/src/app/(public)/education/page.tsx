import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import EducationPageClient from "@/src/app/(public)/education/EducationPageClient";
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

export default function EducationPage() {
  return (
    <>
      <PageHero
        eyebrow="Academic"
        title="Educación"
        description="Trayectoria académica con enfoque en ingeniería de software, redes y seguridad informática."
      />
      <EducationPageClient />
    </>
  );
}
