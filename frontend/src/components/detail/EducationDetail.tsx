import type { Education } from "@/src/types/education";
import DetailHero from "@/src/components/detail/DetailHero";
import DetailMetaGrid from "@/src/components/detail/DetailMetaGrid";
import DetailSection from "@/src/components/detail/DetailSection";

export default function EducationDetail({ entry }: { entry: Education }) {
  return (
    <>
      <DetailHero
        title={entry.title}
        subtitle={entry.institution}
        description={entry.description || entry.fieldOfStudy}
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: "Educación", href: "/education" },
          { label: entry.title },
        ]}
      />
      <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 lg:px-8">
        <DetailMetaGrid
          items={[
            { label: "Institución", value: entry.institution },
            { label: "Nivel", value: entry.academicLevel },
            { label: "Inicio", value: entry.startedAt?.slice(0, 10) },
            { label: "Finalización", value: entry.completedAt?.slice(0, 10) || (entry.isCurrent ? "En curso" : "") },
          ]}
        />
        <DetailSection title="Descripción" content={entry.description || entry.fieldOfStudy} />
        <DetailSection title="Áreas de enfoque" items={entry.focusAreas} />
        <DetailSection title="Logros" items={entry.achievements} />
      </section>
    </>
  );
}
