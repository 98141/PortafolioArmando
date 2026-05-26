import { profile } from "@/src/data/portfolioData";
import GlassCard from "@/src/components/ui/GlassCard";
import SectionHeader from "@/src/components/ui/SectionHeader";

export default function ProfessionalSummary() {
  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Perfil"
          title="Resumen profesional"
          description="Ingeniería de software y ciberseguridad como una sola disciplina."
        />
        <GlassCard className="mt-8 p-6 sm:p-8" hover>
          <p className="text-base leading-relaxed text-zinc-300 sm:text-lg">
            {profile.summary}
          </p>
        </GlassCard>
      </div>
    </section>
  );
}
