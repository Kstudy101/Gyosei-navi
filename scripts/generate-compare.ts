/**
 * 自動 compare 記事の生成・更新（カテゴリごとに固定 slug `{category}-hikaku` を1本だけ持つ）。
 *
 * published subsidy 記事のデータを再構成するだけで AI は呼ばない（AGENTS.md 絶対規則9の例外対象）。
 * 対象記事の集合や金額・締切が変わったときだけファイルを書き換える（scripts/lib/auto-articles.ts）。
 *
 * 使用: npm run generate:compare
 */
import path from "node:path";
import { CATEGORIES } from "../src/config/taxonomy";
import { buildCompare, loadPublishedSubsidyRows, syncAutoArticle } from "./lib/auto-articles";

const CONTENT_DIR = path.join(process.cwd(), "content");
const today = new Date().toISOString().slice(0, 10);
const rowsByCategory = loadPublishedSubsidyRows(CONTENT_DIR);

for (const category of CATEGORIES) {
  const next = buildCompare(category, rowsByCategory.get(category.code) ?? [], today);
  if (!next) {
    console.log(`skip: ${category.code}（published記事が5件未満）`);
    continue;
  }
  const target = path.join(CONTENT_DIR, "compare", `${next.frontmatter.slug}.mdx`);
  console.log(`${syncAutoArticle(target, next, today)}: ${path.relative(process.cwd(), target)}`);
}
