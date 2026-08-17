import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getArticlesBySection, orPlaceholder, EXPORT_PLACEHOLDER } from "@/lib/content";
import { articleMetadata } from "@/lib/seo";
import { ArticleView } from "@/components/article/ArticleView";

export const dynamicParams = false;

export function generateStaticParams() {
  return orPlaceholder(
    getArticlesBySection("news").map((a) => ({ slug: a.frontmatter.slug })),
    { slug: EXPORT_PLACEHOLDER }
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle("news", slug);
  return article ? articleMetadata(article) : {};
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle("news", slug);
  if (!article) notFound();

  return (
    <ArticleView
      article={article}
      crumbs={[
        { label: "ホーム", href: "/" },
        { label: "速報・動向", href: "/news" },
        { label: article.frontmatter.title, href: article.href },
      ]}
    />
  );
}
