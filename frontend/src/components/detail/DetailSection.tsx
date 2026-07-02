interface DetailSectionProps {
  title: string;
  content?: string;
  items?: string[];
}

export default function DetailSection({ title, content, items }: DetailSectionProps) {
  const hasList = items && items.length > 0;
  if (!content && !hasList) return null;

  return (
    <section className="glass-panel rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      {content && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">{content}</p>}
      {hasList && (
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          {items.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
