import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATEGORY_CODES, TOKUSHU_CATEGORY_CODES } from "@/config/taxonomy";
import {
  articleFrontmatterSchema,
  translatedArticleFrontmatterSchema,
  type ArticleFrontmatter,
  type TranslatedArticleFrontmatter,
} from "@/lib/content-schema";
import { LOCALES, type Locale } from "@/i18n/locales";

/**
 * content/ 配下の MDX を読み込み、frontmatter を zod で検証して返す v2。
 * 検証エラーは throw してビルドを失敗させる（品質ゲート — docs/02 原則3）。
 *
 * v1 との違い: セクション構成が subsidy/compare/tokushu/news の4種になった
 * （guide/practice/exam は廃止 — docs/01_IA_TAXONOMY.md v2）。
 * subsidy・tokushu は category 必須（別々のコード体系）、compare/news は category を持たない。
 *
 * 表示ルール:
 *   - production ビルド: status === "published" のみ
 *   - 開発サーバ / SHOW_DRAFTS=1: draft・review も表示（archived は常に非表示）
 */

export type Section = "subsidy" | "compare" | "tokushu" | "news";

export interface Article {
  frontmatter: ArticleFrontmatter;
  /** MDX 本文（frontmatter を除いた生テキスト） */
  body: string;
  section: Section;
  /** subsidy/tokushu のカテゴリディレクトリ名。compare / news は null */
  category: string | null;
  href: string;
  filePath: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const SECTIONS: Section[] = ["subsidy", "compare", "tokushu", "news"];
/** セクションごとのカテゴリコード一覧（別体系 — docs/01 §7.2） */
const CATEGORY_CODES_BY_SECTION: Partial<Record<Section, readonly string[]>> = {
  subsidy: CATEGORY_CODES,
  tokushu: TOKUSHU_CATEGORY_CODES,
};

function walkMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMdxFiles(full));
    } else if (entry.name.endsWith(".mdx") && !entry.name.startsWith("_")) {
      out.push(full);
    }
  }
  return out;
}

function parseArticle(filePath: string): Article {
  const rel = path.relative(CONTENT_DIR, filePath).split(path.sep);
  const section = rel[0] as Section;
  if (!SECTIONS.includes(section)) {
    throw new Error(`content/${rel.join("/")}: 不明なセクション「${rel[0]}」`);
  }
  const hasCategory = section === "subsidy" || section === "tokushu";
  const category = hasCategory && rel.length >= 3 ? rel[1] : null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const parsed = articleFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`frontmatter 検証エラー: ${filePath}\n${issues}`);
  }
  const fm = parsed.data;

  const fileSlug = path.basename(filePath, ".mdx");
  if (fm.slug !== fileSlug) {
    throw new Error(`${filePath}: slug「${fm.slug}」とファイル名「${fileSlug}」が一致しません`);
  }
  if (hasCategory) {
    const validCodes = CATEGORY_CODES_BY_SECTION[section] ?? [];
    if (!category || !validCodes.includes(fm.category)) {
      throw new Error(
        `${filePath}: category「${fm.category}」が taxonomy.ts の ${section === "subsidy" ? "CATEGORY_CODES" : "TOKUSHU_CATEGORY_CODES"} にありません`
      );
    }
    if (fm.category !== category) {
      throw new Error(`${filePath}: category「${fm.category}」とディレクトリ「${category}」が一致しません`);
    }
  }

  const href = category !== null ? `/${section}/${category}/${fm.slug}` : `/${section}/${fm.slug}`;

  return { frontmatter: fm, body: content, section, category, href, filePath };
}

function showHidden(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "1";
}

let cache: Article[] | null = null;

/** 全記事（表示ルール適用済み・publishedAt 降順） */
export function getAllArticles(): Article[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const all = SECTIONS.flatMap((section) => walkMdxFiles(path.join(CONTENT_DIR, section)))
    .map(parseArticle)
    .filter((a) => {
      if (a.frontmatter.status === "archived") return false;
      if (a.frontmatter.status === "published") return true;
      return showHidden();
    })
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt));
  cache = all;
  return all;
}

