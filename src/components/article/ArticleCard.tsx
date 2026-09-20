import Link from "next/link";
import type { Article } from "@/lib/content";
import { TYPE_TAGS, SUBSIDY_STATUSES, getCategory } from "@/config/taxonomy";

const BADGE_TONE = {
  positive: "border-emerald-400 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300",
  neutral: "border-gray-400 text-gray-600 dark:border-gray-600 dark:text-gray-400",
  info: "border-blue-400 text-blue-700 dark:border-blue-600 dark:text-blue-300",
  warning: "border-amber-400 text-amber-700 dark:border-amber-600 dark:text-amber-300",
} as const;

export function ArticleCard({ article }: { article: Article }) {
  const fm = article.frontmatter;
  const category = getCategory(fm.category);
  const statusDef = fm.subsidy ? SUBSIDY_STATUSES[fm.subsidy.status] : null;
  return (
    <article className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-800">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-100">
          {TYPE_TAGS[fm.type]}
        </span>
        {category && <span className="text-gray-500 dark:text-gray-400">{category.labelShort}</span>}
        {statusDef && (
          <span className={`rounded border px-1.5 py-0.5 font-semibold ${BADGE_TONE[statusDef.tone]}`}>
            {statusDef.label}
          </span>
        )}
        {fm.status !== "published" && (
          <span className="rounded border border-red-400 px-1.5 py-0.5 font-semibold text-red-600 dark:border-red-500 dark:text-red-300">
            未公開: {fm.status}
          </span>
        )}
      </div>
      <h3 className="mt-2 font-bold leading-snug text-gray-900 dark:text-gray-100">
        <Link href={article.href} className="hover:text-brand-600 dark:hover:text-brand-100">
          {fm.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{fm.description}</p>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        <time dateTime={fm.updatedAt}>
          {fm.updatedAt !== fm.publishedAt ? "最終更新" : "更新"}: {fm.updatedAt}
        </time>
      </p>
    </article>
  );
}
