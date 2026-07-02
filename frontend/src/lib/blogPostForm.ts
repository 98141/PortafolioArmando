import type { BlogPost, BlogPostFormValues } from "@/src/types/blogPost";

export const parseCommaList = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const joinCommaList = (items: string[] = []): string => items.join(", ");

export const toDateInput = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export const defaultBlogPostFormValues: BlogPostFormValues = {
  title: "",
  excerpt: "",
  content: "",
  coverUrl: "",
  coverPublicId: "",
  coverAlt: "",
  category: "other",
  tagsInput: "",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  authorName: "Armando Mora",
  authorRole: "Software Developer | Cybersecurity Specialist",
  authorAvatarUrl: "",
  authorAvatarPublicId: "",
  relatedTopicsInput: "",
  allowComments: false,
  isFeatured: false,
  isActive: true,
  priority: 100,
  publishedAt: "",
  lastReviewedAt: "",
};

export const formValuesToPayload = (values: BlogPostFormValues) => {
  const payload: Record<string, unknown> = {
    title: values.title,
    excerpt: values.excerpt,
    content: values.content,
    category: values.category,
    tags: parseCommaList(values.tagsInput),
    status: values.status,
    relatedTopics: parseCommaList(values.relatedTopicsInput),
    allowComments: values.allowComments,
    isFeatured: values.isFeatured,
    isActive: values.isActive,
    priority: values.priority,
  };

  if (values.coverUrl) {
    payload.coverImage = {
      url: values.coverUrl,
      publicId: values.coverPublicId || undefined,
      alt: values.coverAlt || undefined,
    };
  }

  if (values.seoTitle || values.seoDescription || values.canonicalUrl) {
    payload.seo = {
      title: values.seoTitle || undefined,
      description: values.seoDescription || undefined,
      canonicalUrl: values.canonicalUrl || undefined,
    };
  }

  if (values.authorName || values.authorRole || values.authorAvatarUrl) {
    payload.author = {
      name: values.authorName || undefined,
      role: values.authorRole || undefined,
      avatarUrl: values.authorAvatarUrl || undefined,
      avatarPublicId: values.authorAvatarPublicId || undefined,
    };
  }

  if (values.publishedAt) {
    payload.publishedAt = new Date(values.publishedAt).toISOString();
  }
  if (values.lastReviewedAt) {
    payload.lastReviewedAt = new Date(values.lastReviewedAt).toISOString();
  }

  return payload;
};

export const postToFormValues = (post: BlogPost): BlogPostFormValues => ({
  title: post.title,
  excerpt: post.excerpt,
  content: post.content,
  coverUrl: post.coverImage?.url ?? "",
  coverPublicId: post.coverImage?.publicId ?? "",
  coverAlt: post.coverImage?.alt ?? "",
  category: post.category,
  tagsInput: joinCommaList(post.tags),
  status: post.status,
  seoTitle: post.seo?.title ?? "",
  seoDescription: post.seo?.description ?? "",
  canonicalUrl: post.seo?.canonicalUrl ?? "",
  authorName: post.author?.name ?? "Armando Mora",
  authorRole: post.author?.role ?? "",
  authorAvatarUrl: post.author?.avatarUrl ?? "",
  authorAvatarPublicId: post.author?.avatarPublicId ?? "",
  relatedTopicsInput: joinCommaList(post.relatedTopics),
  allowComments: post.allowComments,
  isFeatured: post.isFeatured,
  isActive: post.isActive,
  priority: post.priority,
  publishedAt: toDateInput(post.publishedAt),
  lastReviewedAt: toDateInput(post.lastReviewedAt),
});
