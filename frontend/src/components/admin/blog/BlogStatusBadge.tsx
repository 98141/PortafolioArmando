"use client";

import type { BlogStatus } from "@/src/types/blogPost";
import { blogStatusLabels, blogStatusVariants } from "@/src/lib/blogPostLabels";
import TechBadge from "@/src/components/ui/TechBadge";

interface BlogStatusBadgeProps {
  status: BlogStatus;
}

export default function BlogStatusBadge({ status }: BlogStatusBadgeProps) {
  return (
    <TechBadge label={blogStatusLabels[status]} variant={blogStatusVariants[status]} />
  );
}
