import { getAllArticles, type Article } from "@/lib/content";
import { getRelatedArticles } from "@/lib/related";
import { renderMdx } from "@/lib/mdx";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { TYPE_TAGS, getCategory } from "@/config/taxonomy";
import { buildMdxComponents } from "@/components/article/mdx-components";
import { Breadcrumb, type Crumb } from "@/components/layout/Breadcrumb";
import { NoticeBanner } from "@/components/article/NoticeBanner";
import { Disclaimer } from "@/components/article/Disclaimer";
import { FaqList } from "@/components/article/FaqList";
import { LegalBasisList } from "@/components/article/LegalBasisList";
import { UpdateLog } from "@/components/article/UpdateLog";
import { ArticleCard } from "@/components/article/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdRail } from "@/components/ads/AdRail";
import { AdCard } from "@/components/ads/AdCard";
import { getAdSlot } from "@/config/ads";

/** 本文に該当コンポーネントが手書きされているか（重複自動挿入の防止） */
function bodyHas(body: string, name: string): boolean {
  return new RegExp(`<${name}[\\s/>]`).test(body);
}

export async function ArticleView({
  article,
  crumbs,
}: {
  article: Article;
  crumbs: Crumb[];
}) {
  const fm = article.frontmatter;
  const category = getCategory(fm.category);
  const related = getRelatedArticles(article, getAllArticles());
  const body = await renderMdx(article.body, buildMdxComponents(fm));
  const railLeft = getAdSlot("rail-left");
  const railRight = getAdSlot("rail-right");
  const bottomAd = getAdSlot("article-bottom");

  return (
    // xl 以上: 両脇に広告レールを持つ 3 カラム。xl 未満は従来どおり単一カラム
    //（本文カラムは max-w-3xl のまま — 既存記事のレイアウトを変えない）
    <div className="mx-auto max-w-6xl px-4 py-8 xl:grid xl:grid-cols-[11rem_minmax(0,1fr)_11rem] xl:gap-6">
      <aside className="hidden xl:block" aria-label="広告">
        {railLeft && <AdRail slot={railLeft} />}
      </aside>

      {/* data-pagefind-body: 検索インデックスは記事ページのこの範囲のみ（広告・関連記事は除外） */}
      <div className="mx-auto w-full max-w-3xl" data-pagefind-body>
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {fm.faq.length > 0 && <JsonLd data={faqJsonLd(fm.faq)} />}

      <Breadcrumb items={crumbs} />

      {/* 개발 환경 전용: 미공개 초안 알림 (한국어 = 내부용) */}
      {fm.status !== "published" && (
        <div className="mt-4 rounded-md border-2 border-dashed border-red-400 bg-red-50 p-3 text-sm text-red-800">
          ★ 미공개 초안 (status: {fm.status}) — 一次情報 원문 대조 검수(docs/04 R7) 후
          frontmatter의 status를 published로 변경해야 공개됩니다.
        </div>
      )}

      <NoticeBanner level={fm.noticeLevel} />

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700">
            {TYPE_TAGS[fm.type]}
          </span>
          {category && <span className="text-gray-500">{category.labelJa}</span>}
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
          {fm.title}
        </h1>
        <p className="mt-3 text-xs text-gray-500">
          <time dateTime={fm.publishedAt}>公開: {fm.publishedAt}</time>
          <span className="mx-2">|</span>
          <time dateTime={fm.updatedAt}>最終更新: {fm.updatedAt}</time>
          <span className="mx-2">|</span>
          執筆: 編集部
        </p>
      </header>

      <div className="article-body mt-8">{body}</div>

      {/* 本文に無い場合の自動挿入（docs/03 §5 の固定構造を保証） */}
      {fm.faq.length > 0 && !bodyHas(article.body, "FAQ") && (
        <section>
          <h2 className="mt-10 border-b border-gray-200 pb-2 text-xl font-bold">
            よくある質問
          </h2>
          <FaqList items={fm.faq} />
        </section>
      )}
      {!bodyHas(article.body, "LegalBasisList") && (
        <LegalBasisList items={fm.legalBasis} />
      )}
      {fm.changelog.length > 0 && !bodyHas(article.body, "UpdateLog") && (
        <UpdateLog changelog={fm.changelog} />
      )}
      {!bodyHas(article.body, "Disclaimer") && <Disclaimer />}

      {/* デスクトップのレールが見えない幅の代替広告枠 */}
      {bottomAd && (
        <div className="mt-10 xl:hidden" data-pagefind-ignore>
          <AdCard slot={bottomAd} />
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-12" data-pagefind-ignore>
          <h2 className="text-lg font-bold text-gray-900">関連記事</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <ArticleCard key={r.frontmatter.slug} article={r} />
            ))}
          </div>
        </section>
      )}
      </div>

      <aside className="hidden xl:block" aria-label="広告">
        {railRight && <AdRail slot={railRight} />}
      </aside>
    </div>
  );
}
