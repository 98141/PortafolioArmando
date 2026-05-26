"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { profile } from "@/src/data/portfolioData";

export default function CallToAction() {
  return (
    <section className="px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-cyan-600/10 p-8 sm:p-12"
        >
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
              ¿Listo para construir algo seguro?
            </h2>
            <p className="mt-4 text-zinc-300">
              {profile.valueProposition}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl gradient-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25"
              >
                Iniciar conversación
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/projects"
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm text-zinc-200 transition hover:bg-white/10"
              >
                Explorar proyectos
              </Link>
            </div>
          </div>
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  );
}
