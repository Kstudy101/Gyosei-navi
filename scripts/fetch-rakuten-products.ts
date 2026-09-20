/**
 * 楽天ウェブサービス 商品取得 CLI（作業指示書 §3, §19）
 *   npm run ads:rakuten                 # 全カテゴリ再取得 → data/ads/rakuten/*.json
 *   npm run ads:rakuten -- --category sogyo   # 1カテゴリのみ
 * 事전: .env.local に RAKUTEN_APP_ID + RAKUTEN_ACCESS_KEY（両方必須, 2026-02 API 移行後）
 *       / RAKUTEN_AFFILIATE_ID（affiliateUrl 取得に必須）
 *
 * 静的 export サイトのため、この結果 JSON は data/sources と同様にリポジトリへコミットする
 * （data/stats と違い .gitignore 対象ではない — CI の build ステップは何も取得しないため、
 *   コミットされた JSON が無いと商品広告は「0件」＝非表示のまま）。
 * デプロイを伴わせたい場合は data/ 以外のファイルも一緒に変更するか、
 * workflow_dispatch で deploy-xserver を手動実行する（paths-ignore: data/** のため）。
 */
import fs from "node:fs";
import path from "node:path";
import { CATEGORY_CODES } from "../src/config/taxonomy";
import { getAdKeywords } from "../src/lib/ads/rakuten/mapping";
import { searchItems, RakutenApiError } from "../src/lib/ads/rakuten/client";
import { writeCachedProducts } from "../src/lib/ads/rakuten/cache";
import type { RakutenProduct } from "../src/lib/ads/rakuten/types";

// .env.local 로드 (scripts/fetch-stats.ts와 동일 패턴 — dotenv 미사용)
const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const TARGET_PER_CATEGORY = 12;
const HITS_PER_KEYWORD = 10;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && !process.argv[i + 1]?.startsWith("--") ? process.argv[i + 1] : undefined;
}

async function fetchForCategory(category: string): Promise<void> {
  const keywords = getAdKeywords(category);
  if (keywords.length === 0) {
    console.log(`- ${category}: マッピング未定義 → スキップ`);
    return;
  }

  const merged = new Map<string, RakutenProduct>();
  let usedKeyword = "";
  for (const keyword of keywords) {
    if (merged.size >= TARGET_PER_CATEGORY) break;
    try {
      const items = await searchItems({ keyword, hits: HITS_PER_KEYWORD });
      if (!usedKeyword) usedKeyword = keyword;
      for (const item of items) {
        if (!merged.has(item.itemCode)) merged.set(item.itemCode, item);
      }
    } catch (e) {
      const msg = e instanceof RakutenApiError ? e.message : String(e);
      console.error(`  ✖ ${category} / "${keyword}": ${msg}`);
    }
  }

  if (merged.size === 0) {
    console.log(`- ${category}: 有効な商品が0件 → 既存キャッシュを保持（上書きしない）`);
    return;
  }

  const items = Array.from(merged.values()).slice(0, TARGET_PER_CATEGORY);
  const file = writeCachedProducts(category, usedKeyword, items);
  console.log(`- ${category}: ${items.length}件 → ${path.relative(process.cwd(), file)}`);
}

async function main(): Promise<void> {
  const only = arg("category");
  const targets = only ? [only] : [...CATEGORY_CODES];

  console.log(`楽天ウェブサービス 商品取得 開始（${targets.length}カテゴリ）`);
  for (const category of targets) {
    await fetchForCategory(category);
  }
  console.log("完了");
}

main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
