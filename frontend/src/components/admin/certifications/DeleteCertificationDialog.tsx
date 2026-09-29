"use client";
import type { Certification } from "@/src/types/certification";
import DeleteContentDialog from "@/src/components/admin/DeleteContentDialog";

export default function DeleteCertificationDialog({ certification, loading = false, onConfirm, onCancel, error }: { certification: Certification | null; loading?: boolean; error?: string | null; onConfirm: () => void; onCancel: () => void; }) {
  return <DeleteContentDialog open={!!certification} title={certification?.title || ""} resource="certificación" loading={loading} error={error} onConfirm={onConfirm} onCancel={onCancel} />;
}