export function getArticlesBySection(section: Section, category?: string): Article[] {
  return getAllArticles().filter(
    (a) => a.section === section && (category === undefined || a.category === category)
  );
}

export function getArticle(section: Section, slug: string, category?: string): Article | undefined {
  return getAllArticles().find(
    (a) =>
      a.section === section &&
      a.frontmatter.slug === slug &&
      (category === undefined || a.category === category)
  );
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.frontmatter.slug === slug);
}

export function getLatestArticles(n: number): Article[] {
  return getAllArticles().slice(0, n);
}

/** 新着タブ用。subsidy記事のみを publishedAt 降順で返す（比較・特集記事は含めない） */
export function getNewestSubsidyArticles(n: number): Article[] {
  return getArticlesBySection("subsidy").slice(0, n);
}

/**
 * 締切間近タブ用。subsidy.status が "open" かつ periodEnd が今日から
 * withinDays 日以内（経過済みは除く）の記事を、締切が近い順に返す。
 */
export function getUpcomingDeadlineArticles(withinDays: number): Article[] {
  const today = new Date().toISOString().slice(0, 10);
  const limit = new Date();
  limit.setDate(limit.getDate() + withinDays);
  const limitStr = limit.toISOString().slice(0, 10);

  return getArticlesBySection("subsidy")
    .filter((a) => {
      const s = a.frontmatter.subsidy;
      if (!s || s.status !== "open" || !s.periodEnd) return false;
      return s.periodEnd >= today && s.periodEnd <= limitStr;
    })
    .sort((a, b) => a.frontmatter.subsidy!.periodEnd!.localeCompare(b.frontmatter.subsidy!.periodEnd!));
}

/**
 * 指定した都道府県コード配下の記事（国レベル共通制度は除く）。
 * regionCode の先頭2桁が都道府県コードと一致するものを拾う
 * （総務省 全国地方公共団体コードは都道府県2桁+市区町村3桁の構成）。
 */
export function getArticlesByPrefecture(prefCode: string): Article[] {
  return getAllArticles().filter((a) => a.frontmatter.subsidy?.regionCode.startsWith(prefCode));
}

export function getArticlesByRegionCode(regionCode: string): Article[] {
  return getAllArticles().filter((a) => a.frontmatter.subsidy?.regionCode === regionCode);
}

/** 市区町村×カテゴリのハブページ（/area/{pref}/{city}/{category}）用 */
export function getArticlesByRegionAndCategory(regionCode: string, category: string): Article[] {
  return getArticlesByRegionCode(regionCode).filter(
    (a) => a.section === "subsidy" && a.category === category
  );
}

/**
 * output: "export" では generateStaticParams が空配列だと
 * 「missing generateStaticParams」扱いでビルドが落ちる（記事0件のセクションで発生）。
 * 空のときはプレースホルダを1件返し、ページ側は notFound() で 404 を生成させる。
 */
export const EXPORT_PLACEHOLDER = "_";

export function orPlaceholder<T extends Record<string, string>>(params: T[], placeholder: T): T[] {
  return params.length > 0 ? params : [placeholder];
}

/* ------------------------------------------------------------------ */
/* 翻訳記事（content-i18n/{locale}/...）ローダー                        */
/* 原文の Article 型・getAllArticles() 等は一切変更しない。               */
/* ------------------------------------------------------------------ */

const CONTENT_I18N_DIR = path.join(process.cwd(), "content-i18n");
/** 翻訳対象セクション。area/news/tokushu はこのスコープでは翻訳コンテンツを持たない */
const TRANSLATED_SECTIONS: Section[] = ["subsidy", "compare"];

