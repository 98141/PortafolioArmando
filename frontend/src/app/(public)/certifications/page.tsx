import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import CertificationsPageClient from "@/src/app/(public)/certifications/CertificationsPageClient";

export const metadata: Metadata = {
  title: "Certificaciones | Armando Mora",
  description: "Certificaciones y formación continua en desarrollo, cloud y ciberseguridad.",
};

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
