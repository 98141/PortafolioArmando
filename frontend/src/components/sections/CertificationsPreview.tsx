import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { featuredCertifications } from "@/src/data/portfolioData";
import GlassCard from "@/src/components/ui/GlassCard";
import SectionHeader from "@/src/components/ui/SectionHeader";
import TechBadge from "@/src/components/ui/TechBadge";

const statusMap = {
  completed: { label: "Completada", variant: "status" as const },
  "in-progress": { label: "En curso", variant: "cyan" as const },
  planned: { label: "Planificada", variant: "default" as const },
};

export default function CertificationsPreview() {
  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Formación"
            title="Certificaciones"
            description="Aprendizaje continuo en desarrollo y seguridad."
          />
          <Link
            href="/certifications"
            className="inline-flex items-center gap-1 text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {featuredCertifications.map((cert) => {
            const st = statusMap[cert.status];
            return (
              <GlassCard key={cert.id} className="flex gap-4 p-5" hover>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                  <Award className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-zinc-100">{cert.title}</h3>
                    <TechBadge label={st.label} variant={st.variant} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {cert.issuer} · {cert.date}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
