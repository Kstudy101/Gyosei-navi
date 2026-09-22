import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCategory } from "@/config/taxonomy";
import {
  getArticle,
  getArticlesBySection,
  getTagsWithArchivePage,
  orPlaceholder,
  EXPORT_PLACEHOLDER,
} from "@/lib/content";
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
  // タグアーカイブ（/tag/[tag]、記事2件以上のみ生成）が存在するタグだけリンクを出す
  const archiveTags = getTagsWithArchivePage();
  const linkableTags = article.frontmatter.tags.filter((t) => archiveTags.includes(t));

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
      {linkableTags.length > 0 && (
        <div className="mx-auto max-w-3xl px-4 pb-10">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">タグ:</span>
            {linkableTags.map((t) => (
              <Link
                key={t}
                href={`/tag/${t}`}
                className="rounded-md border border-gray-200 px-2.5 py-1 text-gray-700 hover:border-brand-300 hover:bg-brand-50 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:bg-brand-900/30"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
