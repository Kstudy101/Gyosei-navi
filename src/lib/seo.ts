import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { Article, TranslatedArticle } from "@/lib/content";
import type { Locale } from "@/i18n/locales";

/**
 * 絶対URL。next.config の trailingSlash: true に合わせ、ファイル（.xml 等）以外は末尾スラッシュを付ける
 * （canonical / sitemap / JSON-LD の URL を実際に配信される URL と一致させる）。
 */
export function absoluteUrl(pathname: string): string {
  const url = new URL(pathname, siteConfig.url);
  const last = url.pathname.split("/").pop() ?? "";
  if (!url.pathname.endsWith("/") && !last.includes(".")) url.pathname += "/";
  return url.toString();
}

/**
 * hreflang（alternates.languages）マップを組み立てる。
 * 日本語原文 + 翻訳が存在する言語を全て相互参照させる（hreflang の原則）。
 * x-default は日本語原文を指す。
 */
function buildLanguageAlternates(originalHref: string, availableLocales: readonly Locale[]) {
  const languages: Record<string, string> = { ja: absoluteUrl(originalHref) };
  for (const l of availableLocales) {
    languages[l] = absoluteUrl(`/${l}${originalHref}`);
  }
  languages["x-default"] = absoluteUrl(originalHref);
  return languages;
}

/**
 * OG画像パス。frontmatter.ogImage が空なら scripts/generate-og-images.ts が
 * ビルド前に生成する自動画像（/og/auto/<section>/<slug>.png）へフォールバックする。
 */
export function ogImagePath(section: string, slug: string, ogImage: string | undefined): string {
  return ogImage || `/og/auto/${section}/${slug}.png`;
}

/** compare 記事の情報画像（generate-og-images.ts が 16:9 / 4:3 / 1:1 で出力）。Article 構造化データ推奨の3比率 */
export function compareInfoImagePaths(slug: string): string[] {
  return ["-16x9", "-4x3", "-1x1"].map((s) => `/og/auto/compare/${slug}${s}.png`);
}

/** 記事ページの generateMetadata 用ヘルパ（日本語原文） */
export function articleMetadata(article: Article, availableLocales: readonly Locale[] = []): Metadata {
  const { frontmatter: fm } = article;
  return {
    title: fm.title,
    description: fm.description,
    alternates: {
      canonical: absoluteUrl(article.href),
      languages: buildLanguageAlternates(article.href, availableLocales),
    },
    openGraph: {
      title: fm.title,
      description: fm.description,
      url: absoluteUrl(article.href),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "article",
      publishedTime: fm.publishedAt,
      modifiedTime: fm.updatedAt,
      images: [{ url: absoluteUrl(ogImagePath(article.section, fm.slug, fm.ogImage)) }],
    },
  };
}

/** 翻訳記事ページの generateMetadata 用ヘルパ（翻訳ページは noindex のため hreflang は出さない — app/[locale]/layout.tsx） */
export function translatedArticleMetadata(article: TranslatedArticle): Metadata {
  const { frontmatter: fm } = article;
  return {
    title: fm.title,
    description: fm.description,
    alternates: {
      canonical: absoluteUrl(article.href),
    },
    openGraph: {
      title: fm.title,
      description: fm.description,
      url: absoluteUrl(article.href),
      siteName: siteConfig.name,
      locale: article.locale,
      type: "article",
      publishedTime: fm.publishedAt,
      modifiedTime: fm.updatedAt,
      // 翻訳ページは日本語原文と同じ自動生成OG画像を使う
      images: [{ url: absoluteUrl(ogImagePath(article.section, fm.slug, fm.ogImage)) }],
    },
  };
}

export function pageMetadata(opts: { title: string; description: string; path: string }): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: absoluteUrl(opts.path) },
  };
}

/* ---------------- JSON-LD ビルダー（GEO/LLMO 対応の中核） ---------------- */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "ja",
  };
}

export function articleJsonLd(article: Article) {
  const { frontmatter: fm } = article;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.description,
    inLanguage: "ja",
    datePublished: fm.publishedAt,
    dateModified: fm.updatedAt,
    mainEntityOfPage: absoluteUrl(article.href),
    author: { "@type": "Organization", name: `${siteConfig.name} 編集部` },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    image:
      article.section === "compare" && !fm.ogImage && fm.compareTargets?.length
        ? compareInfoImagePaths(fm.slug).map(absoluteUrl)
        : [absoluteUrl(ogImagePath(article.section, fm.slug, fm.ogImage))],
  };
}

export function faqJsonLd(faq: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

/** 補助金レコード（subsidy フィールド）を Offer として機械可読にする。GEO対応 */
export function subsidyJsonLd(article: Article) {
  const { frontmatter: fm } = article;
  if (!fm.subsidy) return null;
  return {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    name: fm.title,
    description: fm.description,
    areaServed: fm.subsidy.regionLabel,
    provider: { "@type": "GovernmentOrganization", name: fm.subsidy.regionLabel },
    url: fm.subsidy.applyUrl,
  };
}

/**
 * MonetaryGrant（助成金）構造化データ。GEO/LLMO 対応の補強。
 * amount 文字列から「上限/最大 N万円」を抽出できた場合のみ金額を機械可読にする
 * （「機器費÷4」のような計算式は無理にパースしない）。
 */
export function monetaryGrantJsonLd(article: Article) {
  const { frontmatter: fm } = article;
  if (!fm.subsidy) return null;
  const m = fm.subsidy.amount?.match(/(?:上限|最大)([\d,]+(?:\.\d+)?)万円/);
  const maxYen = m ? Math.round(parseFloat(m[1].replace(/,/g, "")) * 10000) : null;
  return {
    "@context": "https://schema.org",
    "@type": "MonetaryGrant",
    name: fm.title,
    description: fm.description,
    url: absoluteUrl(article.href),
    funder: { "@type": "GovernmentOrganization", name: fm.subsidy.regionLabel },
    ...(maxYen ? { amount: { "@type": "MonetaryAmount", currency: "JPY", maxValue: maxYen } } : {}),
  };
}
