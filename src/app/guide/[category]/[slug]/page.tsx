import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory } from "@/config/taxonomy";
import { getArticle, getArticlesBySection } from "@/lib/content";
import { articleMetadata } from "@/lib/seo";
import { ArticleView } from "@/components/article/ArticleView";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticlesBySection("guide").map((a) => ({
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
  const article = getArticle("guide", slug, category);
  return article ? articleMetadata(article) : {};
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const article = getArticle("guide", slug, category);
  if (!article) notFound();
  const def = getCategory(category);

  return (
    <ArticleView
      article={article}
      crumbs={[
        { label: "ホーム", href: "/" },
        { label: "手続きガイド", href: "/guide" },
        { label: def?.labelJa ?? category, href: `/guide/${category}` },
        { label: article.frontmatter.title, href: article.href },
      ]}
    />
  );
}
