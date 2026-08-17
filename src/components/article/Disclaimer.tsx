/** 全記事末尾の定型免責文（docs/06_LEGAL_COMPLIANCE.md §3.2 — 文言変更は要編集長判断） */
export function Disclaimer() {
  return (
    <aside className="not-prose my-8 rounded-md border border-gray-300 bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
      <p className="font-bold text-gray-700">【ご注意】</p>
      <p className="mt-1">
        本記事は制度に関する一般的な情報提供であり、個別の事案に対する法的助言ではありません。
        実際の申請にあたっては、最新の公式情報をご確認のうえ、
        必要に応じて行政書士等の有資格者にご相談ください。
      </p>
    </aside>
  );
}
