"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { Certification } from "@/src/types/certification";
import { certificationCategoryLabels } from "@/src/lib/certificationLabels";
import CertificationStatusBadge from "@/src/components/admin/certifications/CertificationStatusBadge";
import TechBadge from "@/src/components/ui/TechBadge";

interface CertificationTableProps {
  certifications: Certification[];
  onDelete: (cert: Certification) => void;
}

export default function CertificationTable({
  certifications,
  onDelete,
}: CertificationTableProps) {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Certificación</th>
              <th className="px-4 py-3 font-medium">Emisor</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Flags</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {certifications.map((cert) => (
              <tr
                key={cert._id}
                className="border-b border-white/5 transition hover:bg-white/[0.02]"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-zinc-100">{cert.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{cert.slug}</p>
                </td>
                <td className="px-4 py-4 text-zinc-400">{cert.issuer}</td>
                <td className="px-4 py-4">
                  <TechBadge
                    label={certificationCategoryLabels[cert.category]}
                    variant="purple"
                  />
                </td>
                <td className="px-4 py-4">
                  <CertificationStatusBadge status={cert.status} />
                </td>
                <td className="px-4 py-4 text-zinc-300">{cert.priority}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {cert.isFeatured && <TechBadge label="Destacado" variant="cyan" />}
                    {!cert.isActive && <TechBadge label="Inactivo" variant="default" />}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/certifications/${cert._id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-amber-500/40"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(cert)}
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
