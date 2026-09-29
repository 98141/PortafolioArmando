import JsonLd from "./JsonLd";
import { breadcrumbJsonLd } from "@/src/lib/jsonLd";
import { siteOrigin } from "@/src/lib/publicConfig";
const sections = { projects: "Proyectos", cybersecurity: "Ciberseguridad", certifications: "Certificaciones", education: "Educación", blog: "Blog" };

export default function DetailBreadcrumbJsonLd({ section, slug, title }: { section: keyof typeof sections; slug: string; title: string }) {
  return <JsonLd data={breadcrumbJsonLd([
    { name: "Inicio", url: `${siteOrigin}/` },
    { name: sections[section], url: `${siteOrigin}/${section}` },
    { name: title, url: `${siteOrigin}/${section}/${encodeURIComponent(slug)}` },
  ])} />;
}
