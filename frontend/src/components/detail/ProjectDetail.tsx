import Link from "next/link";
import type { Project } from "@/src/types/project";
import DetailHero from "@/src/components/detail/DetailHero";
import DetailMetaGrid from "@/src/components/detail/DetailMetaGrid";
import DetailSection from "@/src/components/detail/DetailSection";
import ProjectMedia from "./ProjectMedia";
import { projectCategoryLabels, projectStatusLabels } from "@/src/lib/projectLabels";
import { httpUrl } from "@/src/lib/publicLinks";

export default function ProjectDetail({ project }: { project: Project }) {
  const links = [
    { label: "Ver tienda o demo", url: project.links?.demo },
    { label: "Repositorio", url: project.links?.github },
    { label: "Documentación", url: project.links?.documentation },
    { label: "Caso de estudio externo", url: project.links?.caseStudy },
  ].map(link => ({ ...link, url: httpUrl(link.url) })).filter(link => link.url);
  return (
    <>
      <DetailHero
        title={project.title}
        subtitle={project.subtitle}
        description={project.shortDescription}
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: "Proyectos", href: "/projects" },
          { label: project.title },
        ]}
      />
      <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 lg:px-8">
        <DetailMetaGrid
          items={[
            { label: "Categoría", value: projectCategoryLabels[project.category] },
            { label: "Estado", value: projectStatusLabels[project.status] },
            { label: "Inicio", value: project.startedAt?.slice(0, 10) },
            { label: "Finalización", value: project.completedAt?.slice(0, 10) },
          ]}
        />
        {project.image?.url && <ProjectMedia image={project.image} title={project.title} priority />}
        <DetailSection title="Mi participación" content={project.caseStudy?.role} />
        <DetailSection title="El problema" content={project.caseStudy?.problem} />
        <DetailSection title="La solución" content={project.caseStudy?.solution} />
        <DetailSection title="Arquitectura y decisiones técnicas" content={project.caseStudy?.architecture} />
        <DetailSection title="Descripción" content={project.longDescription || project.shortDescription} />
        <DetailSection title="Tecnologías" items={project.technologies} />
        <DetailSection title="Funcionalidades" items={project.features} />
        <DetailSection title="Retos" items={project.challenges} />
        <DetailSection title="Resultados" content={project.caseStudy?.results} />
        <DetailSection title="Aprendizajes" items={project.learnings} />
        {!!project.gallery?.some(image => httpUrl(image.url)) && <section className="space-y-6" aria-labelledby="project-gallery-title">
          <h2 id="project-gallery-title" className="text-xl font-semibold">Capturas del proyecto</h2>
          {project.gallery.map((image, index) => <ProjectMedia key={`${image.url}-${index}`} image={image} title={`${project.title}, captura ${index + 1}`} />)}
        </section>}
        <div className="flex flex-wrap gap-3">
          {links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-cyan-500/40 px-4 py-2 text-sm text-cyan-300">{link.label}</a>)}
          <Link href="/contact" className="rounded-xl gradient-accent px-4 py-2 text-sm font-medium text-white">
            Contactar
          </Link>
        </div>
      </section>
    </>
  );
}
