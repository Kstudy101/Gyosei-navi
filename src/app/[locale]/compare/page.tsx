import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticlesBySectionAndLocale } from "@/lib/content";
import { LOCALES, isLocale, type Locale } from "@/i18n/locales";
import { dictionaries } from "@/i18n/dictionaries";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: dictionaries[locale].sections.compare };
}

export default async function LocaleCompareIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale as Locale];
  const articles = getArticlesBySectionAndLocale(locale as Locale, "compare");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">{dict.sections.compare}</h1>
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
