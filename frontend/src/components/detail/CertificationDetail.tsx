import type { Certification } from "@/src/types/certification";
import DetailHero from "@/src/components/detail/DetailHero";
import DetailMetaGrid from "@/src/components/detail/DetailMetaGrid";
import DetailSection from "@/src/components/detail/DetailSection";

export default function CertificationDetail({ certification }: { certification: Certification }) {
  return (
    <>
      <DetailHero
        title={certification.title}
        subtitle={certification.issuer}
        description={certification.description}
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: "Certificaciones", href: "/certifications" },
          { label: certification.title },
        ]}
      />
      <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 lg:px-8">
        <DetailMetaGrid
          items={[
            { label: "Issuer", value: certification.issuer },
            { label: "Categoría", value: certification.category },
            { label: "Estado", value: certification.status },
            { label: "Emitido", value: certification.issuedAt?.slice(0, 10) },
          ]}
        />
        <DetailSection title="Descripción" content={certification.description} />
        <DetailSection title="Skills" items={certification.skills} />
        {certification.credentialUrl && (
          <a
            href={certification.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-xl border border-cyan-500/40 px-4 py-2 text-sm text-cyan-300"
          >
            Ver credencial oficial
          </a>
        )}
      </section>
    </>
  );
}
