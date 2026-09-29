import NewProjectPageClient from "@/src/components/admin/projects/NewProjectPageClient";
import { tejiendoRaicesDraft } from "@/src/data/projectDrafts";
export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const { draft } = await searchParams;
  return <NewProjectPageClient key={draft || "blank"} initialValues={draft === "tejiendo-raices" ? tejiendoRaicesDraft : undefined} />;
}
