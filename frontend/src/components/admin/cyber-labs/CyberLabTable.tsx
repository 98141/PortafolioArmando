"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { CyberLab } from "@/src/types/cyberLab";
import { cyberLabCategoryLabels } from "@/src/lib/cyberLabLabels";
import CyberSeverityBadge from "@/src/components/admin/cyber-labs/CyberSeverityBadge";
import TechBadge from "@/src/components/ui/TechBadge";
import { cyberLabStatusLabels } from "@/src/lib/cyberLabLabels";

interface CyberLabTableProps {
  labs: CyberLab[];
  onDelete: (lab: CyberLab) => void;
}

export default function CyberLabTable({ labs, onDelete }: CyberLabTableProps) {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Security case</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Severidad</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Flags</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((lab) => (
              <tr
                key={lab._id}
                className="border-b border-white/5 transition hover:bg-white/[0.02]"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-zinc-100">{lab.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{lab.slug}</p>
                </td>
                <td className="px-4 py-4">
                  <TechBadge
                    label={cyberLabCategoryLabels[lab.category]}
                    variant="purple"
                  />
                </td>
                <td className="px-4 py-4">
                  <CyberSeverityBadge severity={lab.severity} />
                </td>
                <td className="px-4 py-4 text-zinc-400">
                  {cyberLabStatusLabels[lab.status]}
                </td>
                <td className="px-4 py-4 text-zinc-300">{lab.priority}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {lab.isFeatured && <TechBadge label="Destacado" variant="cyan" />}
                    {!lab.isActive && <TechBadge label="Inactivo" variant="default" />}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/cyber-labs/${lab._id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-purple-500/40"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(lab)}
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
