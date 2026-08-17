/** 更新履歴 — 訂正・更新の公開自体が E-E-A-T シグナル（docs/04 §6） */
export function UpdateLog({
  changelog,
}: {
  changelog: readonly { date: string; note: string }[];
}) {
  if (changelog.length === 0) return null;
  return (
    <section className="not-prose my-8">
      <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">
        更新履歴
      </h2>
      <ul className="mt-3 space-y-1">
        {changelog.map((entry) => (
          <li key={`${entry.date}-${entry.note}`} className="text-sm text-gray-600">
            <time dateTime={entry.date} className="mr-2 font-mono text-xs text-gray-500">
              {entry.date}
            </time>
            {entry.note}
          </li>
        ))}
      </ul>
    </section>
  );
}
