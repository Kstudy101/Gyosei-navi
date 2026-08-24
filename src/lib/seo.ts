import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { Article } from "@/lib/content";

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
 * 記事の OG 画像。frontmatter の ogImage が無ければ scripts/generate-og.ts が
 * 生成した /og/{slug}.png にフォールバックする（ビルド時に実在確認 — 無い画像 URL を出さない）。
 */
export function resolveOgImage(fm: { ogImage?: string; slug: string }): string | undefined {
  if (fm.ogImage) return fm.ogImage;
  const generated = `/og/${fm.slug}.png`;
  return fs.existsSync(path.join(process.cwd(), "public", generated)) ? generated : undefined;
}

/** 記事ページの generateMetadata 用ヘルパ */
export function articleMetadata(article: Article): Metadata {
  const { frontmatter: fm } = article;
  const ogImage = resolveOgImage(fm);
  return {
    title: fm.title,
    description: fm.description,
    alternates: { canonical: absoluteUrl(article.href) },
    openGraph: {
      title: fm.title,
      description: fm.description,
      url: absoluteUrl(article.href),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "article",
      publishedTime: fm.publishedAt,
      modifiedTime: fm.updatedAt,
      ...(ogImage ? { images: [{ url: absoluteUrl(ogImage) }] } : {}),
    },
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
  const ogImage = resolveOgImage(fm);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.description,
    inLanguage: "ja",
    datePublished: fm.publishedAt,
    dateModified: fm.updatedAt,
    mainEntityOfPage: absoluteUrl(article.href),
    author: {
      "@type": "Organization",
      name: `${siteConfig.name} 編集部`,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    ...(ogImage ? { image: [absoluteUrl(ogImage)] } : {}),
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

/**
 * 無料診断ツール（/tools/*）用。isAccessibleForFree と「ブラウザ内処理・送信なし」の
 * 特性を機械可読にする。offers price:0 は「無料ツール」検索面での必須シグナル。
 */
export function webApplicationJsonLd(tool: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: absoluteUrl(tool.path),
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    inLanguage: siteConfig.lang,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
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
