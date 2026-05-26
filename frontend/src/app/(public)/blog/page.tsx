import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import BlogPageClient from "@/src/app/(public)/blog/BlogPageClient";

export const metadata: Metadata = {
  title: "Knowledge Hub | Armando Mora",
  description:
    "Artículos técnicos sobre desarrollo seguro, AppSec, arquitectura y ciberseguridad aplicada.",
};

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
