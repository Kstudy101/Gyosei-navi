import Link from "next/link";
import type { Article } from "@/lib/content";
import { TYPE_TAGS, NOTICE_LEVELS, getCategory } from "@/config/taxonomy";

export function ArticleCard({ article }: { article: Article }) {
  const fm = article.frontmatter;
  const category = getCategory(fm.category);
  return (
    <article className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700">
          {TYPE_TAGS[fm.type]}
        </span>
        {category && <span className="text-gray-500">{category.labelShort}</span>}
        {fm.noticeLevel !== "enforced" && (
          <span className="rounded border border-amber-400 px-1.5 py-0.5 font-semibold text-amber-700">
            {NOTICE_LEVELS[fm.noticeLevel].label}
          </span>
        )}
        {fm.status !== "published" && (
          <span className="rounded border border-red-400 px-1.5 py-0.5 font-semibold text-red-600">
            未公開: {fm.status}
          </span>
        )}
        {fm.updatedAt !== fm.publishedAt && (
          <span className="rounded border border-emerald-500 px-1.5 py-0.5 font-semibold text-emerald-700">
            最新情報に更新済み
          </span>
        )}
      </div>
      <h3 className="mt-2 font-bold leading-snug text-gray-900">
        <Link href={article.href} className="hover:text-brand-600">
          {fm.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
        {fm.description}
      </p>
      <p className="mt-2 text-xs text-gray-400">
        <time dateTime={fm.updatedAt}>
          {fm.updatedAt !== fm.publishedAt ? "最終更新" : "更新"}: {fm.updatedAt}
        </time>
      </p>
    </article>
  );
}
