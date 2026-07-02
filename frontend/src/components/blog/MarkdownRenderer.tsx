"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/src/lib/cn";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "blog-markdown text-zinc-300 [&_a]:text-cyan-400 [&_a:hover]:text-cyan-300",
        "[&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-zinc-100",
        "[&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-100",
        "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-zinc-100",
        "[&_p]:mb-4 [&_p]:leading-relaxed",
        "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:mb-1",
        "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-violet-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-400",
        "[&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-cyan-200",
        "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-black/40 [&_pre]:p-4",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_hr]:my-8 [&_hr]:border-white/10",
        "[&_table]:my-4 [&_table]:w-full [&_th]:border [&_th]:border-white/10 [&_th]:px-3 [&_th]:py-2 [&_td]:border [&_td]:border-white/10 [&_td]:px-3 [&_td]:py-2",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
