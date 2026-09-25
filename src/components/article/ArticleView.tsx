import { getAllArticles, type Article } from "@/lib/content";
import { getRelatedArticles } from "@/lib/related";
import { renderMdx } from "@/lib/mdx";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { TYPE_TAGS, SUBSIDY_STATUSES, getCategory } from "@/config/taxonomy";
import { buildMdxComponents } from "@/components/article/mdx-components";
import { Breadcrumb, type Crumb } from "@/components/layout/Breadcrumb";
import { Disclaimer } from "@/components/article/Disclaimer";
import { FaqList } from "@/components/article/FaqList";
import { SourceLinkList } from "@/components/article/SourceLinkList";
import { SubsidyInfoCard } from "@/components/article/SubsidyInfoCard";
import { UpdateLog } from "@/components/article/UpdateLog";
import { ArticleCard } from "@/components/article/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { RakutenRelatedProducts } from "@/components/ads/RakutenRelatedProducts";
import { RakutenMotionWidget } from "@/components/ads/RakutenMotionWidget";
import { ValueCommerceAdvertisers } from "@/components/ads/ValueCommerceAdvertisers";

/** 本文に該当コンポーネントが手書きされているか（重複自動挿入の防止） */
function bodyHas(body: string, name: string): boolean {
  return new RegExp(`<${name}[\\s/>]`).test(body);
}

export async function ArticleView({ article, crumbs }: { article: Article; crumbs: Crumb[] }) {
  const fm = article.frontmatter;
  const category = fm.category ? getCategory(fm.category) : undefined;
  const related = getRelatedArticles(article, getAllArticles());
  const body = await renderMdx(article.body, buildMdxComponents(fm));
  const statusDef = fm.subsidy ? SUBSIDY_STATUSES[fm.subsidy.status] : null;

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-8" data-pagefind-body>
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {fm.faq.length > 0 && <JsonLd data={faqJsonLd(fm.faq)} />}

      <Breadcrumb items={crumbs} />

      {fm.status !== "published" && (
        <div className="mt-4 rounded-md border-2 border-dashed border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300">
          ★ 미공개 초안 (status: {fm.status}) — 원문 대조 검수(docs/04 R7) 후
          frontmatter의 status를 published로 변경해야 공개됩니다.
        </div>
      )}

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-100">
            {TYPE_TAGS[fm.type]}
          </span>
          {category && <span className="text-gray-500 dark:text-gray-400">{category.labelJa}</span>}
          {statusDef && (
            <span className="rounded border border-gray-300 px-1.5 py-0.5 font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
              {statusDef.label}
            </span>
          )}
          {fm.updatedAt !== fm.publishedAt && (
            <span className="rounded border border-emerald-500 px-1.5 py-0.5 font-bold text-emerald-700 dark:border-emerald-600 dark:text-emerald-300">
              最新情報に更新済み（{fm.updatedAt}）
            </span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl dark:text-gray-100">{fm.title}</h1>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <time dateTime={fm.publishedAt}>公開: {fm.publishedAt}</time>
          <span className="mx-2">|</span>
          <time
            dateTime={fm.updatedAt}
            className={fm.updatedAt !== fm.publishedAt ? "font-semibold text-emerald-700 dark:text-emerald-300" : undefined}
          >
            最終更新: {fm.updatedAt}
          </time>
        </p>
      </header>

      {fm.subsidy && !bodyHas(article.body, "SubsidyInfoCard") && (
        <SubsidyInfoCard subsidy={fm.subsidy} />
      )}

      <div className="article-body mt-8">{body}</div>

      {fm.category && !bodyHas(article.body, "RakutenRelatedProducts") && (
        <RakutenRelatedProducts category={fm.category} articleId={fm.slug} />
      )}

      {/* 本文に無い場合の自動挿入（docs/03 §5 の固定構造を保証） */}
      {fm.faq.length > 0 && !bodyHas(article.body, "FAQ") && (
        <section>
          <h2 className="mt-10 border-b border-gray-200 pb-2 text-xl font-bold dark:border-gray-800">よくある質問</h2>
          <FaqList items={fm.faq} />
        </section>
      )}
      {!bodyHas(article.body, "SourceLinkList") && <SourceLinkList items={fm.sourceLinks} />}
      {fm.changelog.length > 0 && !bodyHas(article.body, "UpdateLog") && (
        <UpdateLog changelog={fm.changelog} />
      )}
      {!bodyHas(article.body, "Disclaimer") && <Disclaimer />}

      {related.length > 0 && (
        <section className="mt-12" data-pagefind-ignore>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">関連記事</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <ArticleCard key={r.frontmatter.slug} article={r} />
            ))}
          </div>
        </section>
      )}

      {fm.status === "published" && <ValueCommerceAdvertisers article={article} />}

      {!bodyHas(article.body, "RakutenMotionWidget") && (
        <RakutenMotionWidget placement="article-bottom" />
      )}
    </div>
  );
}
