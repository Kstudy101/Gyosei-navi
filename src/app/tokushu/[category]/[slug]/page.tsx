import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTokushuCategory } from "@/config/taxonomy";
import { getArticle, getArticlesBySection, orPlaceholder, EXPORT_PLACEHOLDER } from "@/lib/content";
import { articleMetadata } from "@/lib/seo";
import { ArticleView } from "@/components/article/ArticleView";

export const dynamicParams = false;

export function generateStaticParams() {
  return orPlaceholder(
    getArticlesBySection("tokushu").map((a) => ({ category: a.category!, slug: a.frontmatter.slug })),
    { category: EXPORT_PLACEHOLDER, slug: EXPORT_PLACEHOLDER }
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const article = getArticle("tokushu", slug, category);
  return article ? articleMetadata(article) : {};
}

export default async function TokushuArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const article = getArticle("tokushu", slug, category);
  if (!article) notFound();
  const def = getTokushuCategory(category);

  return (
    <ArticleView
      article={article}
      crumbs={[
        { label: "ホーム", href: "/" },
        { label: "特集", href: "/tokushu" },
        { label: def?.labelJa ?? category, href: `/tokushu/${category}` },
        { label: article.frontmatter.title, href: article.href },
      ]}
    />
  );
}
