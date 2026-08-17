interface LegalBasis {
  label: string;
  url: string;
  accessedAt: string;
}

/** 出典・関連法令（一次情報）リスト — E-E-A-T / YMYL 対応の中核 */
export function LegalBasisList({ items }: { items: readonly LegalBasis[] }) {
  if (items.length === 0) return null;
  return (
    <section className="not-prose my-8">
      <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">
        出典・関連法令（一次情報）
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.url} className="text-sm leading-relaxed">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 underline-offset-2 hover:underline"
            >
              {item.label}
            </a>
            <span className="ml-2 text-xs text-gray-500">
              （参照日: {item.accessedAt}）
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
