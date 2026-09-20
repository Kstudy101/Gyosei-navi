import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOKUSHU_CATEGORY_CODES, getTokushuCategory } from "@/config/taxonomy";
import { getArticlesBySection } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOKUSHU_CATEGORY_CODES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const def = getTokushuCategory(category);
  if (!def) return {};
  return { title: def.labelJa, description: def.description };
}

export default async function TokushuCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const def = getTokushuCategory(category);
  if (!def) notFound();

  const articles = getArticlesBySection("tokushu", category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "特集", href: "/tokushu" },
          { label: def.labelJa, href: `/tokushu/${category}` },
        ]}
      />
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{def.labelJa}</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{def.description}</p>
      {articles.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.href} article={a} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          このテーマの特集はまだ準備中です。比較できる自治体データが十分に集まり次第、公開します。
        </p>
      )}
    </div>
  );
}
