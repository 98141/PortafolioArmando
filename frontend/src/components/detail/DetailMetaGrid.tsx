interface DetailMetaGridProps {
  items: Array<{ label: string; value?: string | number | null }>;
}

export default function DetailMetaGrid({ items }: DetailMetaGridProps) {
  const visible = items.filter((item) => item.value !== undefined && item.value !== null && item.value !== "");
  if (visible.length === 0) return null;

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {visible.map((item) => (
        <article key={item.label} className="glass-panel rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">{item.label}</p>
          <p className="mt-1 text-sm text-zinc-200">{item.value}</p>
        </article>
      ))}
    </section>
  );
}
