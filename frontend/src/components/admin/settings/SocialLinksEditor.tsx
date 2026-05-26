"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import type { SiteSettingsFormValues } from "@/src/lib/validations/siteSettings";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";

interface Props {
  control: Control<SiteSettingsFormValues>;
  register: UseFormRegister<SiteSettingsFormValues>;
}

export default function SocialLinksEditor({ control, register }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "social",
  });

  return (
    <section className="glass-panel rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-100">Redes sociales</h3>
        <button
          type="button"
          onClick={() => append({ platform: "", label: "", url: "", isActive: true, priority: 100 })}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </button>
      </div>
      <div className="space-y-3">
        {fields.length === 0 && <p className="text-xs text-zinc-500">No hay enlaces configurados.</p>}
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-12">
            <input
              className={`sm:col-span-2 ${inputClass}`}
              placeholder="platform"
              {...register(`social.${index}.platform`)}
            />
            <input
              className={`sm:col-span-3 ${inputClass}`}
              placeholder="label"
              {...register(`social.${index}.label`)}
            />
            <input
              className={`sm:col-span-4 ${inputClass}`}
              placeholder="https://..."
              {...register(`social.${index}.url`)}
            />
            <input
              type="number"
              className={`sm:col-span-2 ${inputClass}`}
              placeholder="priority"
              {...register(`social.${index}.priority`, { valueAsNumber: true })}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="inline-flex items-center justify-center rounded-lg border border-red-500/30 text-red-300 sm:col-span-1"
              aria-label="Eliminar enlace"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
