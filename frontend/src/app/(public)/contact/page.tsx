import { siteOrigin } from "@/src/lib/publicConfig";
import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";

import PageHero from "@/src/components/portfolio/PageHero";
import ContactForm from "@/src/components/portfolio/ContactForm";
import GlassCard from "@/src/components/ui/GlassCard";
import JsonLd from "@/src/components/seo/JsonLd";
import { personJsonLd } from "@/src/lib/jsonLd";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return buildMetadata({
    title: "Contacto | Armando Mora",
    description: "Contacto profesional para colaboraciones, consultoría y oportunidades.",
    path: "/contact",
    seo: settings.seo,
    branding: settings.branding,
  });
}

export default async function ContactPage() {
  const settings = await getPublicSiteSettings();
  const profileInfo = settings.profile || {};
  const resolvedEmail = profileInfo.email || "armandomora14115@gmail.com";
  const resolvedLocation = profileInfo.location || "";
  const resolvedSocial =
    settings.social && settings.social.length > 0
      ? settings.social
          .filter((s) => s.isActive !== false && s.url)
          .map((s) => ({
            label: s.label || s.platform || "Social",
            href: s.url || "#",
            external: (s.url || "").startsWith("http"),
          }))
      : [];
  const base = siteOrigin;

  return (
    <>
      <JsonLd data={personJsonLd(settings, base)} />
      <PageHero
        eyebrow="Contact"
        title="Contacto"
        description="¿Tienes un proyecto, vacante o consulta de seguridad? Escríbeme con los detalles."
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
                    href={`mailto:${resolvedEmail}`}
                    className="transition hover:text-cyan-300"
                  >
                    {resolvedEmail}
                  </a>
                </li>
                <li className="flex gap-3 text-sm text-zinc-400">
                  <MapPin className="h-5 w-5 shrink-0 text-purple-400" aria-hidden="true" />
                  {resolvedLocation}
                </li>
              </ul>
              {resolvedSocial.length > 0 && <div className="mt-8 border-t border-white/5 pt-6">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Redes</p>
                <ul className="mt-3 space-y-2">
                  {resolvedSocial.map((s) => (
                    <li key={`${s.label}-${s.href}`}>
                      <a
                        href={s.href}
                        target={s.external ? "_blank" : undefined}
                        rel={s.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-zinc-400 hover:text-cyan-300"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>}
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
