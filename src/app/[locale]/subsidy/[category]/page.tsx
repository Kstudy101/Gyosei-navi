import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORY_CODES, getCategory } from "@/config/taxonomy";
import { getArticlesBySectionAndLocale } from "@/lib/content";
import { LOCALES, isLocale, type Locale } from "@/i18n/locales";
import { dictionaries } from "@/i18n/dictionaries";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => CATEGORY_CODES.map((category) => ({ locale, category })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isLocale(locale)) return {};
  const dict = dictionaries[locale];
  const key = category as keyof typeof dict.categories;
  return dict.categories[key] ? { title: dict.categories[key] } : {};
}

export default async function LocaleSubsidyCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  if (!isLocale(locale)) notFound();
  const def = getCategory(category);
  if (!def) notFound();
  const dict = dictionaries[locale as Locale];
  const categoryLabel = dict.categories[category as keyof typeof dict.categories] ?? def.labelShort;

  const articles = getArticlesBySectionAndLocale(locale as Locale, "subsidy", category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: dict.common.home, href: `/${locale}` },
          { label: dict.sections.subsidy, href: `/${locale}/subsidy` },
          { label: categoryLabel, href: `/${locale}/subsidy/${category}` },
        ]}
      />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">{categoryLabel}</h1>
      {articles.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
            >
              <p className="font-semibold text-gray-900">{a.frontmatter.title}</p>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-500">-</p>
      )}
    </div>
  );
}
