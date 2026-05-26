import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { profile, socialLinks } from "@/src/data/portfolioData";
import PageHero from "@/src/components/portfolio/PageHero";
import ContactForm from "@/src/components/portfolio/ContactForm";
import GlassCard from "@/src/components/ui/GlassCard";

export const metadata: Metadata = {
  title: "Contacto | Armando Mora",
  description: "Contacto profesional para colaboraciones, consultoría y oportunidades.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contacto"
        description="¿Tienes un proyecto, vacante o consulta de seguridad? Escríbeme — respondo en 24–48h hábiles."
      />
      <section className="px-4 pb-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <GlassCard className="h-full p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-zinc-100">Información directa</h2>
              <ul className="mt-6 space-y-5">
                <li className="flex gap-3 text-sm text-zinc-400">
                  <Mail className="h-5 w-5 shrink-0 text-cyan-400" aria-hidden="true" />
                  <a
                    href={`mailto:${profile.email}`}
                    className="transition hover:text-cyan-300"
                  >
                    {profile.email}
                  </a>
                </li>
                <li className="flex gap-3 text-sm text-zinc-400">
                  <MapPin className="h-5 w-5 shrink-0 text-purple-400" aria-hidden="true" />
                  {profile.location}
                </li>
              </ul>
              <div className="mt-8 border-t border-white/5 pt-6">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Redes</p>
                <ul className="mt-3 space-y-2">
                  {socialLinks.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target={s.icon !== "email" ? "_blank" : undefined}
                        rel={s.icon !== "email" ? "noopener noreferrer" : undefined}
                        className="text-sm text-zinc-400 hover:text-cyan-300"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          </div>
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
