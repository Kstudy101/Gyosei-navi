/**
 * 景品表示法・ステマ規制対応の「PR」告知（docs/06 §5）。
 * アフィリエイトリンク・広告を含む記事では、本文冒頭に必ず挿入すること。
 * 現時点（Phase A）では広告・提携は未導入 — 導入時に使用開始。
 */
export function PrNotice() {
  return (
    <div className="not-prose my-4 rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-xs leading-relaxed text-gray-600">
      <span className="mr-2 inline-block rounded border border-gray-400 px-1.5 py-0.5 font-bold">
        PR
      </span>
      本記事にはアフィリエイトリンク（広告）が含まれます。
    </div>
  );
}
