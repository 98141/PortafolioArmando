import DetailBreadcrumbJsonLd from "@/src/components/seo/DetailBreadcrumbJsonLd";
import { siteOrigin } from "@/src/lib/publicConfig";
import type { Metadata } from "next";
import ProjectDetail from "@/src/components/detail/ProjectDetail";
import JsonLd from "@/src/components/seo/JsonLd";
import { getPublicDetail } from "@/src/lib/publicContent";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";
import { creativeWorkJsonLd } from "@/src/lib/jsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
    const [project, settings] = await Promise.all([
      getPublicDetail("projects", slug),
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
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
    const project = await getPublicDetail("projects", slug);
    const base = siteOrigin;
    return (
      <>
        <DetailBreadcrumbJsonLd section="projects" slug={slug} title={project.title} />
        <JsonLd data={creativeWorkJsonLd(project, base, "projects")} />
        <ProjectDetail project={project} />
      </>
    );
}
