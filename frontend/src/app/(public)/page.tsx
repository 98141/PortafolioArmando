import { getPublicList, type Resource } from "@/src/lib/publicContent";
import { siteOrigin } from "@/src/lib/publicConfig";
import HeroSection from "@/src/components/sections/HeroSection";
import ProfessionalSummary from "@/src/components/sections/ProfessionalSummary";
import ExpertiseSection from "@/src/components/sections/ExpertiseSection";
import FeaturedProjects from "@/src/components/sections/FeaturedProjects";
import CyberLabsPreview from "@/src/components/sections/CyberLabsPreview";
import CertificationsPreview from "@/src/components/sections/CertificationsPreview";
import EducationTimeline from "@/src/components/sections/EducationTimeline";
import BlogPreview from "@/src/components/sections/BlogPreview";
import CallToAction from "@/src/components/sections/CallToAction";
import JsonLd from "@/src/components/seo/JsonLd";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { personJsonLd, websiteJsonLd } from "@/src/lib/jsonLd";
import { buildMetadata } from "@/src/lib/seo";

export async function generateMetadata() {
  const settings = await getPublicSiteSettings();
  return buildMetadata({
    title: settings.seo?.defaultTitle || "Inicio | Armando Mora",
    description: settings.seo?.defaultDescription,
    path: "/",
    seo: settings.seo,
    branding: settings.branding,
  });
}

export default async function HomePage() {
  const settings = await getPublicSiteSettings();
  const totals = await Promise.all((["projects", "cybersecurity", "certifications", "education"] as Resource[]).map(resource =>
    getPublicList(resource, { limit: 1 }).then(result => result.pagination.total).catch(() => null)));
  const labels = ["Proyectos", "Laboratorios", "Certificaciones", "Estudios"];
  const metrics = totals.flatMap((total, index) => total === null ? [] : [{ value: String(total), label: labels[index], description: "Publicados en este portafolio" }]);
  const base = siteOrigin;
  return (
    <>
      <JsonLd data={[personJsonLd(settings, base), websiteJsonLd(settings, base)]} />
      <HeroSection cvUrl={settings.cv?.url} metrics={metrics} />
      <ProfessionalSummary />
      <ExpertiseSection />
      <FeaturedProjects />
      <CyberLabsPreview />
      <CertificationsPreview />
      <EducationTimeline />
      <BlogPreview />
      <CallToAction />
    </>
  );
}
