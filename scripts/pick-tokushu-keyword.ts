/**
 * DataForSEO から /tokushu 記事のタイトルに使う参考キーワードを1件選び、
 * .cache/tokushu-keyword.json に書き出す CLI。
 *   npm run tokushu:pick-keyword
 *
 * ranking-writer（新規Web調査）とは異なり、tokushu-writer は既存published
 * subsidy記事のデータを再構成するだけなので、キーワードは記事タイトルの
 * 参考情報として使うのみ — カテゴリ選定はキーワードとは独立して、
 * CATEGORIES を順番に回して決める（.cache/tokushu-seen-category.json）。
 */
import fs from "node:fs";
import path from "node:path";
import { CATEGORIES } from "../src/config/taxonomy";
import { fetchRelatedKeywords } from "../src/lib/sources/dataforseo";

const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const CATEGORY_INDEX_FILE = path.join(process.cwd(), ".cache", "tokushu-seen-category.json");
const OUT_FILE = path.join(process.cwd(), ".cache", "tokushu-keyword.json");

function loadNextCategoryIndex(): number {
  if (!fs.existsSync(CATEGORY_INDEX_FILE)) return 0;
  try {
    const saved = JSON.parse(fs.readFileSync(CATEGORY_INDEX_FILE, "utf-8")) as { lastIndex: number };
    return (saved.lastIndex + 1) % CATEGORIES.length;
  } catch {
    return 0;
  }
}

function saveCategoryIndex(index: number): void {
  fs.mkdirSync(path.dirname(CATEGORY_INDEX_FILE), { recursive: true });
  fs.writeFileSync(CATEGORY_INDEX_FILE, JSON.stringify({ lastIndex: index }, null, 2), "utf-8");
}

async function main(): Promise<void> {
  const index = loadNextCategoryIndex();
  const category = CATEGORIES[index];

  let keyword = category.seedKeywords[0];
  let searchVolume = 0;
  try {
    const related = await fetchRelatedKeywords(category.seedKeywords);
    if (related.length > 0) {
      keyword = related[0].keyword;
      searchVolume = related[0].searchVolume;
    }
  } catch (err) {
    console.warn(`DataForSEO 取得失敗（参考キーワードのみのため続行）: ${(err as Error).message}`);
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify({ categoryCode: category.code, keyword, searchVolume }, null, 2),
    "utf-8"
  );
  saveCategoryIndex(index);

  console.log(`category: ${category.code} / keyword: ${keyword} (search_volume: ${searchVolume})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
