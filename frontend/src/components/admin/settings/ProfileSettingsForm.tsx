"use client";

import type { UseFormRegister } from "react-hook-form";
import type { SiteSettingsFormValues } from "@/src/lib/validations/siteSettings";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wider text-zinc-500";

interface Props {
  register: UseFormRegister<SiteSettingsFormValues>;
}

export default function ProfileSettingsForm({ register }: Props) {
  return (
    <section className="glass-panel rounded-2xl p-6">
      <h3 className="mb-4 text-base font-semibold text-zinc-100">Perfil profesional</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre completo</label>
          <input className={inputClass} {...register("profile.fullName")} />
        </div>
        <div>
          <label className={labelClass}>Título profesional</label>
          <input className={inputClass} {...register("profile.professionalTitle")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Tagline</label>
          <input className={inputClass} {...register("profile.tagline")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Bio corta</label>
          <textarea rows={2} className={inputClass} {...register("profile.shortBio")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Bio larga</label>
          <textarea rows={4} className={inputClass} {...register("profile.longBio")} />
        </div>
        <div>
          <label className={labelClass}>Ubicación</label>
          <input className={inputClass} {...register("profile.location")} />
        </div>
        <div>
          <label className={labelClass}>Email público</label>
          <input className={inputClass} {...register("profile.email")} />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input className={inputClass} {...register("profile.phone")} />
        </div>
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input className={inputClass} {...register("profile.whatsapp")} />
        </div>
        <div>
          <label className={labelClass}>LinkedIn</label>
          <input className={inputClass} {...register("profile.linkedin")} />
        </div>
        <div>
          <label className={labelClass}>GitHub</label>
          <input className={inputClass} {...register("profile.github")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Website</label>
          <input className={inputClass} {...register("profile.website")} />
        </div>
      </div>
    </section>
  );
}
