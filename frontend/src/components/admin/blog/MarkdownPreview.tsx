"use client";

import MarkdownRenderer from "@/src/components/blog/MarkdownRenderer";

interface MarkdownPreviewProps {
  content: string;
  title?: string;
}

export default function MarkdownPreview({ content, title = "Vista previa" }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className="glass-panel rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
        Escribe contenido en Markdown para ver la vista previa.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-violet-400/80">
        {title}
      </p>
      <MarkdownRenderer content={content} />
    </div>
  );
}
