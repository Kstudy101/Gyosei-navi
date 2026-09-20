import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllRankingArticles, getRankingArticle } from "@/lib/ranking";
import { orPlaceholder, EXPORT_PLACEHOLDER } from "@/lib/content";
import { RankingView } from "@/components/ranking/RankingView";

export const dynamicParams = false;

export function generateStaticParams() {
  return orPlaceholder(
    getAllRankingArticles().map((a) => ({ slug: a.frontmatter.slug })),
    { slug: EXPORT_PLACEHOLDER }
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getRankingArticle(slug);
  if (!article) return {};
  return { title: article.frontmatter.title, description: article.frontmatter.description };
}

export default async function RankingArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getRankingArticle(slug);
  if (!article) notFound();

  return (
    <RankingView
      article={article}
      crumbs={[
        { label: "ホーム", href: "/" },
        { label: "ランキング", href: "/ranking" },
        { label: article.frontmatter.title, href: article.href },
      ]}
    />
  );
}
