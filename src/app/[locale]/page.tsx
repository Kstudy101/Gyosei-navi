import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/locales";
import { dictionaries } from "@/i18n/dictionaries";
import { siteConfig } from "@/config/site";

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: siteConfig.name };
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = dictionaries[locale as Locale];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">{siteConfig.name}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <a
          href={`/${locale}/subsidy`}
          className="rounded-lg border border-gray-200 p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-lg font-bold text-gray-900">{dict.sections.subsidy}</p>
        </a>
        <a
          href={`/${locale}/compare`}
          className="rounded-lg border border-gray-200 p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-lg font-bold text-gray-900">{dict.sections.compare}</p>
        </a>
      </div>
    </div>
  );
}
