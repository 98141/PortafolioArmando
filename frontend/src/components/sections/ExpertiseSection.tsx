"use client";

import { motion } from "framer-motion";
import { Code2, Lock, Shield } from "lucide-react";
import { expertiseAreas } from "@/src/data/portfolioData";
import GlassCard from "@/src/components/ui/GlassCard";
import SectionHeader from "@/src/components/ui/SectionHeader";
import TechBadge from "@/src/components/ui/TechBadge";

const icons = {
  code: Code2,
  shield: Shield,
  lock: Lock,
};

export default function ExpertiseSection() {
  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Expertise"
          title="Áreas de especialización"
          description="Tres pilares que definen mi enfoque profesional."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {expertiseAreas.map((area, i) => {
            const Icon = icons[area.icon];
            return (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="h-full p-6" hover>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/10">
                    <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-100">{area.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {area.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {area.highlights.map((h) => (
                      <TechBadge key={h} label={h} variant="blue" />
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
