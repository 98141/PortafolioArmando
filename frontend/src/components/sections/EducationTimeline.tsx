import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { education } from "@/src/data/portfolioData";
import SectionHeader from "@/src/components/ui/SectionHeader";
import TechBadge from "@/src/components/ui/TechBadge";

export default function EducationTimeline() {
  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Educación"
            title="Trayectoria académica"
            description="Formación formal y especialización técnica."
          />
          <Link
            href="/education"
            className="inline-flex items-center gap-1 text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            Ver detalle
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative mt-10">
          <div
            className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/30 to-transparent sm:block"
            aria-hidden="true"
          />
          <div className="space-y-8">
            {education.map((entry, i) => (
              <article key={entry.id} className="relative sm:pl-12">
                <div className="absolute left-2.5 top-1.5 hidden h-3 w-3 rounded-full border-2 border-cyan-400 bg-[#050508] sm:block" />
                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <GraduationCap
                        className="mt-0.5 h-5 w-5 shrink-0 text-purple-400"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-semibold text-zinc-100">{entry.degree}</h3>
                        <p className="text-sm text-zinc-400">{entry.institution}</p>
                      </div>
                    </div>
                    <TechBadge
                      label={entry.status === "in-progress" ? "En curso" : "Completado"}
                      variant={entry.status === "in-progress" ? "cyan" : "status"}
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">{entry.period}</p>
                  <p className="mt-3 text-sm text-zinc-400">{entry.focus}</p>
                  {i === 0 && (
                    <ul className="mt-3 space-y-1">
                      {entry.achievements.slice(0, 2).map((a) => (
                        <li key={a} className="text-xs text-zinc-500">
                          · {a}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
