import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CertificationDetail from "@/src/components/detail/CertificationDetail";
import JsonLd from "@/src/components/seo/JsonLd";
import { certificationService } from "@/src/services/certificationService";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";
import { certificationJsonLd } from "@/src/lib/jsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [cert, settings] = await Promise.all([
      certificationService.getCertificationBySlug(slug),
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
  } catch {
    return buildMetadata({ title: "Certificación", path: `/certifications/${slug}` });
  }
}

export default async function CertificationDetailPage({ params }: Props) {
  const { slug } = await params;
  try {
    const cert = await certificationService.getCertificationBySlug(slug);
    return (
      <>
        <JsonLd data={certificationJsonLd(cert)} />
        <CertificationDetail certification={cert} />
      </>
    );
  } catch {
    notFound();
  }
}
