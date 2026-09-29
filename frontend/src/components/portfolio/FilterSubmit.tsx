"use client";
import { useFormStatus } from "react-dom";

export default function FilterSubmit() {
  const { pending } = useFormStatus();
  return <button className="rounded-xl gradient-accent px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
    type="submit" disabled={pending} aria-live="polite">{pending ? "Buscando…" : "Filtrar"}</button>;
}
