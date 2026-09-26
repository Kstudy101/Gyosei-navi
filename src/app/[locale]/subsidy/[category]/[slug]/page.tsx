import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory } from "@/config/taxonomy";
import { getArticlesBySectionAndLocale, getTranslatedArticle } from "@/lib/content";
import { translatedArticleMetadata } from "@/lib/seo";
import { LOCALES, isLocale, type Locale } from "@/i18n/locales";
import { dictionaries } from "@/i18n/dictionaries";
import { TranslatedArticleView } from "@/components/article/TranslatedArticleView";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    getArticlesBySectionAndLocale(locale, "subsidy").map((a) => ({
      locale,
      category: a.category!,
      slug: a.frontmatter.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, category, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = getTranslatedArticle(locale, "subsidy", slug, category);
  if (!article) return {};
  return translatedArticleMetadata(article);
}

export default async function LocaleSubsidyArticlePage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = getTranslatedArticle(locale as Locale, "subsidy", slug, category);
  if (!article) notFound();
  const def = getCategory(category);
  const dict = dictionaries[locale as Locale];
  const categoryLabel = dict.categories[category as keyof typeof dict.categories] ?? def?.labelJa ?? category;

  return (
    <TranslatedArticleView
      article={article}
      viewOriginalLabel={dict.common.viewOriginal}
      crumbs={[
        { label: dict.common.home, href: `/${locale}` },
        { label: dict.sections.subsidy, href: `/${locale}/subsidy` },
        { label: categoryLabel, href: `/${locale}/subsidy/${category}` },
        { label: article.frontmatter.title, href: article.href },
      ]}
    />
  );
}
