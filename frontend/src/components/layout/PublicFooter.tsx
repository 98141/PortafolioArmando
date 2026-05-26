import Link from "next/link";
import { Mail } from "lucide-react";
import { navLinks, profile, socialLinks } from "@/src/data/portfolioData";
import { GithubIcon, LinkedinIcon } from "@/src/components/ui/SocialIcons";

const iconMap = {
  linkedin: LinkedinIcon,
  github: GithubIcon,
  email: Mail,
};

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#050508]/90">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold text-zinc-100">{profile.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              {profile.title}
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Desarrollo de software y ciberseguridad aplicada con enfoque en
              sistemas seguros y documentación profesional.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
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
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Conectar
            </p>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((social) => {
                const Icon = iconMap[social.icon];
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target={social.icon !== "email" ? "_blank" : undefined}
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
          <p className="text-xs text-zinc-600">
            © {year} {profile.name}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-zinc-600">
            Built with Next.js · Secure by design
          </p>
        </div>
      </div>
    </footer>
  );
}
