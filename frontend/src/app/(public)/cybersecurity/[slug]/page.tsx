import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CyberLabDetail from "@/src/components/detail/CyberLabDetail";
import JsonLd from "@/src/components/seo/JsonLd";
import { cyberLabService } from "@/src/services/cyberLabService";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";
import { creativeWorkJsonLd } from "@/src/lib/jsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [lab, settings] = await Promise.all([
      cyberLabService.getCyberLabBySlug(slug),
      getPublicSiteSettings(),
    ]);
    return buildMetadata({
      title: `${lab.title} | Cyber Lab`,
      description: lab.shortDescription,
      path: `/cybersecurity/${slug}`,
      seo: settings.seo,
      branding: settings.branding,
    });
  } catch {
    return buildMetadata({ title: "Cyber Lab", path: `/cybersecurity/${slug}` });
  }
}

export default async function CyberLabDetailPage({ params }: Props) {
  const { slug } = await params;
  try {
    const [lab, settings] = await Promise.all([
      cyberLabService.getCyberLabBySlug(slug),
      getPublicSiteSettings(),
    ]);
    const base = settings.seo?.canonicalBaseUrl || "https://armandomora.dev";
    return (
      <>
        <JsonLd data={creativeWorkJsonLd(lab, base, "cybersecurity")} />
        <CyberLabDetail lab={lab} />
      </>
    );
  } catch {
    notFound();
  }
}
