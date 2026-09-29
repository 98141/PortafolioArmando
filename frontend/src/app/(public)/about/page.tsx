import { siteOrigin } from "@/src/lib/publicConfig";
import type { Metadata } from "next";
import { mainLines, skillGroups } from "@/src/data/portfolioData";
import PageHero from "@/src/components/portfolio/PageHero";
import GlassCard from "@/src/components/ui/GlassCard";
import SectionHeader from "@/src/components/ui/SectionHeader";
import TechBadge from "@/src/components/ui/TechBadge";
import { resolvePublicProfile } from "@/src/lib/publicProfile";
import JsonLd from "@/src/components/seo/JsonLd";
import { personJsonLd } from "@/src/lib/jsonLd";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return buildMetadata({
    title: "Sobre mí | Armando Mora",
    description: "Perfil profesional dual: desarrollo full stack y ciberseguridad aplicada.",
    path: "/about",
    seo: settings.seo,
    branding: settings.branding,
  });
}

export default async function AboutPage() {
  const settings = await getPublicSiteSettings();
  const base = siteOrigin;
  const profile = resolvePublicProfile(settings);
  return (
    <>
      <JsonLd data={personJsonLd(settings, base)} />
      <PageHero
        eyebrow="About"
        title="Sobre mí"
        description={profile.professionalTitle}
      />
      <section className="px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-16">
          <GlassCard className="p-6 sm:p-10">
            <h2 className="text-xl font-semibold">{profile.fullName}</h2>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-zinc-300">{profile.longBio || profile.shortBio}</p>
            {profile.location && <p className="mt-4 text-sm text-zinc-400">{profile.location}</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              {mainLines.map((line) => (
                <TechBadge key={line} label={line} variant="cyan" />
              ))}
            </div>
          </GlassCard>

          <div>
            <SectionHeader
              eyebrow="Skills"
              title="Tecnologías y áreas de trabajo"
              description="Los proyectos y laboratorios publicados documentan cómo se aplican estas tecnologías."
            />
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {skillGroups.map((group) => (
                <GlassCard key={group.category} className="p-6">
                  <h3 className="font-semibold text-zinc-100">{group.category}</h3>
                  <ul className="mt-5 space-y-4">
                    {group.skills.map((skill) => (
                      <li key={skill.name}>
                        <span className="text-sm text-zinc-300">{skill.name}</span>
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
