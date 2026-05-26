import Link from "next/link";
import type { CyberLab } from "@/src/types/cyberLab";
import DetailHero from "@/src/components/detail/DetailHero";
import DetailMetaGrid from "@/src/components/detail/DetailMetaGrid";
import DetailSection from "@/src/components/detail/DetailSection";

export default function CyberLabDetail({ lab }: { lab: CyberLab }) {
  return (
    <>
      <DetailHero
        title={lab.title}
        subtitle={lab.subtitle}
        description={lab.shortDescription}
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: "Ciberseguridad", href: "/cybersecurity" },
          { label: lab.title },
        ]}
      />
      <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 lg:px-8">
        <DetailMetaGrid
          items={[
            { label: "Categoría", value: lab.category },
            { label: "Severidad", value: lab.severity },
            { label: "Estado", value: lab.status },
            { label: "Prioridad", value: lab.priority },
          ]}
        />
        <DetailSection title="Descripción técnica" content={lab.fullDescription || lab.shortDescription} />
        <DetailSection title="Metodología" items={lab.methodology} />
        <DetailSection title="Tools" items={lab.tools} />
        <DetailSection title="Mitigaciones" items={lab.mitigations} />
        <div className="flex flex-wrap gap-3">
          {lab.report?.url && (
            <a href={lab.report.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-cyan-500/40 px-4 py-2 text-sm text-cyan-300">
              Ver reporte
            </a>
          )}
          <Link href="/contact" className="rounded-xl gradient-accent px-4 py-2 text-sm font-medium text-white">
            Solicitar consultoría
          </Link>
        </div>
      </section>
    </>
  );
}
