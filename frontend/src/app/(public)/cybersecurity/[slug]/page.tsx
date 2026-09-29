import DetailBreadcrumbJsonLd from "@/src/components/seo/DetailBreadcrumbJsonLd";
import { siteOrigin } from "@/src/lib/publicConfig";
import type { Metadata } from "next";
import CyberLabDetail from "@/src/components/detail/CyberLabDetail";
import JsonLd from "@/src/components/seo/JsonLd";
import { getPublicDetail } from "@/src/lib/publicContent";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";
import { creativeWorkJsonLd } from "@/src/lib/jsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
    const [lab, settings] = await Promise.all([
      getPublicDetail("cybersecurity", slug),
      getPublicSiteSettings(),
    ]);
    return buildMetadata({
      title: `${lab.title} | Cyber Lab`,
      description: lab.shortDescription,
      path: `/cybersecurity/${slug}`,
      seo: settings.seo,
      branding: settings.branding,
    });
}

export default async function CyberLabDetailPage({ params }: Props) {
  const { slug } = await params;
    const lab = await getPublicDetail("cybersecurity", slug);
    const base = siteOrigin;
    return (
      <>
        <DetailBreadcrumbJsonLd section="cybersecurity" slug={slug} title={lab.title} />
        <JsonLd data={creativeWorkJsonLd(lab, base, "cybersecurity")} />
        <CyberLabDetail lab={lab} />
      </>
    );
}
