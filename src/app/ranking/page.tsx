import type { Metadata } from "next";
import Link from "next/link";
import { getAllRankingArticles } from "@/lib/ranking";

export const metadata: Metadata = {
  title: "ランキング",
  description: "検索トレンドをもとに編集部が自動生成する、補助金・助成金に関するTOP5ランキング記事です。",
};

export default function RankingIndexPage() {
  const articles = getAllRankingArticles();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ランキング</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        検索トレンドをもとに自動生成しているランキング記事です。内容は一般的な情報提供であり、個別の制度内容は必ず各実施主体の公式情報をご確認ください。
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <Link
            key={a.frontmatter.slug}
            href={a.href}
            className="rounded-lg border border-gray-200 p-5 transition-shadow hover:shadow-md dark:border-gray-800"
          >
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{a.frontmatter.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{a.frontmatter.description}</p>
          </Link>
        ))}
        {articles.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">まだランキング記事がありません。</p>
        )}
      </div>
    </div>
  );
}
