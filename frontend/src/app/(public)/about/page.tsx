import type { Metadata } from "next";
import { aboutStory, mainLines, profile, skillGroups } from "@/src/data/portfolioData";
import PageHero from "@/src/components/portfolio/PageHero";
import GlassCard from "@/src/components/ui/GlassCard";
import SectionHeader from "@/src/components/ui/SectionHeader";
import TechBadge from "@/src/components/ui/TechBadge";
import { cn } from "@/src/lib/cn";

export const metadata: Metadata = {
  title: "Sobre mí | Armando Mora",
  description:
    "Perfil profesional dual: desarrollo full stack y ciberseguridad aplicada.",
};

const levelWidth = {
  advanced: "w-full",
  intermediate: "w-2/3",
  foundational: "w-1/3",
};

const levelLabel = {
  advanced: "Avanzado",
  intermediate: "Intermedio",
  foundational: "Fundacional",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Sobre mí"
        description={profile.valueProposition}
      />
      <section className="px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-16">
          <GlassCard className="p-6 sm:p-10">
            <p className="text-lg leading-relaxed text-zinc-300">{aboutStory.intro}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
                <h2 className="font-semibold text-blue-200">Desarrollo de software</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {aboutStory.software}
                </p>
              </div>
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
                <h2 className="font-semibold text-purple-200">Ciberseguridad</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {aboutStory.cyber}
                </p>
              </div>
            </div>
            <p className="mt-8 text-sm leading-relaxed text-zinc-400">{aboutStory.closing}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {mainLines.map((line) => (
                <TechBadge key={line} label={line} variant="cyan" />
              ))}
            </div>
          </GlassCard>

          <div>
            <SectionHeader
              eyebrow="Skills"
              title="Matriz de habilidades"
              description="Nivel estimado basado en proyectos y laboratorios documentados."
            />
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {skillGroups.map((group) => (
                <GlassCard key={group.category} className="p-6">
                  <h3 className="font-semibold text-zinc-100">{group.category}</h3>
                  <ul className="mt-5 space-y-4">
                    {group.skills.map((skill) => (
                      <li key={skill.name}>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-300">{skill.name}</span>
                          <span className="text-xs text-zinc-500">
                            {levelLabel[skill.level]}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div
                            className={cn(
                              "h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500",
                              levelWidth[skill.level]
                            )}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
