import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  articleFrontmatterSchema,
  type ArticleFrontmatter,
} from "@/lib/content-schema";

/**
 * content/ 配下の MDX を読み込み、frontmatter を zod で検証して返す。
 * 検証エラーは throw してビルドを失敗させる（品質ゲート — docs/02 原則3）。
 *
 * 表示ルール:
 *   - production ビルド: status === "published" のみ
 *   - 開発サーバ / SHOW_DRAFTS=1: draft・review も表示（archived は常に非表示）
 */

export type Section = "news" | "guide" | "practice" | "exam";

export interface Article {
  frontmatter: ArticleFrontmatter;
  /** MDX 本文（frontmatter を除いた生テキスト） */
  body: string;
  section: Section;
  /** guide / practice のカテゴリディレクトリ名。news / exam は null */
  category: string | null;
  href: string;
  filePath: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const SECTIONS: Section[] = ["news", "guide", "practice", "exam"];

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
  const category = rel.length >= 3 ? rel[1] : null;

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
    throw new Error(
      `${filePath}: slug「${fm.slug}」とファイル名「${fileSlug}」が一致しません`
    );
  }
  if ((section === "guide" || section === "practice") && category && fm.category !== category) {
    throw new Error(
      `${filePath}: category「${fm.category}」とディレクトリ「${category}」が一致しません`
    );
  }

  const href =
    category !== null
      ? `/${section}/${category}/${fm.slug}`
      : `/${section}/${fm.slug}`;

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
    .sort((a, b) =>
      b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt)
    );
  cache = all;
  return all;
}

export function getArticlesBySection(section: Section, category?: string): Article[] {
  return getAllArticles().filter(
    (a) => a.section === section && (category === undefined || a.category === category)
  );
}

export function getArticle(
  section: Section,
  slug: string,
  category?: string
): Article | undefined {
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
