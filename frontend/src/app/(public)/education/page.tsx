import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import EducationPageClient from "@/src/app/(public)/education/EducationPageClient";

export const metadata: Metadata = {
  title: "Educación | Armando Mora",
  description: "Formación académica y especialización técnica en sistemas y ciberseguridad.",
};

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
