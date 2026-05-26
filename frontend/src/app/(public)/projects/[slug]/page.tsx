import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjectDetail from "@/src/components/detail/ProjectDetail";
import JsonLd from "@/src/components/seo/JsonLd";
import { projectService } from "@/src/services/projectService";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";
import { creativeWorkJsonLd } from "@/src/lib/jsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [project, settings] = await Promise.all([
      projectService.getProjectBySlug(slug),
      getPublicSiteSettings(),
    ]);
    return buildMetadata({
      title: `${project.title} | Proyectos`,
      description: project.shortDescription,
      path: `/projects/${slug}`,
      seo: settings.seo,
      branding: settings.branding,
      imageUrl: project.image?.url,
    });
  } catch {
    return buildMetadata({ title: "Proyecto", path: `/projects/${slug}` });
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  try {
    const [project, settings] = await Promise.all([
      projectService.getProjectBySlug(slug),
      getPublicSiteSettings(),
    ]);
    const base = settings.seo?.canonicalBaseUrl || "https://armandomora.dev";
    return (
      <>
        <JsonLd data={creativeWorkJsonLd(project, base, "projects")} />
        <ProjectDetail project={project} />
      </>
    );
  } catch {
    notFound();
  }
}
