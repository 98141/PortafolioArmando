import Link from "next/link";

interface DetailHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumb: { label: string; href?: string }[];
}

export default function DetailHero({ title, subtitle, description, breadcrumb }: DetailHeroProps) {
  return (
    <header className="border-b border-white/5 bg-[#080c18]/60 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          {breadcrumb.map((item, i) => (
            <span key={`${item.label}-${i}`} className="inline-flex items-center gap-2">
              {item.href ? (
                <Link href={item.href} className="hover:text-cyan-300">
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-300">{item.label}</span>
              )}
              {i < breadcrumb.length - 1 ? <span>/</span> : null}
            </span>
          ))}
        </nav>
        <h1 className="text-3xl font-bold text-zinc-100 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-cyan-300">{subtitle}</p>}
        {description && <p className="mt-4 max-w-3xl text-zinc-400">{description}</p>}
      </div>
    </header>
  );
}
