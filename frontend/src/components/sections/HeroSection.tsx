"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Download, Mail, Shield } from "lucide-react";
import { mainLines, metrics, profile } from "@/src/data/portfolioData";
import TechBadge from "@/src/components/ui/TechBadge";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 lg:px-8 lg:pt-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="mb-6 flex flex-wrap gap-2">
            {mainLines.slice(0, 3).map((line) => (
              <TechBadge key={line} label={line} variant="cyan" />
            ))}
          </div>

          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400/80">
            Portfolio Profesional
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient">{profile.name}</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-300 sm:text-xl">{profile.title}</p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400">
            {profile.tagline}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl gradient-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-90"
            >
              Ver proyectos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/cybersecurity"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              Ver laboratorios
            </Link>
            <a
              href={profile.cvUrl}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:border-white/20"
              aria-label="Descargar CV (próximamente)"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Descargar CV
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:border-purple-500/40 hover:text-purple-200"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Contactar
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="glass-panel rounded-2xl p-5"
            >
              <p className="text-2xl font-bold text-gradient">{metric.value}</p>
              <p className="mt-1 text-sm font-medium text-zinc-200">{metric.label}</p>
              <p className="mt-2 text-xs text-zinc-500">{metric.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
