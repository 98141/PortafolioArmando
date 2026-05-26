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
  const base = settings.seo?.canonicalBaseUrl || "https://armandomora.dev";
  return (
    <>
      <JsonLd data={[personJsonLd(settings, base), websiteJsonLd(settings, base)]} />
      <HeroSection cvUrl={settings.cv?.url} />
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
