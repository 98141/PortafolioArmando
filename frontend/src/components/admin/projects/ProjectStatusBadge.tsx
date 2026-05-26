import type { ProjectStatus } from "@/src/types/project";
import { projectStatusLabels } from "@/src/lib/projectLabels";
import TechBadge from "@/src/components/ui/TechBadge";

const variantMap: Record<
  ProjectStatus,
  "default" | "cyan" | "blue" | "purple" | "status"
> = {
  planned: "default",
  in_progress: "cyan",
  completed: "status",
  archived: "purple",
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <TechBadge label={projectStatusLabels[status]} variant={variantMap[status]} />
  );
}
