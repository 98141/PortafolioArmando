"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { apiBaseUrl } from "@/src/lib/publicConfig";
import GlassCard from "@/src/components/ui/GlassCard";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const sending = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending.current) return;
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    sending.current = true;
    setStatus("sending");
    setFeedback("");
    try {
      const response = await fetch(apiBaseUrl + "/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "No se pudo enviar el mensaje. Inténtalo más tarde.");
      }
      setStatus("success");
      setFeedback("Tu mensaje fue aceptado para envío. Gracias por contactar.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error && error.name !== "TimeoutError" && error.name !== "TypeError"
        ? error.message : "No pudimos confirmar el envío. Conservamos tu mensaje; espera unos minutos antes de reintentar.");
    } finally {
      sending.current = false;
    }
  };

  return (
    <GlassCard className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={status === "sending"}>
        <fieldset disabled={status === "sending"} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-sm text-zinc-400">
              Nombre
            </label>
            <input
              id="contact-name"
              name="name"
              minLength={2}
              maxLength={100}
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
              maxLength={254}
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
            minLength={2}
            maxLength={150}
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
            minLength={10}
            maxLength={5000}
            required
            rows={5}
            className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            placeholder="Cuéntame sobre tu proyecto o consulta..."
          />
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="contact-website">Sitio web</label>
          <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <p className="text-xs text-zinc-400">Usaré tu nombre, correo y mensaje para responder a tu consulta. El envío se procesa mediante Resend.</p>
        <p role={status === "error" ? "alert" : "status"} aria-live="polite"
          className={status === "error" ? "text-sm text-rose-300" : "text-sm text-emerald-300"}>{feedback}</p>
        <button type="submit" disabled={status === "sending"}
          className="inline-flex items-center gap-2 rounded-xl gradient-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:opacity-50">
          <Send className="h-4 w-4" aria-hidden="true" />
          {status === "sending" ? "Enviando…" : "Enviar mensaje"}
        </button>
        </fieldset>
      </form>
    </GlassCard>
  );
}
