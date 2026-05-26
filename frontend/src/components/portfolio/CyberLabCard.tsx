import { FileText, Shield } from "lucide-react";
import type { CyberLab } from "@/src/types/cyberLab";
import { cyberLabCategoryLabels } from "@/src/lib/cyberLabLabels";
import GlassCard from "@/src/components/ui/GlassCard";
import TechBadge from "@/src/components/ui/TechBadge";
import CyberSeverityBadge from "@/src/components/admin/cyber-labs/CyberSeverityBadge";

interface CyberLabCardProps {
  lab: CyberLab;
}

export default function CyberLabCard({ lab }: CyberLabCardProps) {
  const year =
    lab.completedAt?.slice(0, 4) ||
    lab.startedAt?.slice(0, 4) ||
    lab.createdAt.slice(0, 4);

  return (
    <GlassCard as="article" className="flex h-full flex-col p-6" hover>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-400" aria-hidden="true" />
          <TechBadge label={cyberLabCategoryLabels[lab.category]} variant="purple" />
        </div>
        <CyberSeverityBadge severity={lab.severity} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-zinc-100">{lab.title}</h3>
      {lab.subtitle && (
        <p className="mt-1 text-xs text-zinc-500">{lab.subtitle}</p>
      )}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
        {lab.shortDescription}
      </p>

      {lab.methodology.length > 0 && (
        <p className="mt-4 text-xs text-zinc-500">
          <span className="text-zinc-400">Metodología:</span>{" "}
          {lab.methodology.slice(0, 3).join(" → ")}
          {lab.methodology.length > 3 ? "…" : ""}
        </p>
      )}

      {lab.findings.length > 0 && (
        <p className="mt-2 text-xs text-zinc-500 line-clamp-2">
          <span className="text-zinc-400">Hallazgo clave:</span> {lab.findings[0]}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lab.tools.slice(0, 4).map((tool) => (
          <TechBadge key={tool} label={tool} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lab.tags.slice(0, 3).map((tag) => (
          <TechBadge key={tag} label={tag} variant="cyan" />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-zinc-500">
        <span>{year}</span>
        {lab.report?.url && (
          <a
            href={lab.report.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            {lab.report.label ?? "Reporte PDF"}
          </a>
        )}
      </div>
    </GlassCard>
  );
}
