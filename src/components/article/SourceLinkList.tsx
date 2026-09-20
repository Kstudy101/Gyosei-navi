interface SourceLink {
  label: string;
  url: string;
  accessedAt: string;
}

/** 出典（一次情報）リスト — v1 LegalBasisList の改名版（docs/03 §2.4） */
export function SourceLinkList({ items }: { items: readonly SourceLink[] }) {
  if (items.length === 0) return null;
  return (
    <section className="not-prose my-8">
      <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">出典</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.url} className="text-sm leading-relaxed">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 underline-offset-2 hover:underline dark:text-brand-100"
            >
              {item.label}
            </a>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">（参照日: {item.accessedAt}）</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
