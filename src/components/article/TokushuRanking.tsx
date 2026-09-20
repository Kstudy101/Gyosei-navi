import Link from "next/link";
import { getArticleBySlug } from "@/lib/content";
import type { ArticleFrontmatter } from "@/lib/content-schema";

type RankingItem = ArticleFrontmatter["rankings"][number];

const RANK_BADGE = [
  "bg-amber-400 text-amber-950 dark:bg-amber-500 dark:text-amber-950", // 1位
  "bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100", // 2位
  "bg-orange-300 text-orange-950 dark:bg-orange-500 dark:text-orange-950", // 3位
] as const;

/**
 * 特集（編集的ランキング）の順位表示（docs/01_IA_TAXONOMY.md v2 §7, docs/03 §3-2 新設）。
 * frontmatter の rankings（最低5件 — content-schema.ts の refine で強制）を、
 * 根拠記事（subsidy/compare）へのリンク付きで表示する。
 */
export function TokushuRanking({ items }: { items: readonly RankingItem[] }) {
  if (items.length === 0) {
    return (
      <p className="not-prose my-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200">
        ランキングのデータがまだ揃っていません。
      </p>
    );
  }

  const sorted = [...items].sort((a, b) => a.rank - b.rank);

  return (
    <ol className="not-prose my-6 space-y-3">
      {sorted.map((item) => {
        const article = getArticleBySlug(item.slug);
        const badgeClass = RANK_BADGE[item.rank - 1] ?? "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100";
        return (
          <li
            key={item.rank}
            className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badgeClass}`}
            >
              {item.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 dark:text-gray-100">{item.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{item.summary}</p>
              {article && (
                <Link href={article.href} className="mt-2 inline-block text-sm text-brand-600 hover:underline dark:text-brand-100">
                  詳細記事を見る →
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
