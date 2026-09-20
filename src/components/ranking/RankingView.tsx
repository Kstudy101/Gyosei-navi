import { Breadcrumb, type Crumb } from "@/components/layout/Breadcrumb";
import type { RankingArticle } from "@/lib/ranking";

export function RankingView({ article, crumbs }: { article: RankingArticle; crumbs: Crumb[] }) {
  const fm = article.frontmatter;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8" data-pagefind-body>
      <Breadcrumb items={crumbs} />

      {fm.status !== "published" && (
        <div className="mt-4 rounded-md border-2 border-dashed border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300">
          ★ 미공개 초안 (status: {fm.status})
        </div>
      )}

      <header className="mt-4">
        <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-100">
          ランキング
        </span>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl dark:text-gray-100">{fm.title}</h1>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <time dateTime={fm.publishedAt}>公開: {fm.publishedAt}</time>
          <span className="mx-2">|</span>
          <time dateTime={fm.updatedAt}>最終更新: {fm.updatedAt}</time>
        </p>
      </header>

      <ol className="mt-8 space-y-6">
        {fm.items.map((item) => (
          <li key={item.rank} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
            <p className="text-sm font-bold text-brand-700 dark:text-brand-100">第{item.rank}位</p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{item.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
