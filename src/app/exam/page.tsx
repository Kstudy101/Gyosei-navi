import type { Metadata } from "next";
import { getArticlesBySection } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";

export const metadata: Metadata = {
  title: "試験・開業",
  description:
    "行政書士試験の学習情報と、合格後の実務・開業準備に役立つ情報をお届けします。",
};

export default function ExamIndexPage() {
  const articles = getArticlesBySection("exam");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">試験・開業</h1>
      <p className="mt-2 text-sm text-gray-600">
        行政書士試験と、合格後のキャリア・開業準備に関する情報です。
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
