import Link from "next/link";
import { getPublicList, type Resource } from "@/src/lib/publicContent";
import SectionHeader from "@/src/components/ui/SectionHeader";
import PublicContentCards from "@/src/components/portfolio/PublicContentCards";

export default async function PublicPreview({ resource, title, eyebrow, description }: { resource: Resource; title: string; eyebrow: string; description: string }) {
  const result = await getPublicList(resource, { limit: 3, ...(resource === "blog" ? {} : { isFeatured: "true" }) })
    .then(data => ({ data, failed: false })).catch(() => ({ data: null, failed: true }));
  return <section className="px-4 py-16 lg:px-8"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <Link href={`/${resource}`} className="text-sm text-cyan-300">Ver todos →</Link>
    </div>
    {result.failed ? <p className="mt-8 text-sm text-amber-200" role="status">No se pudo cargar esta sección. Vuelve a intentarlo más tarde.</p> :
      result.data?.items.length ? <PublicContentCards resource={resource} items={result.data.items} /> :
      <p className="mt-8 text-sm text-zinc-400">{resource === "blog" ? "Todavía no hay artículos publicados." : "Todavía no hay contenido destacado."}</p>}
  </div></section>;
}
