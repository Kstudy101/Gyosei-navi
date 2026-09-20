import Link from "next/link";
import { getArticleBySlug } from "@/lib/content";
import { SUBSIDY_STATUSES } from "@/config/taxonomy";

/**
 * 地域横断比較テーブル（docs/01_IA_TAXONOMY.md v2 §5, docs/03 §3 新設）。
 * compareTargets に列挙された記事 slug を引き、各記事の subsidy フィールドを並べる。
 * 対象が5件未満なら空表示に倒す（比較記事の品質ゲート — docs/03 §6 は最低5件を要求）。
 */
export function CompareTable({ targets }: { targets: readonly string[] }) {
  const rows = targets
    .map((slug) => getArticleBySlug(slug))
    .filter((a): a is NonNullable<typeof a> => a !== undefined && a.frontmatter.subsidy !== undefined);

  if (rows.length === 0) {
    return (
      <p className="not-prose my-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        比較対象のデータがまだ揃っていません。
      </p>
    );
  }

  return (
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300 text-left">
            <th className="p-2 font-semibold text-gray-700">地域</th>
            <th className="p-2 font-semibold text-gray-700">金額</th>
            <th className="p-2 font-semibold text-gray-700">状況</th>
            <th className="p-2 font-semibold text-gray-700">申請期限</th>
            <th className="p-2 font-semibold text-gray-700">詳細</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const s = a.frontmatter.subsidy!;
            const status = SUBSIDY_STATUSES[s.status];
            return (
              <tr key={a.href} className="border-b border-gray-100">
                <td className="p-2 font-medium text-gray-900">{s.regionLabel}</td>
                <td className="p-2 text-gray-800">{s.amount ?? "—"}</td>
                <td className="p-2 text-gray-600">{status.label}</td>
                <td className="p-2 text-gray-600">{s.periodEnd ?? "—"}</td>
                <td className="p-2">
                  <Link href={a.href} className="text-brand-600 hover:underline">
                    記事を見る →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
