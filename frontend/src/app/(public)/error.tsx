"use client";
export default function PublicError({ reset }: { reset: () => void }) {
  return <section className="mx-auto min-h-[50vh] max-w-3xl px-4 py-20 text-center">
    <h1 className="text-2xl font-semibold">No se pudo cargar el contenido</h1>
    <p className="mt-4 text-zinc-400">El servicio no está disponible por el momento. Vuelve a intentarlo en unos minutos.</p>
    <button onClick={reset} className="mt-6 rounded-xl gradient-accent px-5 py-3">Reintentar</button>
  </section>;
}
