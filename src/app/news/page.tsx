import type { Metadata } from "next";
import { getArticlesBySection } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";

export const metadata: Metadata = {
  title: "速報・動向",
  description:
    "行政書士業務に関わる制度改正・法改正・パブリックコメントなどの最新動向を、一次情報に基づいて最速で解説します。",
};

export default function NewsIndexPage() {
  const articles = getArticlesBySection("news");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">速報・動向</h1>
      <p className="mt-2 text-sm text-gray-600">
        制度改正・パブリックコメント・運用変更の最新情報を一次情報から解説します。
      </p>
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
