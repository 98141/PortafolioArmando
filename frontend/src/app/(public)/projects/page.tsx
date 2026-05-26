import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import ProjectsGrid from "@/src/components/portfolio/ProjectsGrid";

export const metadata: Metadata = {
  title: "Proyectos | Armando Mora",
  description:
    "Proyectos de desarrollo full stack, APIs, e-commerce y herramientas de seguridad.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Software Development"
        title="Proyectos"
        description="Aplicaciones web, APIs y soluciones con arquitectura moderna, validación robusta y enfoque en mantenibilidad."
      />
      <section className="px-4 pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ProjectsGrid />
        </div>
      </section>
    </>
  );
}
