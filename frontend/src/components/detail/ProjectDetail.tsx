import Link from "next/link";
import type { Project } from "@/src/types/project";
import DetailHero from "@/src/components/detail/DetailHero";
import DetailMetaGrid from "@/src/components/detail/DetailMetaGrid";
import DetailSection from "@/src/components/detail/DetailSection";

export default function ProjectDetail({ project }: { project: Project }) {
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
            { label: "Categoría", value: project.category },
            { label: "Estado", value: project.status },
            { label: "Inicio", value: project.startedAt?.slice(0, 10) },
            { label: "Finalización", value: project.completedAt?.slice(0, 10) },
          ]}
        />
        <DetailSection title="Descripción" content={project.longDescription || project.shortDescription} />
        <DetailSection title="Tecnologías" items={project.technologies} />
        <DetailSection title="Features" items={project.features} />
        <div className="flex flex-wrap gap-3">
          {project.links?.demo && (
            <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-cyan-500/40 px-4 py-2 text-sm text-cyan-300">
              Ver demo
            </a>
          )}
          {project.links?.github && (
            <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/20 px-4 py-2 text-sm text-zinc-200">
              GitHub
            </a>
          )}
          <Link href="/contact" className="rounded-xl gradient-accent px-4 py-2 text-sm font-medium text-white">
            Contactar
          </Link>
        </div>
      </section>
    </>
  );
}
