export function httpUrl(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return undefined;
    return url.href;
  } catch { return undefined; }
}

// Match next/image's configured provider; other safe URLs remain available as links.
export function supportedImageUrl(value?: string): string | undefined {
  const valid = httpUrl(value);
  if (!valid) return undefined;
  const url = new URL(valid);
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && (!cloud || url.pathname.startsWith(`/${cloud}/`)) ? valid : undefined;
}
