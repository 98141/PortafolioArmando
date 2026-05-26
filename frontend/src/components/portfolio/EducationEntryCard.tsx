"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { Education } from "@/src/types/education";
import TechBadge from "@/src/components/ui/TechBadge";
import { academicLevelLabels } from "@/src/lib/educationLabels";
import { formatEducationPeriod } from "@/src/lib/dateFormat";

interface EducationEntryCardProps {
  entry: Education;
  showAchievements?: number;
}

export default function EducationEntryCard({
  entry,
  showAchievements,
}: EducationEntryCardProps) {
  const period = formatEducationPeriod(entry.startedAt, entry.completedAt, entry.isCurrent);
  const focus =
    entry.focusAreas.length > 0
      ? entry.focusAreas.join(" · ")
      : entry.fieldOfStudy ?? entry.description;

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          {entry.logo?.url ? (
            <Image
              src={entry.logo.url}
              alt={entry.logo.alt ?? entry.institution}
              width={32}
              height={32}
              className="mt-0.5 rounded-lg object-contain"
            />
          ) : (
            <GraduationCap
              className="h-6 w-6 shrink-0 text-purple-400"
              aria-hidden="true"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">
              <Link href={`/education/${entry.slug}`} className="hover:text-cyan-300">
                {entry.title}
              </Link>
            </h2>
            <p className="mt-1 text-zinc-400">{entry.institution}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {academicLevelLabels[entry.academicLevel]}
            </p>
          </div>
        </div>
        <TechBadge
          label={entry.isCurrent ? "En curso" : "Completado"}
          variant={entry.isCurrent ? "cyan" : "status"}
        />
      </div>
      {period && <p className="mt-3 text-sm font-medium text-cyan-400/80">{period}</p>}
      {focus && <p className="mt-4 text-sm leading-relaxed text-zinc-400">{focus}</p>}
      {entry.achievements.length > 0 && (
        <ul className="mt-4 space-y-2" aria-label="Logros">
          {entry.achievements
            .slice(0, showAchievements ?? entry.achievements.length)
            .map((achievement) => (
              <li key={achievement} className="text-sm text-zinc-500">
                · {achievement}
              </li>
            ))}
        </ul>
      )}
      <div className="mt-4">
        <Link href={`/education/${entry.slug}`} className="text-xs text-purple-300 hover:text-purple-200">
          Ver detalle
        </Link>
      </div>
    </div>
  );
}
