import type { TranslatedArticle } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import { faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { TYPE_TAGS, getCategory } from "@/config/taxonomy";
import { buildMdxComponents } from "@/components/article/mdx-components";
import { Breadcrumb, type Crumb } from "@/components/layout/Breadcrumb";
import { Disclaimer } from "@/components/article/Disclaimer";
import { FaqList } from "@/components/article/FaqList";
import { SourceLinkList } from "@/components/article/SourceLinkList";
import { SubsidyInfoCard } from "@/components/article/SubsidyInfoCard";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * 翻訳記事（content-i18n/）専用ビュー。ArticleView（日本語原文用）とほぼ同じ構造だが、
 * getAllArticles()（原文専用インデックス）に依存する関連記事セクション・楽天広告挿入は行わない
 * — このスコープでは翻訳ページへの広告連動は対象外（AGENTS.md 絶対規則10は subsidy 原文が対象）。
 */
function bodyHas(body: string, name: string): boolean {
  return new RegExp(`<${name}[\\s/>]`).test(body);
}

export async function TranslatedArticleView({
  article,
  crumbs,
  viewOriginalLabel,
}: {
  article: TranslatedArticle;
  crumbs: Crumb[];
  viewOriginalLabel: string;
}) {
  const fm = article.frontmatter;
  const category = fm.category ? getCategory(fm.category) : undefined;
  const body = await renderMdx(article.body, buildMdxComponents(fm));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {fm.faq.length > 0 && <JsonLd data={faqJsonLd(fm.faq)} />}

      <Breadcrumb items={crumbs} />

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700">
            {TYPE_TAGS[fm.type]}
          </span>
          {category && <span className="text-gray-500">{category.labelJa}</span>}
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">{fm.title}</h1>
        <p className="mt-3 text-xs text-gray-500">
          <time dateTime={fm.publishedAt}>{fm.publishedAt}</time>
          <span className="mx-2">|</span>
          <time dateTime={fm.updatedAt}>{fm.updatedAt}</time>
          <span className="mx-2">|</span>
          <a href={article.originalHref} className="text-brand-600 underline-offset-2 hover:underline">
            {viewOriginalLabel}
          </a>
        </p>
      </header>

      {fm.subsidy && !bodyHas(article.body, "SubsidyInfoCard") && (
        <SubsidyInfoCard subsidy={fm.subsidy} />
      )}

      <div className="article-body mt-8">{body}</div>

      {fm.faq.length > 0 && !bodyHas(article.body, "FAQ") && (
        <section>
          <h2 className="mt-10 border-b border-gray-200 pb-2 text-xl font-bold">FAQ</h2>
          <FaqList items={fm.faq} />
        </section>
      )}
      {!bodyHas(article.body, "SourceLinkList") && <SourceLinkList items={fm.sourceLinks} />}
      {!bodyHas(article.body, "Disclaimer") && <Disclaimer />}
    </div>
  );
}
