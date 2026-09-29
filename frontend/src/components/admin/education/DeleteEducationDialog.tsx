"use client";
import type { Education } from "@/src/types/education";
import DeleteContentDialog from "@/src/components/admin/DeleteContentDialog";

export default function DeleteEducationDialog({ entry, loading = false, onConfirm, onCancel, error }: { entry: Education | null; loading?: boolean; error?: string | null; onConfirm: () => void; onCancel: () => void; }) {
  return <DeleteContentDialog open={!!entry} title={entry?.title || ""} resource="formación" loading={loading} error={error} onConfirm={onConfirm} onCancel={onCancel} />;
}
