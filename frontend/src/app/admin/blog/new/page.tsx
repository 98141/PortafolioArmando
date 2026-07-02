"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import BlogPostForm from "@/src/components/admin/blog/BlogPostForm";
import { blogPostService } from "@/src/services/blogPostService";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const post = await blogPostService.createBlogPost(payload);
      router.push(`/admin/blog/${post._id}/edit`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo crear el artículo.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Nuevo artículo</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Writeup técnico o publicación del Knowledge Hub en Markdown.
          </p>
        </div>
        <BlogPostForm
          submitLabel="Crear artículo"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/blog")}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