export interface TranslatedArticle {
  frontmatter: TranslatedArticleFrontmatter;
  body: string;
  section: Section;
  category: string | null;
  locale: Locale;
  /** 翻訳ページの href（/{locale}/{section}/{category?}/{slug}） */
  href: string;
  /** 対応する原文（日本語）記事の href */
  originalHref: string;
  filePath: string;
}

function parseTranslatedArticle(filePath: string, locale: Locale): TranslatedArticle {
  const localeDir = path.join(CONTENT_I18N_DIR, locale);
  const rel = path.relative(localeDir, filePath).split(path.sep);
  const section = rel[0] as Section;
  if (!TRANSLATED_SECTIONS.includes(section)) {
    throw new Error(`content-i18n/${locale}/${rel.join("/")}: 不明なセクション「${rel[0]}」`);
  }
  const hasCategory = section === "subsidy";
  const category = hasCategory && rel.length >= 3 ? rel[1] : null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const parsed = translatedArticleFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`frontmatter 検証エラー: ${filePath}\n${issues}`);
  }
  const fm = parsed.data;

  if (fm.locale !== locale) {
    throw new Error(`${filePath}: locale「${fm.locale}」とディレクトリ「${locale}」が一致しません`);
  }

  const fileSlug = path.basename(filePath, ".mdx");
  if (fm.slug !== fileSlug) {
    throw new Error(`${filePath}: slug「${fm.slug}」とファイル名「${fileSlug}」が一致しません`);
  }
  if (hasCategory) {
    const validCodes = CATEGORY_CODES_BY_SECTION[section] ?? [];
    if (!category || !validCodes.includes(fm.category)) {
      throw new Error(`${filePath}: category「${fm.category}」が taxonomy.ts の CATEGORY_CODES にありません`);
    }
    if (fm.category !== category) {
      throw new Error(`${filePath}: category「${fm.category}」とディレクトリ「${category}」が一致しません`);
    }
  }

  const tail = category !== null ? `${section}/${category}/${fm.slug}` : `${section}/${fm.slug}`;
  const href = `/${locale}/${tail}`;
  const originalHref = `/${tail}`;

  return { frontmatter: fm, body: content, section, category, locale, href, originalHref, filePath };
}

let translatedCache: Map<Locale, TranslatedArticle[]> | null = null;

function getAllTranslatedArticlesForLocale(locale: Locale): TranslatedArticle[] {
  if (translatedCache?.has(locale) && process.env.NODE_ENV === "production") {
    return translatedCache.get(locale)!;
  }
  const localeDir = path.join(CONTENT_I18N_DIR, locale);
  const all = walkMdxFiles(localeDir)
    .map((f) => parseTranslatedArticle(f, locale))
    .filter((a) => {
      if (a.frontmatter.status === "archived") return false;
      if (a.frontmatter.status === "published") return true;
      return showHidden();
    })
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt));
  if (!translatedCache) translatedCache = new Map();
  translatedCache.set(locale, all);
  return all;
}

export function getArticlesBySectionAndLocale(
  locale: Locale,
  section: Section,
  category?: string
): TranslatedArticle[] {
  return getAllTranslatedArticlesForLocale(locale).filter(
    (a) => a.section === section && (category === undefined || a.category === category)
  );
}

export function getTranslatedArticle(
  locale: Locale,
  section: Section,
  slug: string,
  category?: string
): TranslatedArticle | undefined {
  return getAllTranslatedArticlesForLocale(locale).find(
    (a) =>
      a.section === section &&
      a.frontmatter.slug === slug &&
      (category === undefined || a.category === category)
  );
}

/**
 * 全ロケール横断で、指定 section/slug（/category）の翻訳が存在するロケール一覧。
 * hreflang・LocaleSwitcher で使う。
 */
export function getAvailableLocalesFor(section: Section, slug: string, category?: string): Locale[] {
  return LOCALES.filter((l) => getTranslatedArticle(l, section, slug, category) !== undefined);
}
