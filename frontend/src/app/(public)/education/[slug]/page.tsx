import DetailBreadcrumbJsonLd from "@/src/components/seo/DetailBreadcrumbJsonLd";
import type { Metadata } from "next";
import EducationDetail from "@/src/components/detail/EducationDetail";
import JsonLd from "@/src/components/seo/JsonLd";
import { getPublicDetail } from "@/src/lib/publicContent";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";
import { educationJsonLd } from "@/src/lib/jsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
    const [entry, settings] = await Promise.all([
      getPublicDetail("education", slug),
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
}

export default async function EducationDetailPage({ params }: Props) {
  const { slug } = await params;
    const entry = await getPublicDetail("education", slug);
    return (
      <>
        <DetailBreadcrumbJsonLd section="education" slug={slug} title={entry.title} />
        <JsonLd data={educationJsonLd(entry)} />
        <EducationDetail entry={entry} />
      </>
    );
}
