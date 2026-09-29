import Link from "next/link";
import Form from "next/form";
import FilterSubmit from "./FilterSubmit";
import { getPublicList, type Resource, type SearchParams } from "@/src/lib/publicContent";
import { projectCategoryLabels } from "@/src/lib/projectLabels";
import { cyberLabCategoryLabels } from "@/src/lib/cyberLabLabels";
import { certificationCategoryLabels } from "@/src/lib/certificationLabels";
import { academicLevelLabels } from "@/src/lib/educationLabels";
import { blogCategoryLabels } from "@/src/lib/blogPostLabels";
import PublicContentCards from "./PublicContentCards";

const labels: Record<Resource, Record<string, string>> = { projects: projectCategoryLabels, cybersecurity: cyberLabCategoryLabels, certifications: certificationCategoryLabels, education: academicLevelLabels, blog: blogCategoryLabels };
const scalar = (value: SearchParams[string]) => typeof value === "string" ? value.trim() : "";

export default async function PublicListing({ resource, searchParams }: { resource: Resource; searchParams: SearchParams }) {
  const filterKey = resource === "education" ? "academicLevel" : "category";
  const rawCategory = scalar(searchParams[filterKey]);
  const category = Object.hasOwn(labels[resource], rawCategory) ? rawCategory : "";
  const search = scalar(searchParams.search).slice(0, 200);
  const tag = resource === "blog" ? scalar(searchParams.tag).slice(0, 100) : "";
  const rawPage = scalar(searchParams.page);
  const page = /^[1-9]\d{0,5}$/.test(rawPage) ? Number(rawPage) : 1;
  const filters = { ...(category ? { [filterKey]: category } : {}), ...(search ? { search } : {}), ...(tag ? { tag } : {}) };
  const { items, pagination } = await getPublicList(resource, { ...filters, page });
  const href = (nextPage: number) => `/${resource}?${new URLSearchParams({ ...filters, page: String(nextPage) })}`;
  const inputClass = "w-full rounded-xl border border-white/15 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100";
  return <>
    <Form action={`/${resource}`} className="flex flex-wrap items-end gap-4" key={`${category}-${search}-${tag}`}>
      <label className="min-w-0 flex-1 basis-56 text-sm text-zinc-300">Buscar
        <input name="search" type="search" defaultValue={search} maxLength={200} className={`mt-2 ${inputClass}`} />
      </label>
      <label className="min-w-0 flex-1 basis-56 text-sm text-zinc-300">{resource === "education" ? "Nivel académico" : "Categoría"}
        <select name={filterKey} defaultValue={category} className={`mt-2 ${inputClass}`}>
          <option value="">Todas</option>
          {Object.entries(labels[resource]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {resource === "blog" && <label className="min-w-0 flex-1 basis-40 text-sm text-zinc-300">Etiqueta
        <input name="tag" defaultValue={tag} maxLength={100} className={`mt-2 ${inputClass}`} />
      </label>}
      <FilterSubmit />
      <Link href={`/${resource}`} className="px-2 py-2.5 text-sm text-cyan-300">Limpiar</Link>
    </Form>
    {items.length ? <PublicContentCards resource={resource} items={items} /> :
      <p className="my-10 rounded-2xl border border-white/10 p-8 text-center text-zinc-400" role="status">
        {Object.keys(filters).length || page > 1 ? "No hay resultados para esta búsqueda o página." : "Todavía no hay contenido publicado en esta sección."}
      </p>}
    {(pagination.totalPages > 1 || page > 1) && <nav aria-label="Paginación" className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm">
      {page > 1 && <Link href={href(Math.min(page - 1, Math.max(1, pagination.totalPages)))} className="text-cyan-300">Anterior</Link>}
      <span>Página {page} de {Math.max(1, pagination.totalPages)}</span>
      {page < pagination.totalPages && <Link href={href(page + 1)} className="text-cyan-300">Siguiente</Link>}
    </nav>}
  </>;
}
