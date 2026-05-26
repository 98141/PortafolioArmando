import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { education } from "@/src/data/portfolioData";
import PageHero from "@/src/components/portfolio/PageHero";
import TechBadge from "@/src/components/ui/TechBadge";

export const metadata: Metadata = {
  title: "Educación | Armando Mora",
  description: "Formación académica y especialización técnica en sistemas y ciberseguridad.",
};

export default function EducationPage() {
  return (
    <>
      <PageHero
        eyebrow="Academic"
        title="Educación"
        description="Trayectoria académica con enfoque en ingeniería de software, redes y seguridad informática."
      />
      <section className="px-4 pb-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="relative space-y-10">
            <div
              className="absolute left-[1.125rem] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/60 via-purple-500/40 to-transparent"
              aria-hidden="true"
            />
            {education.map((entry) => (
              <article key={entry.id} className="relative pl-12">
                <div className="absolute left-3 top-2 h-4 w-4 rounded-full border-2 border-cyan-400 bg-[#050508] shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
                <div className="glass-panel rounded-2xl p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <GraduationCap
                        className="h-6 w-6 shrink-0 text-purple-400"
                        aria-hidden="true"
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-zinc-100">
                          {entry.degree}
                        </h2>
                        <p className="mt-1 text-zinc-400">{entry.institution}</p>
                      </div>
                    </div>
                    <TechBadge
                      label={entry.status === "in-progress" ? "En curso" : "Completado"}
                      variant={entry.status === "in-progress" ? "cyan" : "status"}
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-cyan-400/80">{entry.period}</p>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">{entry.focus}</p>
                  <ul className="mt-4 space-y-2" aria-label="Logros">
                    {entry.achievements.map((achievement) => (
                      <li key={achievement} className="text-sm text-zinc-500">
                        · {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
