"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import BlogPostFilters, {
  type BlogPostFilterState,
} from "@/src/components/admin/blog/BlogPostFilters";
import BlogPostTable from "@/src/components/admin/blog/BlogPostTable";
import DeleteBlogPostDialog from "@/src/components/admin/blog/DeleteBlogPostDialog";
import { blogPostService } from "@/src/services/blogPostService";
import type { BlogPost, BlogCategory, BlogStatus } from "@/src/types/blogPost";

const defaultFilters: BlogPostFilterState = {
  search: "",
  category: "all",
  status: "all",
  featured: "all",
  active: "all",
};

export default function AdminBlogPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<BlogPostFilterState>(defaultFilters);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = { page, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.category !== "all") params.category = filters.category as BlogCategory;
    if (filters.status !== "all") params.status = filters.status as BlogStatus;
    if (filters.featured === "yes") params.isFeatured = true;
    if (filters.featured === "no") params.isFeatured = false;
    if (filters.active === "yes") params.isActive = true;
    if (filters.active === "no") params.isActive = false;
    return params;
  }, [filters, page]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blogPostService.getAdminBlogPosts(queryParams);
      setPosts(data.posts);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudieron cargar los artículos.";
      setError(message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await blogPostService.deleteBlogPost(deleteTarget._id);
      setDeleteTarget(null);
      await loadPosts();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo eliminar el artículo.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Knowledge Hub</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Artículos técnicos, writeups y publicaciones profesionales.
              </p>
            </div>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo artículo
            </Link>
          </div>

          <BlogPostFilters filters={filters} onChange={setFilters} />

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-panel flex flex-col items-center rounded-2xl py-16 text-center">
              <FileText className="mb-4 h-12 w-12 text-zinc-600" aria-hidden="true" />
              <p className="text-zinc-400">No hay artículos con estos filtros.</p>
              <button
                type="button"
                onClick={() => router.push("/admin/blog/new")}
                className="mt-4 text-sm text-violet-400 hover:text-violet-300"
              >
                Publicar el primero →
              </button>
            </div>
          ) : (
            <>
              <BlogPostTable posts={posts} onDelete={setDeleteTarget} />
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="flex items-center px-4 text-sm text-zinc-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <DeleteBlogPostDialog
          post={deleteTarget}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
