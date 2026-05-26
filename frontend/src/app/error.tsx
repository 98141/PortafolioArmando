"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Error</p>
      <h1 className="mt-3 text-3xl font-bold text-zinc-100">Algo salió mal</h1>
      <p className="mt-3 text-zinc-400">{error.message || "Error inesperado del sistema."}</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl gradient-accent px-5 py-2.5 text-sm font-medium text-white"
        >
          Reintentar
        </button>
        <Link href="/" className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-zinc-200">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
