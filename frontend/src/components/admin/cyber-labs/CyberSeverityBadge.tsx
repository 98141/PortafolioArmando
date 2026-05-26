import type { CyberSeverity } from "@/src/types/cyberLab";
import { cyberSeverityLabels } from "@/src/lib/cyberLabLabels";
import TechBadge from "@/src/components/ui/TechBadge";

const variantMap: Record<
  CyberSeverity,
  "default" | "cyan" | "blue" | "purple" | "status"
> = {
  informational: "default",
  low: "blue",
  medium: "cyan",
  high: "purple",
  critical: "status",
};

interface CyberSeverityBadgeProps {
  severity: CyberSeverity;
}

export default function CyberSeverityBadge({ severity }: CyberSeverityBadgeProps) {
  return (
    <TechBadge label={cyberSeverityLabels[severity]} variant={variantMap[severity]} />
  );
}
