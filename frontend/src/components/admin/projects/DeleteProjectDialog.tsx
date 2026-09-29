"use client";

import DeleteContentDialog from "@/src/components/admin/DeleteContentDialog";

export default function DeleteProjectDialog({ open, title, loading, onConfirm, onCancel, error }: { open: boolean; title: string; loading: boolean; error?: string | null; onConfirm: () => void; onCancel: () => void; }) {
  return <DeleteContentDialog open={open} title={title} resource="proyecto" loading={loading} error={error} onConfirm={onConfirm} onCancel={onCancel} />;
}
