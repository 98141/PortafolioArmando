"use client";

import TechBadge from "@/src/components/ui/TechBadge";

interface EducationStatusBadgeProps {
  isCurrent: boolean;
}

export default function EducationStatusBadge({ isCurrent }: EducationStatusBadgeProps) {
  return (
    <TechBadge
      label={isCurrent ? "En curso" : "Completado"}
      variant={isCurrent ? "cyan" : "status"}
    />
  );
}
