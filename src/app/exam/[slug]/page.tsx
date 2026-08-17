import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getArticlesBySection } from "@/lib/content";
import { articleMetadata } from "@/lib/seo";
import { ArticleView } from "@/components/article/ArticleView";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticlesBySection("exam").map((a) => ({ slug: a.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle("exam", slug);
  return article ? articleMetadata(article) : {};
}

export default async function ExamArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle("exam", slug);
  if (!article) notFound();

  return (
    <ArticleView
      article={article}
      crumbs={[
        { label: "ホーム", href: "/" },
        { label: "試験・開業", href: "/exam" },
        { label: article.frontmatter.title, href: article.href },
      ]}
    />
  );
}
