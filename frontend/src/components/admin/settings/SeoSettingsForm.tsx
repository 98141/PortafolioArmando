"use client";

import type { UseFormRegister } from "react-hook-form";
import type { SiteSettingsFormValues } from "@/src/lib/validations/siteSettings";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wider text-zinc-400";

interface Props {
  register: UseFormRegister<SiteSettingsFormValues>;
}

export default function SeoSettingsForm({ register }: Props) {
  return (
    <section className="glass-panel rounded-2xl p-6">
      <h2 className="mb-4 text-base font-semibold text-zinc-100">SEO default</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="seo-siteName" className={labelClass}>Site name</label>
          <input id="seo-siteName" className={inputClass} {...register("seo.siteName")} />
        </div>
        <div>
          <label htmlFor="seo-twitterHandle" className={labelClass}>Twitter handle</label>
          <input id="seo-twitterHandle" className={inputClass} placeholder="@armandomora" {...register("seo.twitterHandle")} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="seo-defaultTitle" className={labelClass}>Default title</label>
          <input id="seo-defaultTitle" className={inputClass} placeholder="Armando Mora | Desarrollo Full Stack y Ciberseguridad" {...register("seo.defaultTitle")} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="seo-defaultDescription" className={labelClass}>Default description</label>
          <textarea id="seo-defaultDescription" rows={3} className={inputClass} {...register("seo.defaultDescription")} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="seo-keywordsText" className={labelClass}>Keywords (coma separadas)</label>
          <input id="seo-keywordsText" className={inputClass} {...register("seo.keywordsText")} />
          <p className="mt-2 text-xs text-zinc-400">Google no usa esta etiqueta para posicionar. Prioriza títulos claros, descripciones y contenido útil sobre tus proyectos de desarrollo full stack y ciberseguridad.</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="seo-canonicalBaseUrl" className={labelClass}>Canonical base URL</label>
          <input id="seo-canonicalBaseUrl" className={inputClass} placeholder="https://armandomora.com.co" {...register("seo.canonicalBaseUrl")} />
          <p className="mt-2 text-xs text-zinc-400">
            El dominio público se configura al desplegar el sitio. Este valor de referencia no lo cambia.
          </p>
        </div>
        <div>
          <label htmlFor="seo-ogImage-url" className={labelClass}>OG image URL</label>
          <input id="seo-ogImage-url" className={inputClass} {...register("seo.ogImage.url")} />
        </div>
        <div>
          <label htmlFor="seo-ogImage-alt" className={labelClass}>OG image alt</label>
          <input id="seo-ogImage-alt" className={inputClass} {...register("seo.ogImage.alt")} />
        </div>
      </div>
    </section>
  );
}
