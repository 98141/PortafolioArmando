import type { Metadata } from "next";
import CertificationDetail from "@/src/components/detail/CertificationDetail";
import JsonLd from "@/src/components/seo/JsonLd";
import { getPublicDetail } from "@/src/lib/publicContent";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";
import { certificationJsonLd } from "@/src/lib/jsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
    const [cert, settings] = await Promise.all([
      getPublicDetail("certifications", slug),
      getPublicSiteSettings(),
    ]);
    return buildMetadata({
      title: `${cert.title} | Certificaciones`,
      description: cert.description || cert.issuer,
      path: `/certifications/${slug}`,
      seo: settings.seo,
      branding: settings.branding,
      imageUrl: cert.badge?.url,
    });
}

export default async function CertificationDetailPage({ params }: Props) {
  const { slug } = await params;
    const cert = await getPublicDetail("certifications", slug);
    return (
      <>
        <JsonLd data={certificationJsonLd(cert)} />
        <CertificationDetail certification={cert} />
      </>
    );
}
