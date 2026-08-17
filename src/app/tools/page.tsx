import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "診断ツール",
  description:
    "永住要件セルフ診断など、行政手続きの要件を自分で確認できる診断ツールを順次公開予定です。",
};

const PLANNED_TOOLS = [
  {
    name: "永住要件セルフ診断",
    description:
      "2027年施行見込みのガイドライン改定案を含む、永住許可の一般的な要件をセルフチェックできるツール。",
  },
  {
    name: "在留資格判定ナビ",
    description: "活動内容から該当しうる在留資格の候補を確認できるナビゲーション。",
  },
  {
    name: "費用シミュレーター",
    description: "各種手続きの法定手数料・実費の目安を試算できるツール。",
  },
] as const;

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">診断ツール</h1>
      <p className="mt-2 text-sm text-gray-600">
        行政手続きの要件を自分で確認できるツールを順次公開予定です。
      </p>
      <div className="mt-6 space-y-4">
        {PLANNED_TOOLS.map((tool) => (
          <div key={tool.name} className="rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900">{tool.name}</p>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-500">
                準備中
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {tool.description}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs leading-relaxed text-gray-500">
        ※ 本サイトの診断ツールは、公表されている一般的な要件との照合結果を表示するものであり、
        許可の可否を判定するものではありません。実際の審査は個別事情を総合的に考慮して行われます。
      </p>
    </div>
  );
}
