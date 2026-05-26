import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EducationDetail from "@/src/components/detail/EducationDetail";
import JsonLd from "@/src/components/seo/JsonLd";
import { educationService } from "@/src/services/educationService";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";
import { educationJsonLd } from "@/src/lib/jsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [entry, settings] = await Promise.all([
      educationService.getEducationBySlug(slug),
      getPublicSiteSettings(),
    ]);
    return buildMetadata({
      title: `${entry.title} | Educación`,
      description: entry.description || entry.fieldOfStudy,
      path: `/education/${slug}`,
      seo: settings.seo,
      branding: settings.branding,
      imageUrl: entry.logo?.url,
    });
  } catch {
    return buildMetadata({ title: "Educación", path: `/education/${slug}` });
  }
}

export default async function EducationDetailPage({ params }: Props) {
  const { slug } = await params;
  try {
    const entry = await educationService.getEducationBySlug(slug);
    return (
      <>
        <JsonLd data={educationJsonLd(entry)} />
        <EducationDetail entry={entry} />
      </>
    );
  } catch {
    notFound();
  }
}
