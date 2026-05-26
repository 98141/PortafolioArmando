import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">404</p>
      <h1 className="mt-3 text-3xl font-bold text-zinc-100">Página no encontrada</h1>
      <p className="mt-3 text-zinc-400">
        La ruta que buscas no existe o el contenido ya no está disponible.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="rounded-xl gradient-accent px-5 py-2.5 text-sm font-medium text-white">
          Ir al inicio
        </Link>
        <Link href="/projects" className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-zinc-200">
          Ver proyectos
        </Link>
      </div>
    </main>
  );
}
