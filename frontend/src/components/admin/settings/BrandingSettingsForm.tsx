"use client";

import type { UseFormRegister } from "react-hook-form";
import type { SiteSettingsFormValues } from "@/src/lib/validations/siteSettings";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wider text-zinc-500";

interface Props {
  register: UseFormRegister<SiteSettingsFormValues>;
}

export default function BrandingSettingsForm({ register }: Props) {
  return (
    <section className="glass-panel rounded-2xl p-6">
      <h3 className="mb-1 text-base font-semibold text-zinc-100">Branding</h3>
      <p className="mb-4 text-xs text-zinc-500">
        Por ahora logo/avatar/OG se manejan por URL manual (pendiente endpoint dedicado).
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Logo URL</label>
          <input className={inputClass} {...register("branding.logo.url")} />
        </div>
        <div>
          <label className={labelClass}>Logo alt</label>
          <input className={inputClass} {...register("branding.logo.alt")} />
        </div>
        <div>
          <label className={labelClass}>Avatar URL</label>
          <input className={inputClass} {...register("branding.avatar.url")} />
        </div>
        <div>
          <label className={labelClass}>Avatar alt</label>
          <input className={inputClass} {...register("branding.avatar.alt")} />
        </div>
        <div>
          <label className={labelClass}>Color primario</label>
          <input className={inputClass} placeholder="#0ea5e9" {...register("branding.primaryColor")} />
        </div>
        <div>
          <label className={labelClass}>Color acento</label>
          <input className={inputClass} placeholder="#a855f7" {...register("branding.accentColor")} />
        </div>
      </div>
    </section>
  );
}
