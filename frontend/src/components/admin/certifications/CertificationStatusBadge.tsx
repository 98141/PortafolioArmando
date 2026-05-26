"use client";

import type { CertificationStatus } from "@/src/types/certification";
import {
  certificationStatusLabels,
  certificationStatusVariants,
} from "@/src/lib/certificationLabels";
import TechBadge from "@/src/components/ui/TechBadge";

interface CertificationStatusBadgeProps {
  status: CertificationStatus;
}

export default function CertificationStatusBadge({ status }: CertificationStatusBadgeProps) {
  return (
    <TechBadge
      label={certificationStatusLabels[status]}
      variant={certificationStatusVariants[status]}
    />
  );
}
