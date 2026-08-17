import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRACTICE_CATEGORIES } from "@/config/taxonomy";
import { getArticlesBySection } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PRACTICE_CATEGORIES).map((category) => ({ category }));
}

function getDef(category: string) {
  return (PRACTICE_CATEGORIES as Record<string, { labelJa: string; description: string }>)[
    category
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const def = getDef(category);
  if (!def) return {};
  return { title: def.labelJa, description: def.description };
}

export default async function PracticeCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const def = getDef(category);
  if (!def) notFound();

  const articles = getArticlesBySection("practice", category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "実務インテリジェンス", href: "/practice" },
          { label: def.labelJa, href: `/practice/${category}` },
        ]}
      />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">{def.labelJa}</h1>
      <p className="mt-2 text-sm text-gray-600">{def.description}</p>
      {articles.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.href} article={a} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-500">この分野の記事は現在準備中です。</p>
      )}
    </div>
  );
}
