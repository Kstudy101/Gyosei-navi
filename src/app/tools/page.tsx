import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "診断ツール",
  description:
    "永住要件セルフ診断など、行政手続きの要件を自分で確認できる診断ツールを公開しています。入力内容は送信・保存されません。",
};

const LIVE_TOOLS = [
  {
    name: "【診断】改定後もあなたは永住申請できるか",
    href: "/tools/eiju-shindan",
    description:
      "2027年4月適用の永住ガイドライン改定案に対応。立場・年数・申請時期を選ぶだけで、特例年数の充足と適用される考慮要素（世帯収入・年金・日本語B1など）を確認できます。",
  },
] as const;

const PLANNED_TOOLS = [
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
        行政手続きの要件を自分で確認できるツールです。入力内容は送信・保存されません。
      </p>
      <div className="mt-6 space-y-4">
        {LIVE_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block rounded-lg border-2 border-brand-600 p-5 hover:bg-brand-50"
          >
            <div className="flex items-center gap-2">
              <p className="font-bold text-brand-600">{tool.name}</p>
              <span className="rounded bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                公開中
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {tool.description}
            </p>
          </Link>
        ))}
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
