import type { SiteSettings } from "@/src/types/siteSettings";
import { httpUrl } from "./publicLinks";

export const defaultProfile = {
  fullName: "Armando Mora",
  professionalTitle: "Desarrollo de software y ciberseguridad",
  tagline: "Construyo aplicaciones web con atención a su funcionamiento, mantenimiento y seguridad.",
  shortBio: "Desarrollo de software con enfoque en seguridad. En este sitio documento proyectos, decisiones técnicas y aprendizajes.",
  email: "armandomora14115@gmail.com",
};

export function resolvePublicProfile(settings: SiteSettings = {}) {
  const profile = settings.profile;
  return {
    ...profile,
    fullName: profile?.fullName?.trim() || defaultProfile.fullName,
    professionalTitle: profile?.professionalTitle?.trim() || defaultProfile.professionalTitle,
    tagline: profile?.tagline?.trim() || defaultProfile.tagline,
    shortBio: profile?.shortBio?.trim() || defaultProfile.shortBio,
    email: profile?.email?.trim() || defaultProfile.email,
  };
}

export function publicSocialLinks(settings: SiteSettings = {}) {
  const profile = resolvePublicProfile(settings);
  const configured = settings.social !== undefined ? settings.social : [
    { label: "LinkedIn", platform: "linkedin", url: profile.linkedin },
    { label: "GitHub", platform: "github", url: profile.github },
  ];
  const links = configured.filter(item => item.isActive !== false).flatMap(item => {
    const href = httpUrl(item.url);
    return href ? [{ label: item.label || item.platform || "Sitio web", href, icon: item.platform === "github" || item.platform === "linkedin" ? item.platform : "website", external: true }] : [];
  });
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) links.push({ label: "Email", href: `mailto:${profile.email}`, icon: "email", external: false });
  return links.filter((item, index) => links.findIndex(other => other.href === item.href) === index);
}
