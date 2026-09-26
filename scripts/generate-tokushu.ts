/**
 * 自動 tokushu（特集）記事の生成・更新（カテゴリごとに固定 slug `{category}-tokushu` を1本だけ持つ）。
 *
 * published subsidy 記事の amount から「万円」上限を抽出し、金額の大きい順 TOP10 を組み立てる。
 * AI は呼ばない（AGENTS.md 絶対規則9の例外対象）。順位や金額が変わったときだけファイルを書き換える
 * （scripts/lib/auto-articles.ts）。金額を抽出できた記事が5件未満のカテゴリは skip する。
 *
 * 使用: npm run generate:tokushu
 */
import path from "node:path";
import { CATEGORIES } from "../src/config/taxonomy";
import { buildTokushu, loadPublishedSubsidyRows, syncAutoArticle } from "./lib/auto-articles";

const CONTENT_DIR = path.join(process.cwd(), "content");
const today = new Date().toISOString().slice(0, 10);
const rowsByCategory = loadPublishedSubsidyRows(CONTENT_DIR);

for (const category of CATEGORIES) {
  const next = buildTokushu(category, rowsByCategory.get(category.code) ?? [], today);
  if (!next) {
    console.log(`skip: ${category.code}（金額を抽出できたpublished記事が5件未満）`);
    continue;
  }
  const target = path.join(CONTENT_DIR, "tokushu", category.code, `${next.frontmatter.slug}.mdx`);
  console.log(`${syncAutoArticle(target, next, today)}: ${path.relative(process.cwd(), target)}`);
}
