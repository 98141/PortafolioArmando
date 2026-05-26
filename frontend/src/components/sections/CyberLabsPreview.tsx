import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featuredLabs } from "@/src/data/portfolioData";
import GlassCard from "@/src/components/ui/GlassCard";
import SectionHeader from "@/src/components/ui/SectionHeader";
import TechBadge from "@/src/components/ui/TechBadge";

export default function CyberLabsPreview() {
  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Ciberseguridad"
            title="Laboratorios técnicos"
            description="Enfoque defensivo, metodología clara y resultados documentados."
          />
          <Link
            href="/cybersecurity"
            className="inline-flex items-center gap-1 text-sm text-purple-400 transition hover:text-purple-300"
          >
            Explorar labs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featuredLabs.map((lab) => (
            <GlassCard key={lab.id} as="article" className="p-6" hover>
              <TechBadge label={lab.focus} variant="purple" />
              <h3 className="mt-4 font-semibold text-zinc-100">{lab.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{lab.description}</p>
              <p className="mt-4 text-xs text-zinc-500">
                <span className="text-zinc-400">Metodología:</span> {lab.methodology}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {lab.tools.slice(0, 3).map((tool) => (
                  <TechBadge key={tool} label={tool} variant="default" />
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
