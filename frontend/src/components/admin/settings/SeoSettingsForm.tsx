"use client";

import type { UseFormRegister } from "react-hook-form";
import type { SiteSettingsFormValues } from "@/src/lib/validations/siteSettings";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wider text-zinc-500";

interface Props {
  register: UseFormRegister<SiteSettingsFormValues>;
}

export default function SeoSettingsForm({ register }: Props) {
  return (
    <section className="glass-panel rounded-2xl p-6">
      <h3 className="mb-4 text-base font-semibold text-zinc-100">SEO default</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Site name</label>
          <input className={inputClass} {...register("seo.siteName")} />
        </div>
        <div>
          <label className={labelClass}>Twitter handle</label>
          <input className={inputClass} placeholder="@armandomora" {...register("seo.twitterHandle")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Default title</label>
          <input className={inputClass} {...register("seo.defaultTitle")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Default description</label>
          <textarea rows={3} className={inputClass} {...register("seo.defaultDescription")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Keywords (coma separadas)</label>
          <input className={inputClass} {...register("seo.keywordsText")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Canonical base URL</label>
          <input className={inputClass} placeholder="https://armandomora.dev" {...register("seo.canonicalBaseUrl")} />
        </div>
        <div>
          <label className={labelClass}>OG image URL</label>
          <input className={inputClass} {...register("seo.ogImage.url")} />
        </div>
        <div>
          <label className={labelClass}>OG image alt</label>
          <input className={inputClass} {...register("seo.ogImage.alt")} />
        </div>
      </div>
    </section>
  );
}
