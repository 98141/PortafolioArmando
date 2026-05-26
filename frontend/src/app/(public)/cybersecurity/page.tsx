import type { Metadata } from "next";
import PageHero from "@/src/components/portfolio/PageHero";
import CyberLabsGrid from "@/src/components/portfolio/CyberLabsGrid";
import GlassCard from "@/src/components/ui/GlassCard";

export const metadata: Metadata = {
  title: "Ciberseguridad | Armando Mora",
  description:
    "Laboratorios técnicos de ciberseguridad: AppSec, forensics, red y cloud con metodología profesional.",
};

export default function CybersecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Cybersecurity"
        title="Laboratorios & AppSec"
        description="Práctica controlada, documentación rigurosa y enfoque defensivo. Sin sensacionalismo — solo ingeniería de seguridad aplicada."
      />
      <section className="px-4 pb-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <GlassCard className="mb-10 border-cyan-500/20 bg-cyan-500/5 p-6">
            <p className="text-sm leading-relaxed text-zinc-300">
              Todos los laboratorios se ejecutan en entornos autorizados o plataformas de
              práctica. Los hallazgos se documentan con metodología, herramientas, rating de
              riesgo y recomendaciones de remediación alineadas al desarrollo seguro.
            </p>
          </GlassCard>
          <CyberLabsGrid />
        </div>
      </section>
    </>
  );
}
