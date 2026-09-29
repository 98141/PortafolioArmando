"use client";

import type { UseFormRegister } from "react-hook-form";
import type { SiteSettingsFormValues } from "@/src/lib/validations/siteSettings";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wider text-zinc-400";

interface Props {
  register: UseFormRegister<SiteSettingsFormValues>;
}

export default function ProfileSettingsForm({ register }: Props) {
  return (
    <section className="glass-panel rounded-2xl p-6">
      <h2 className="mb-4 text-base font-semibold text-zinc-100">Perfil profesional</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-fullName" className={labelClass}>Nombre completo</label>
          <input id="profile-fullName" className={inputClass} {...register("profile.fullName")} />
        </div>
        <div>
          <label htmlFor="profile-professionalTitle" className={labelClass}>Título profesional</label>
          <input id="profile-professionalTitle" className={inputClass} {...register("profile.professionalTitle")} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="profile-tagline" className={labelClass}>Tagline</label>
          <input id="profile-tagline" className={inputClass} {...register("profile.tagline")} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="profile-shortBio" className={labelClass}>Bio corta</label>
          <textarea id="profile-shortBio" rows={2} className={inputClass} {...register("profile.shortBio")} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="profile-longBio" className={labelClass}>Bio larga</label>
          <textarea id="profile-longBio" rows={4} className={inputClass} {...register("profile.longBio")} />
        </div>
        <div>
          <label htmlFor="profile-location" className={labelClass}>Ubicación</label>
          <input id="profile-location" className={inputClass} {...register("profile.location")} />
        </div>
        <div>
          <label htmlFor="profile-email" className={labelClass}>Email público</label>
          <input id="profile-email" className={inputClass} {...register("profile.email")} />
        </div>
        <div>
          <label htmlFor="profile-phone" className={labelClass}>Teléfono</label>
          <input id="profile-phone" className={inputClass} {...register("profile.phone")} />
        </div>
        <div>
          <label htmlFor="profile-whatsapp" className={labelClass}>WhatsApp</label>
          <input id="profile-whatsapp" className={inputClass} {...register("profile.whatsapp")} />
        </div>
        <div>
          <label htmlFor="profile-linkedin" className={labelClass}>LinkedIn</label>
          <input id="profile-linkedin" className={inputClass} {...register("profile.linkedin")} />
        </div>
        <div>
          <label htmlFor="profile-github" className={labelClass}>GitHub</label>
          <input id="profile-github" className={inputClass} {...register("profile.github")} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="profile-website" className={labelClass}>Website</label>
          <input id="profile-website" className={inputClass} {...register("profile.website")} />
        </div>
      </div>
    </section>
  );
}
