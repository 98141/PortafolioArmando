"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";
import type { Certification } from "@/src/types/certification";
import GlassCard from "@/src/components/ui/GlassCard";
import TechBadge from "@/src/components/ui/TechBadge";
import CertificationStatusBadge from "@/src/components/admin/certifications/CertificationStatusBadge";
import { certificationCategoryLabels } from "@/src/lib/certificationLabels";
import { formatCertificationDate } from "@/src/lib/dateFormat";

interface CertificationCardProps {
  certification: Certification;
  compact?: boolean;
}

export default function CertificationCard({
  certification,
  compact = false,
}: CertificationCardProps) {
  const dateStr = formatCertificationDate(certification.issuedAt, certification.expiresAt);

  return (
    <GlassCard as="article" className={compact ? "flex gap-4 p-5" : "p-6"} hover>
      <div className={compact ? "flex gap-4" : "flex gap-4"}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ${
            compact ? "h-10 w-10" : "h-12 w-12"
          }`}
        >
          {certification.badge?.url ? (
            <Image
              src={certification.badge.url}
              alt={certification.badge.alt ?? certification.title}
              width={compact ? 28 : 32}
              height={compact ? 28 : 32}
              className="rounded-lg object-contain"
            />
          ) : (
            <Award
              className={compact ? "h-5 w-5 text-amber-400" : "h-6 w-6 text-amber-400"}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={compact ? "font-medium text-zinc-100" : "font-semibold text-zinc-100"}>
              <Link href={`/certifications/${certification.slug}`} className="hover:text-cyan-300">
                {certification.title}
              </Link>
            </h2>
            <CertificationStatusBadge status={certification.status} />
          </div>
          <p className="mt-1 text-sm text-zinc-400">{certification.issuer}</p>
          {dateStr && (
            <p className={`text-zinc-500 ${compact ? "mt-1 text-xs" : "mt-2 text-xs"}`}>
              {dateStr}
            </p>
          )}
          {!compact && certification.description && (
            <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
              {certification.description}
            </p>
          )}
          <div className={`flex flex-wrap gap-2 ${compact ? "mt-2" : "mt-3"}`}>
            <TechBadge
              label={certificationCategoryLabels[certification.category]}
              variant="purple"
            />
            {certification.credentialId && (
              <TechBadge label={certification.credentialId} variant="default" />
            )}
            {certification.skills.slice(0, compact ? 2 : 4).map((skill) => (
              <TechBadge key={skill} label={skill} variant="cyan" />
            ))}
          </div>
          <div className={`flex flex-wrap gap-3 ${compact ? "mt-3" : "mt-4"}`}>
            <Link href={`/certifications/${certification.slug}`} className="text-xs text-purple-300 hover:text-purple-200">
              Ver detalle
            </Link>
            {certification.credentialUrl && (
              <a
                href={certification.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                Ver credencial
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
