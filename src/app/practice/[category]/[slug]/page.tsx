import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRACTICE_CATEGORIES } from "@/config/taxonomy";
import { getArticle, getArticlesBySection } from "@/lib/content";
import { articleMetadata } from "@/lib/seo";
import { ArticleView } from "@/components/article/ArticleView";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticlesBySection("practice").map((a) => ({
    category: a.category!,
    slug: a.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const article = getArticle("practice", slug, category);
  return article ? articleMetadata(article) : {};
}

export default async function PracticeArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const article = getArticle("practice", slug, category);
  if (!article) notFound();
  const def = (
    PRACTICE_CATEGORIES as Record<string, { labelJa: string; description: string }>
  )[category];

  return (
    <ArticleView
      article={article}
      crumbs={[
        { label: "ホーム", href: "/" },
        { label: "実務インテリジェンス", href: "/practice" },
        { label: def?.labelJa ?? category, href: `/practice/${category}` },
        { label: article.frontmatter.title, href: article.href },
      ]}
    />
  );
}
