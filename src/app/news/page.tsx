import type { Metadata } from "next";
import { getArticlesBySection } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";

export const metadata: Metadata = {
  title: "新着・締切情報",
  description: "補助金・助成金の新着公募、募集締切、条件変更の最新情報を一次情報に基づいて解説します。",
};

export default function NewsIndexPage() {
  const articles = getArticlesBySection("news");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">新着・締切情報</h1>
      <p className="mt-2 text-sm text-gray-600">新着公募・募集締切・条件変更の最新情報をお届けします。</p>
      {articles.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.href} article={a} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-500">記事は現在準備中です。</p>
      )}
    </div>
  );
}
