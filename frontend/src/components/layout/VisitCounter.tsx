"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { loadVisitCount } from "@/src/lib/visitCounter";

export default function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    loadVisitCount().then(value => { if (active) setCount(value); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  return <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-zinc-400"
    title="Visitas aproximadas desde la activación del contador. Una por sesión de pestaña; recargar o navegar no suma otra.">
    <Eye className="h-4 w-4 text-cyan-300" aria-hidden="true" />
    <span>Visitas: <span className="font-semibold tabular-nums text-zinc-200">{failed ? "no disponible" : count === null ? "…" : count.toLocaleString("es-CO")}</span></span>
  </p>;
}
