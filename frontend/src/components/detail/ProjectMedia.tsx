import Image from "next/image";
import { httpUrl, supportedImageUrl } from "@/src/lib/publicLinks";
import type { ProjectImage } from "@/src/types/project";

export default function ProjectMedia({ image, title, priority = false }: { image: ProjectImage; title: string; priority?: boolean }) {
  const link = httpUrl(image.url);
  if (!link) return null;
  const source = supportedImageUrl(image.url);
  return <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
    {source ? <div className="relative aspect-video"><Image src={source} alt={image.alt || title} fill sizes="(max-width: 768px) 100vw, 960px" className="object-contain" priority={priority} /></div> :
      <a href={link} target="_blank" rel="noopener noreferrer" className="block p-6 text-cyan-300">Ver imagen: {image.alt || title}</a>}
    {image.alt && <figcaption className="border-t border-white/10 p-4 text-sm text-zinc-400">{image.alt}</figcaption>}
  </figure>;
}
