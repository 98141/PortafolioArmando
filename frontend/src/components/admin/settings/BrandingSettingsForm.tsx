"use client";

import type { UseFormRegister } from "react-hook-form";
import type { SiteSettingsFormValues } from "@/src/lib/validations/siteSettings";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wider text-zinc-400";

interface Props {
  register: UseFormRegister<SiteSettingsFormValues>;
}

export default function BrandingSettingsForm({ register }: Props) {
  return (
    <section className="glass-panel rounded-2xl p-6">
      <h2 className="mb-1 text-base font-semibold text-zinc-100">Branding</h2>
      <p className="mb-4 text-xs text-zinc-400">
        Por ahora logo/avatar/OG se manejan por URL manual (pendiente endpoint dedicado).
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="branding-logo-url" className={labelClass}>Logo URL</label>
          <input id="branding-logo-url" className={inputClass} {...register("branding.logo.url")} />
        </div>
        <div>
          <label htmlFor="branding-logo-alt" className={labelClass}>Logo alt</label>
          <input id="branding-logo-alt" className={inputClass} {...register("branding.logo.alt")} />
        </div>
        <div>
          <label htmlFor="branding-avatar-url" className={labelClass}>Avatar URL</label>
          <input id="branding-avatar-url" className={inputClass} {...register("branding.avatar.url")} />
        </div>
        <div>
          <label htmlFor="branding-avatar-alt" className={labelClass}>Avatar alt</label>
          <input id="branding-avatar-alt" className={inputClass} {...register("branding.avatar.alt")} />
        </div>
        <div>
          <label htmlFor="branding-primaryColor" className={labelClass}>Color primario</label>
          <input id="branding-primaryColor" className={inputClass} placeholder="#0ea5e9" {...register("branding.primaryColor")} />
        </div>
        <div>
          <label htmlFor="branding-accentColor" className={labelClass}>Color acento</label>
          <input id="branding-accentColor" className={inputClass} placeholder="#a855f7" {...register("branding.accentColor")} />
        </div>
      </div>
    </section>
  );
}
