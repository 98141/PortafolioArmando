"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { SiteSettings } from "@/src/types/siteSettings";
import {
  type SiteSettingsFormValues,
} from "@/src/lib/validations/siteSettings";
import ProfileSettingsForm from "@/src/components/admin/settings/ProfileSettingsForm";
import BrandingSettingsForm from "@/src/components/admin/settings/BrandingSettingsForm";
import SeoSettingsForm from "@/src/components/admin/settings/SeoSettingsForm";
import SocialLinksEditor from "@/src/components/admin/settings/SocialLinksEditor";
import CvSettingsForm from "@/src/components/admin/settings/CvSettingsForm";

interface Props {
  initialSettings: SiteSettings;
  loading?: boolean;
  error?: string | null;
  onSubmit: (payload: SiteSettings) => Promise<void>;
}

const mapToFormValues = (settings: SiteSettings): SiteSettingsFormValues => ({
  profile: {
    fullName: settings.profile?.fullName,
    professionalTitle: settings.profile?.professionalTitle,
    tagline: settings.profile?.tagline,
    shortBio: settings.profile?.shortBio,
    longBio: settings.profile?.longBio,
    location: settings.profile?.location,
    email: settings.profile?.email,
    phone: settings.profile?.phone,
    whatsapp: settings.profile?.whatsapp,
    linkedin: settings.profile?.linkedin,
    github: settings.profile?.github,
    website: settings.profile?.website,
  },
  branding: {
    logo: settings.branding?.logo || {},
    avatar: settings.branding?.avatar || {},
    primaryColor: settings.branding?.primaryColor,
    accentColor: settings.branding?.accentColor,
  },
  cv: {
    url: settings.cv?.url,
    publicId: settings.cv?.publicId,
    fileName: settings.cv?.fileName,
    updatedAt: settings.cv?.updatedAt,
  },
  seo: {
    siteName: settings.seo?.siteName,
    defaultTitle: settings.seo?.defaultTitle,
    defaultDescription: settings.seo?.defaultDescription,
    keywordsText: settings.seo?.keywords?.join(", "),
    ogImage: settings.seo?.ogImage || {},
    twitterHandle: settings.seo?.twitterHandle,
    canonicalBaseUrl: settings.seo?.canonicalBaseUrl,
  },
  social: (settings.social || []).map((item) => ({
    platform: item.platform,
    label: item.label,
    url: item.url,
    isActive: item.isActive ?? true,
    priority: item.priority ?? 100,
  })),
  availability: {
    status: settings.availability?.status || "available",
    message: settings.availability?.message,
  },
});

const mapToPayload = (values: SiteSettingsFormValues): SiteSettings => ({
  profile: values.profile,
  branding: values.branding,
  cv: values.cv,
  seo: {
    ...values.seo,
    keywords: (values.seo.keywordsText || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
  },
  social: values.social,
  availability: values.availability,
  isActive: true,
});

export default function SiteSettingsForm({ initialSettings, loading, error, onSubmit }: Props) {
  const defaults = useMemo(() => mapToFormValues(initialSettings), [initialSettings]);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SiteSettingsFormValues>({
    defaultValues: defaults,
  });

  return (
    <form onSubmit={handleSubmit(async (v) => onSubmit(mapToPayload(v)))} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          Revisa los campos con formato inválido (URL, email o valores requeridos).
        </div>
      )}

      <ProfileSettingsForm register={register} />
      <BrandingSettingsForm register={register} />
      <CvSettingsForm
        register={register}
        setValue={setValue}
        cvUrl={watch("cv.url")}
        cvPublicId={watch("cv.publicId")}
      />
      <SeoSettingsForm register={register} />
      <SocialLinksEditor control={control} register={register} />

      <section className="glass-panel rounded-2xl p-6">
        <h3 className="mb-4 text-base font-semibold text-zinc-100">Disponibilidad</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm"
            {...register("availability.status")}
          >
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm"
            placeholder="Mensaje opcional"
            {...register("availability.message")}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl gradient-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar Site Settings"}
        </button>
      </div>
    </form>
  );
}
