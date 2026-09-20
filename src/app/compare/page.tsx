import type { Metadata } from "next";
import { getArticlesBySection } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";

export const metadata: Metadata = {
  title: "地域比較",
  description: "同じ目的の補助金・助成金を、地域ごとに並べて比較します。",
};

export default function CompareIndexPage() {
  const articles = getArticlesBySection("compare");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">地域比較</h1>
      <p className="mt-2 text-sm text-gray-600">同じ目的の補助金を、地域ごとに並べて比較します。</p>
      {articles.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.href} article={a} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-500">比較記事は現在準備中です。</p>
      )}
    </div>
  );
}
