import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory } from "@/config/taxonomy";
import { getArticle, getArticlesBySection, orPlaceholder, EXPORT_PLACEHOLDER } from "@/lib/content";
import { articleMetadata, subsidyJsonLd, monetaryGrantJsonLd } from "@/lib/seo";
import { ArticleView } from "@/components/article/ArticleView";
import { JsonLd } from "@/components/seo/JsonLd";

export const dynamicParams = false;

export function generateStaticParams() {
  return orPlaceholder(
    getArticlesBySection("subsidy").map((a) => ({ category: a.category!, slug: a.frontmatter.slug })),
    { category: EXPORT_PLACEHOLDER, slug: EXPORT_PLACEHOLDER }
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const article = getArticle("subsidy", slug, category);
  return article ? articleMetadata(article) : {};
}

export default async function SubsidyArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const article = getArticle("subsidy", slug, category);
  if (!article) notFound();
  const def = getCategory(category);
  const govService = subsidyJsonLd(article);
  const grant = monetaryGrantJsonLd(article);

  return (
    <>
      {govService && <JsonLd data={govService} />}
      {grant && <JsonLd data={grant} />}
      <ArticleView
        article={article}
        crumbs={[
          { label: "ホーム", href: "/" },
          { label: "補助金を探す", href: "/subsidy" },
          { label: def?.labelJa ?? category, href: `/subsidy/${category}` },
          { label: article.frontmatter.title, href: article.href },
        ]}
      />
    </>
  );
}
