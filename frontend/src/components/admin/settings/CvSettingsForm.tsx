"use client";

import Link from "next/link";

export default function CvSettingsForm({ cvUrl }: { cvUrl?: string }) {
  return (
    <section className="glass-panel rounded-2xl p-6">
      <h2 className="mb-3 text-base font-semibold text-zinc-100">CV público</h2>
      <p className="mb-3 text-sm text-zinc-400">El CV se administra en su propia sección. Guardar estos ajustes no modifica el archivo publicado.</p>
      <Link href="/admin/cv" className="text-sm text-cyan-400 hover:text-cyan-300">Administrar CV</Link>
      {cvUrl && <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="ml-4 text-sm text-zinc-300">Abrir CV actual</a>}
    </section>
  );
}
