import type { Metadata } from "next";
import { Award } from "lucide-react";
import { certifications } from "@/src/data/portfolioData";
import PageHero from "@/src/components/portfolio/PageHero";
import GlassCard from "@/src/components/ui/GlassCard";
import TechBadge from "@/src/components/ui/TechBadge";

export const metadata: Metadata = {
  title: "Certificaciones | Armando Mora",
  description: "Certificaciones y formación continua en desarrollo, cloud y ciberseguridad.",
};

const categoryLabels = {
  cybersecurity: "Ciberseguridad",
  cloud: "Cloud",
  development: "Desarrollo",
  academic: "Académico",
};

const statusLabels = {
  completed: { label: "Completada", variant: "status" as const },
  "in-progress": { label: "En curso", variant: "cyan" as const },
  planned: { label: "Planificada", variant: "default" as const },
};

export default function CertificationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Formación continua"
        title="Certificaciones"
        description="Credenciales y cursos que respaldan mi perfil dual: desarrollo de software y seguridad aplicada."
      />
      <section className="px-4 pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 sm:grid-cols-2">
            {certifications.map((cert) => {
              const st = statusLabels[cert.status];
              return (
                <GlassCard key={cert.id} as="article" className="p-6" hover>
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                      <Award className="h-6 w-6 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-zinc-100">{cert.title}</h2>
                        <TechBadge label={st.label} variant={st.variant} />
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{cert.issuer}</p>
                      <p className="mt-2 text-xs text-zinc-500">{cert.date}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <TechBadge
                          label={categoryLabels[cert.category]}
                          variant="purple"
                        />
                        {cert.credentialId && (
                          <TechBadge label={cert.credentialId} variant="default" />
                        )}
                      </div>
                      {cert.url && (
                        <a
                          href={cert.url}
                          className="mt-4 inline-block text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          Ver credencial →
                        </a>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
