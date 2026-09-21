import Link from "next/link";
import type { Article } from "@/lib/content";

/**
 * 新着・締切間近タブ用の1行カード。タイトルを1行に収め、「詳しくはこちら →」で
 * 該当のsubsidy記事へ誘導する（AGENTS.md 新着キャッチ設計・2026-09-21）。
 */
export function NewsListItem({ article, meta }: { article: Article; meta?: string }) {
  const fm = article.frontmatter;
  return (
    <li className="flex items-center justify-between gap-4 border-b border-gray-200 py-3 dark:border-gray-800">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{fm.title}</p>
        {meta && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{meta}</p>}
      </div>
      <Link
        href={article.href}
        className="shrink-0 whitespace-nowrap text-sm font-semibold text-brand-600 hover:underline dark:text-brand-100"
      >
        詳しくはこちら →
      </Link>
    </li>
  );
}
