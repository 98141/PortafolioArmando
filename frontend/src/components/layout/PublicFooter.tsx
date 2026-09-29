import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import { navLinks } from "@/src/data/portfolioData";
import { GithubIcon, LinkedinIcon } from "@/src/components/ui/SocialIcons";
import type { SiteSettings } from "@/src/types/siteSettings";

import { resolvePublicProfile, publicSocialLinks } from "@/src/lib/publicProfile";

const iconMap = {
  website: ExternalLink,
  linkedin: LinkedinIcon,
  github: GithubIcon,
  email: Mail,
};
type FooterIconKey = keyof typeof iconMap;

export default function PublicFooter({ settings }: { settings?: SiteSettings }) {
  const year = new Date().getFullYear();
  const profile = resolvePublicProfile(settings);
  const socials = publicSocialLinks(settings);
  return (
    <footer className="border-t border-white/5 bg-[#080c18]/90">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold text-zinc-100">{profile.fullName}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {profile.professionalTitle}
            </p>
            <p className="mt-3 text-sm text-zinc-400">
              Desarrollo de software y ciberseguridad aplicada con enfoque en
              sistemas seguros y documentación profesional.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Enlaces rápidos
            </p>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition hover:text-cyan-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Conectar
            </p>
            <ul className="mt-4 space-y-3">
              {socials.map((social) => {
                const Icon = iconMap[social.icon as FooterIconKey];
                return (
                  <li key={`${social.label}-${social.href}`}>
                    <a
                      href={social.href}
                      target={social.external ? "_blank" : undefined}
                      rel={social.icon !== "email" ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-cyan-300"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {social.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-400">
            © {year} {profile.fullName}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-zinc-400">
            Desarrollo de software y seguridad
          </p>
        </div>
      </div>
    </footer>
  );
}
