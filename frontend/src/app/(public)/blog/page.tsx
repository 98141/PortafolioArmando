import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import BlogPageClient from "@/src/app/(public)/blog/BlogPageClient";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return buildMetadata({
    title: "Knowledge Hub | Armando Mora",
    description:
      "Artículos técnicos sobre desarrollo seguro, AppSec, arquitectura y ciberseguridad aplicada.",
    path: "/blog",
    seo: settings.seo,
    branding: settings.branding,
  });
}

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Engineering Blog"
        title="Knowledge Hub"
        description="Writeups, tutoriales y análisis técnicos con enfoque profesional en software y seguridad."
      />
      <BlogPageClient />
    </>
  );
}
