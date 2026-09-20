import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATEGORY_CODES } from "@/config/taxonomy";
import { articleFrontmatterSchema, type ArticleFrontmatter } from "@/lib/content-schema";

/**
 * content/ 配下の MDX を読み込み、frontmatter を zod で検証して返す v2。
 * 検証エラーは throw してビルドを失敗させる（品質ゲート — docs/02 原則3）。
 *
 * v1 との違い: セクション構成が subsidy/compare/news の3種になった
 * （guide/practice/exam は廃止 — docs/01_IA_TAXONOMY.md v2）。
 * subsidy は category 必須、compare/news は category を持たない。
 *
 * 表示ルール:
 *   - production ビルド: status === "published" のみ
 *   - 開発サーバ / SHOW_DRAFTS=1: draft・review も表示（archived は常に非表示）
 */

export type Section = "subsidy" | "compare" | "news";

export interface Article {
  frontmatter: ArticleFrontmatter;
  /** MDX 本文（frontmatter を除いた生テキスト） */
  body: string;
  section: Section;
  /** subsidy のカテゴリディレクトリ名。compare / news は null */
  category: string | null;
  href: string;
  filePath: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const SECTIONS: Section[] = ["subsidy", "compare", "news"];

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
  const category = section === "subsidy" && rel.length >= 3 ? rel[1] : null;

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
  if (section === "subsidy") {
    if (!category || !CATEGORY_CODES.includes(fm.category)) {
      throw new Error(`${filePath}: category「${fm.category}」が taxonomy.ts の CATEGORY_CODES にありません`);
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
  const all = walkMdxFiles(CONTENT_DIR)
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

/**
 * output: "export" では generateStaticParams が空配列だと
 * 「missing generateStaticParams」扱いでビルドが落ちる（記事0件のセクションで発生）。
 * 空のときはプレースホルダを1件返し、ページ側は notFound() で 404 を生成させる。
 */
export const EXPORT_PLACEHOLDER = "_";

export function orPlaceholder<T extends Record<string, string>>(params: T[], placeholder: T): T[] {
  return params.length > 0 ? params : [placeholder];
}
