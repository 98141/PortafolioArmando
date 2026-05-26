import type { CyberLab } from "@/src/types/portfolio";
import GlassCard from "@/src/components/ui/GlassCard";
import TechBadge from "@/src/components/ui/TechBadge";

const severityColors = {
  low: "default" as const,
  medium: "blue" as const,
  high: "purple" as const,
  critical: "cyan" as const,
};

interface CyberLabCardProps {
  lab: CyberLab;
}

export default function CyberLabCard({ lab }: CyberLabCardProps) {
  return (
    <GlassCard as="article" className="flex h-full flex-col p-6" hover>
      <div className="flex flex-wrap gap-2">
        <TechBadge label={lab.focus} variant="purple" />
        {lab.severity && (
          <TechBadge
            label={`Riesgo ${lab.severity}`}
            variant={severityColors[lab.severity]}
          />
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-100">{lab.title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{lab.description}</p>

      <div className="mt-4 space-y-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Metodología
          </p>
          <p className="mt-1 text-zinc-400">{lab.methodology}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Resultado
          </p>
          <p className="mt-1 text-zinc-400">{lab.outcome}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lab.tools.map((tool) => (
          <TechBadge key={tool} label={tool} variant="blue" />
        ))}
      </div>
      <p className="mt-4 text-xs text-zinc-600">{lab.year}</p>
    </GlassCard>
  );
}
