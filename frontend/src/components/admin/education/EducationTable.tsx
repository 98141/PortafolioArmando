"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { Education } from "@/src/types/education";
import { academicLevelLabels } from "@/src/lib/educationLabels";
import EducationStatusBadge from "@/src/components/admin/education/EducationStatusBadge";
import TechBadge from "@/src/components/ui/TechBadge";

interface EducationTableProps {
  entries: Education[];
  onDelete: (entry: Education) => void;
}

export default function EducationTable({ entries, onDelete }: EducationTableProps) {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Programa</th>
              <th className="px-4 py-3 font-medium">Institución</th>
              <th className="px-4 py-3 font-medium">Nivel</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Flags</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry._id}
                className="border-b border-white/5 transition hover:bg-white/[0.02]"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-zinc-100">{entry.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{entry.slug}</p>
                </td>
                <td className="px-4 py-4 text-zinc-400">{entry.institution}</td>
                <td className="px-4 py-4">
                  <TechBadge
                    label={academicLevelLabels[entry.academicLevel]}
                    variant="purple"
                  />
                </td>
                <td className="px-4 py-4">
                  <EducationStatusBadge isCurrent={entry.isCurrent} />
                </td>
                <td className="px-4 py-4 text-zinc-300">{entry.priority}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {entry.isFeatured && <TechBadge label="Destacado" variant="cyan" />}
                    {!entry.isActive && <TechBadge label="Inactivo" variant="default" />}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/education/${entry._id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-500/40"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(entry)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
