"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import BlogPostForm from "@/src/components/admin/blog/BlogPostForm";
import { blogPostService } from "@/src/services/blogPostService";
import { postToFormValues } from "@/src/lib/blogPostForm";

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState(
    postToFormValues({
      _id: id,
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "other",
      tags: [],
      status: "draft",
      readingTime: 1,
      relatedTopics: [],
      allowComments: false,
      isFeatured: false,
      isActive: true,
      priority: 100,
      createdAt: "",
      updatedAt: "",
    })
  );

  useEffect(() => {
    const load = async () => {
      try {
        const post = await blogPostService.getAdminBlogPostById(id);
        setDefaultValues(postToFormValues(post));
      } catch {
        setError("No se pudo cargar el artículo.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      await blogPostService.updateBlogPost(id, payload);
      router.push("/admin/blog");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo actualizar el artículo.";
      setError(message);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Editar artículo</h2>
        </div>
        <BlogPostForm
          key={id}
          defaultValues={defaultValues}
          submitLabel="Guardar cambios"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/blog")}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
