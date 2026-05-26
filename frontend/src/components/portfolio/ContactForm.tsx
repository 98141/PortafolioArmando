"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import GlassCard from "@/src/components/ui/GlassCard";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <GlassCard className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-sm text-zinc-400">
              Nombre
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1.5 block text-sm text-zinc-400">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-subject" className="mb-1.5 block text-sm text-zinc-400">
            Asunto
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
            placeholder="Colaboración, consultoría, oportunidad..."
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm text-zinc-400">
            Mensaje
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            placeholder="Cuéntame sobre tu proyecto o consulta..."
          />
        </div>

        <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/90">
          Próximamente: integración segura con backend (validación, rate limit y entrega
          cifrada). Este formulario es solo visual en Sprint 2.
        </p>

        {submitted ? (
          <p className="text-sm text-emerald-400" role="status">
            Mensaje recibido en modo demo. La integración real llegará en un sprint
            posterior.
          </p>
        ) : (
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl gradient-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Enviar mensaje
          </button>
        )}
      </form>
    </GlassCard>
  );
}
