import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { rankingFrontmatterSchema, type RankingFrontmatter } from "@/lib/ranking-schema";

/**
 * content/ranking/ 専用ローダー。src/lib/content.ts の getAllArticles() とは
 * スキーマ・検証ロジックが別体系のため独立させている（ranking-schema.ts 参照）。
 */

const RANKING_DIR = path.join(process.cwd(), "content", "ranking");

export interface RankingArticle {
  frontmatter: RankingFrontmatter;
  body: string;
  href: string;
  filePath: string;
}

function showHidden(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "1";
}

function parseRankingArticle(filePath: string): RankingArticle {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const parsed = rankingFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`frontmatter 検証エラー: ${filePath}\n${issues}`);
  }
  const fm = parsed.data;

  const fileSlug = path.basename(filePath, ".mdx");
  if (fm.slug !== fileSlug) {
    throw new Error(`${filePath}: slug「${fm.slug}」とファイル名「${fileSlug}」が一致しません`);
  }

  return { frontmatter: fm, body: content, href: `/ranking/${fm.slug}`, filePath };
}

let cache: RankingArticle[] | null = null;

export function getAllRankingArticles(): RankingArticle[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  if (!fs.existsSync(RANKING_DIR)) return [];
  const all = fs
    .readdirSync(RANKING_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => parseRankingArticle(path.join(RANKING_DIR, f)))
    .filter((a) => a.frontmatter.status === "published" || showHidden())
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt));
  cache = all;
  return all;
}

export function getRankingArticle(slug: string): RankingArticle | undefined {
  return getAllRankingArticles().find((a) => a.frontmatter.slug === slug);
}
