import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/locales";

export const dynamicParams = false;

/**
 * 翻訳ページは検索から退場させる（2026-09-26）。新規翻訳は停止済みで GSC 上の表示回数も 0 だったため、
 * クロール予算を日本語記事に集中させる。ページ自体は残す（ブラウザ翻訳の代替として直接アクセスは可）。
 */
export const metadata: Metadata = { robots: { index: false, follow: true } };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <div lang={locale}>{children}</div>;
}
