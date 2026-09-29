"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import CyberLabForm from "@/src/components/admin/cyber-labs/CyberLabForm";
import { cyberLabService } from "@/src/services/cyberLabService";
import { labToFormValues } from "@/src/lib/cyberLabForm";
export default function EditPage() {
  const router = useRouter();
  const id = useParams().id as string;
  const user = useAuthStore(state => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["admin-cyber-labs", user?._id, id],
    queryFn: () => cyberLabService.getAdminCyberLabById(id),
    enabled: !!user, staleTime: 0, gcTime: 0, retry: false,
    refetchOnWindowFocus: false,
  });
  const handleSubmit = async (payload: Record<string, unknown>) => {
    setLoading(true); setError(null);
    try { await cyberLabService.updateCyberLab(id, payload); router.push("/admin/cyber-labs"); }
    catch { setError("No se pudieron guardar los cambios. Revisa los campos e inténtalo de nuevo."); setLoading(false); }
  };
  return <ProtectedRoute><AdminLayout>
    <h2 className="mb-6 text-2xl font-bold text-zinc-100">Editar laboratorio</h2>
    {query.isPending ? <p role="status" className="py-16 text-center text-zinc-400">Cargando contenido…</p> :
      query.isError || !query.data ? <div role="alert" className="space-y-4 text-rose-300">
        <p>No se pudo cargar el registro solicitado.</p>
        <button onClick={() => void query.refetch()} className="text-cyan-300">Reintentar</button>
      </div> : <CyberLabForm key={id} defaultValues={labToFormValues(query.data)} submitLabel="Guardar cambios"
        loading={loading} error={error} onSubmit={handleSubmit} onCancel={() => router.push("/admin/cyber-labs")} />}
  </AdminLayout></ProtectedRoute>;
}
