/**
 * frontmatter の faq を展開する（MDX 内では <FAQ /> として使用）。
 * JSON-LD FAQPage は ArticleView 側で出力する。
 */
export function FaqList({ items }: { items: readonly { q: string; a: string }[] }) {
  if (items.length === 0) return null;
  return (
    <dl className="not-prose my-6 space-y-4">
      {items.map((item) => (
        <div key={item.q} className="rounded-md border border-gray-200 p-4">
          <dt className="flex gap-2 font-semibold text-gray-900">
            <span className="text-brand-600">Q.</span>
            {item.q}
          </dt>
          <dd className="mt-2 flex gap-2 text-sm leading-relaxed text-gray-700">
            <span className="font-semibold text-accent-600">A.</span>
            {item.a}
          </dd>
        </div>
      ))}
    </dl>
  );
}
