import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { Article } from "@/lib/content";

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, siteConfig.url).toString();
}

/** 記事ページの generateMetadata 用ヘルパ */
export function articleMetadata(article: Article): Metadata {
  const { frontmatter: fm } = article;
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
      ...(fm.ogImage ? { images: [{ url: absoluteUrl(fm.ogImage) }] } : {}),
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
    ...(fm.ogImage ? { image: [absoluteUrl(fm.ogImage)] } : {}),
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
