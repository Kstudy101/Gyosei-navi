import Link from "next/link";
import { getArticleBySlug } from "@/lib/content";
import { SUBSIDY_STATUSES } from "@/config/taxonomy";
import { compareInfoImagePaths } from "@/lib/seo";

/**
 * 地域横断比較テーブル（docs/01_IA_TAXONOMY.md v2 §5, docs/03 §3 新設）。
 * compareTargets に列挙された記事 slug を引き、各記事の subsidy フィールドを並べる。
 * 対象が5件未満なら空表示に倒す（比較記事の品質ゲート — docs/03 §6 は最低5件を要求）。
 */
export function CompareTable({
  targets,
  infoImage,
}: {
  targets: readonly string[];
  /** 表の上に載せる情報画像（scripts/generate-og-images.ts 生成）。表と同じデータの図解版 */
  infoImage?: { slug: string; title: string };
}) {
  const rows = targets
    .map((slug) => getArticleBySlug(slug))
    .filter((a): a is NonNullable<typeof a> => a !== undefined && a.frontmatter.subsidy !== undefined);

  if (rows.length === 0) {
    return (
      <p className="not-prose my-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200">
        比較対象のデータがまだ揃っていません。
      </p>
    );
  }

  return (
    <>
      {infoImage && (
        <figure className="not-prose my-6">
          {/* output: export のため next/image の最適化は使えない */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={compareInfoImagePaths(infoImage.slug)[0]}
            alt={`${infoImage.title}：対象自治体の地図と募集状況・締切の一覧`}
            width={1200}
            height={675}
            loading="lazy"
            className="h-auto w-full rounded-md border border-gray-200 dark:border-gray-700"
          />
          <figcaption className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            図：対象自治体の所在地と募集状況（詳細は下の比較表と各記事の公式リンクを参照）
          </figcaption>
        </figure>
      )}
      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300 text-left dark:border-gray-700">
              <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">地域</th>
              <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">金額</th>
              <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">状況</th>
              <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">申請期限</th>
              <th className="p-2 font-semibold text-gray-700 dark:text-gray-300">詳細</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const s = a.frontmatter.subsidy!;
              const status = SUBSIDY_STATUSES[s.status];
              return (
                <tr key={a.href} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-2 font-medium text-gray-900 dark:text-gray-100">{s.regionLabel}</td>
                  <td className="p-2 text-gray-800 dark:text-gray-200">{s.amount ?? "—"}</td>
                  <td className="p-2 text-gray-600 dark:text-gray-400">{status.label}</td>
                  <td className="p-2 text-gray-600 dark:text-gray-400">{s.periodEnd ?? "—"}</td>
                  <td className="p-2">
                    <Link href={a.href} className="text-brand-600 hover:underline dark:text-brand-100">
                      記事を見る →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
