"use client";
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import type { ProjectFormValues } from "@/src/types/project";

export default function ProjectGalleryFields({ control, register, errors }: {
  control: Control<ProjectFormValues>; register: UseFormRegister<ProjectFormValues>; errors: FieldErrors<ProjectFormValues>;
}) {
  const { fields, append, remove, move } = useFieldArray({ control, name: "gallery" });
  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm";
  return <section className="glass-panel space-y-4 rounded-2xl p-6">
    <h2 className="font-semibold">Capturas del proyecto</h2>
    <p className="text-sm text-zinc-400">Hasta 12 imágenes, en el orden de presentación. Usa URLs de Cloudinary para mostrarlas aquí. Otras URLs HTTP(S) se ofrecen como enlaces. Describe qué muestra cada captura y oculta datos privados antes de subirla.</p>
    {fields.map((field, index) => <fieldset key={field.id} className="space-y-3 rounded-xl border border-white/10 p-4">
      <legend className="px-2 text-sm text-zinc-300">Captura {index + 1}</legend>
      <label className="block text-sm text-zinc-400" htmlFor={`gallery-url-${field.id}`}>URL de imagen</label>
      <input id={`gallery-url-${field.id}`} {...register(`gallery.${index}.url`)} className={inputClass} aria-invalid={!!errors.gallery?.[index]?.url} />
      {errors.gallery?.[index]?.url && <p role="alert" className="text-sm text-rose-300">{errors.gallery[index]?.url?.message}</p>}
      <label className="block text-sm text-zinc-400" htmlFor={`gallery-alt-${field.id}`}>Descripción de la captura</label>
      <input id={`gallery-alt-${field.id}`} {...register(`gallery.${index}.alt`)} maxLength={200} className={inputClass} aria-invalid={!!errors.gallery?.[index]?.alt} />
      {errors.gallery?.[index]?.alt && <p role="alert" className="text-sm text-rose-300">{errors.gallery[index]?.alt?.message}</p>}
      <div className="flex flex-wrap gap-4 text-sm">
        <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} className="text-cyan-300 disabled:opacity-40" aria-label={`Subir captura ${index + 1}`}>Subir</button>
        <button type="button" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} className="text-cyan-300 disabled:opacity-40" aria-label={`Bajar captura ${index + 1}`}>Bajar</button>
        <button type="button" onClick={() => remove(index)} className="text-rose-300" aria-label={`Quitar captura ${index + 1}`}>Quitar</button>
      </div>
    </fieldset>)}
    <button type="button" disabled={fields.length >= 12} onClick={() => append({ url: "", alt: "" })} className="rounded-xl border border-white/20 px-4 py-2 text-sm disabled:opacity-40">Añadir captura</button>
  </section>;
}
