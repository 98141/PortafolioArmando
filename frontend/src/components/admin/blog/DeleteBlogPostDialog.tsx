"use client";
import type { BlogPost } from "@/src/types/blogPost";
import DeleteContentDialog from "@/src/components/admin/DeleteContentDialog";

export default function DeleteBlogPostDialog({ post, loading = false, onConfirm, onCancel, error }: { post: BlogPost | null; loading?: boolean; error?: string | null; onConfirm: () => void; onCancel: () => void; }) {
  return <DeleteContentDialog open={!!post} title={post?.title || ""} resource="artículo" loading={loading} error={error} onConfirm={onConfirm} onCancel={onCancel} />;
}
