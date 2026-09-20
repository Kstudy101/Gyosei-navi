import { getArticlesBySectionAndLocale, type Section } from "@/lib/content";
import { LOCALES, type Locale } from "@/i18n/locales";

/**
 * slug → 翻訳が存在するロケール一覧、の静的インデックス。
 * ビルド時に content-i18n/ をスキャンして計算し、LocaleSwitcher（クライアント）に
 * そのまま import させる軽量マップ（section・category・slug 単位）。
 */
export type TranslationIndex = Record<string, Locale[]>;

const TRANSLATED_SECTIONS: Section[] = ["subsidy", "compare"];

function indexKey(section: Section, slug: string, category: string | null): string {
  return category ? `${section}/${category}/${slug}` : `${section}/${slug}`;
}

let cache: TranslationIndex | null = null;

export function buildTranslationIndex(): TranslationIndex {
  if (cache) return cache;
  const index: TranslationIndex = {};
  for (const locale of LOCALES) {
    for (const section of TRANSLATED_SECTIONS) {
      for (const a of getArticlesBySectionAndLocale(locale, section)) {
        const key = indexKey(section, a.frontmatter.slug, a.category);
        (index[key] ??= []).push(locale);
      }
    }
  }
  cache = index;
  return index;
}

export function localesForKey(section: Section, slug: string, category: string | null): Locale[] {
  return buildTranslationIndex()[indexKey(section, slug, category)] ?? [];
}
