import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES } from "@/config/taxonomy";
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
  return { title: dictionaries[locale].sections.subsidy };
}

export default async function LocaleSubsidyIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale as Locale];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">{dict.sections.subsidy}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((c) => (
          <a
            key={c.code}
            href={`/${locale}/subsidy/${c.code}`}
            className="rounded-lg border border-gray-200 p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-lg font-bold text-gray-900">
              {dict.categories[c.code as keyof typeof dict.categories]}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
