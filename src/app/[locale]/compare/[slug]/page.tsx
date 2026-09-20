import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getArticlesBySectionAndLocale,
  getTranslatedArticle,
  getAvailableLocalesFor,
} from "@/lib/content";
import { translatedArticleMetadata } from "@/lib/seo";
import { LOCALES, isLocale, type Locale } from "@/i18n/locales";
import { dictionaries } from "@/i18n/dictionaries";
import { TranslatedArticleView } from "@/components/article/TranslatedArticleView";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    getArticlesBySectionAndLocale(locale, "compare").map((a) => ({
      locale,
      slug: a.frontmatter.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = getTranslatedArticle(locale, "compare", slug);
  if (!article) return {};
  const availableLocales = getAvailableLocalesFor("compare", slug);
  return translatedArticleMetadata(article, availableLocales);
}

export default async function LocaleCompareArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = getTranslatedArticle(locale as Locale, "compare", slug);
  if (!article) notFound();
  const dict = dictionaries[locale as Locale];

  return (
    <TranslatedArticleView
      article={article}
      viewOriginalLabel={dict.common.viewOriginal}
      crumbs={[
        { label: dict.common.home, href: `/${locale}` },
        { label: dict.sections.compare, href: `/${locale}/compare` },
        { label: article.frontmatter.title, href: article.href },
      ]}
    />
  );
}
