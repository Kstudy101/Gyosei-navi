/**
 * DataForSEO から /ranking 記事の元になる検索キーワードを1件選び、
 * .cache/ranking-keyword.json に書き出す CLI。
 *   npm run ranking:pick-keyword
 *
 * 実際の調査・執筆は行わない — その役割は claude -p 経由で ranking-writer が担う
 * （.github/workflows/hourly-ranking.yml 参照）。
 */
import fs from "node:fs";
import path from "node:path";
import { fetchRelatedKeywords } from "../src/lib/sources/dataforseo";

const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const SEED_KEYWORDS = ["補助金", "助成金", "給付金"];
const SEEN_FILE = path.join(process.cwd(), ".cache", "ranking-seen.json");
const OUT_FILE = path.join(process.cwd(), ".cache", "ranking-keyword.json");

function loadSeen(): string[] {
  if (!fs.existsSync(SEEN_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(SEEN_FILE, "utf-8")) as string[];
  } catch {
    return [];
  }
}

function saveSeen(seen: string[]): void {
  fs.mkdirSync(path.dirname(SEEN_FILE), { recursive: true });
  fs.writeFileSync(SEEN_FILE, JSON.stringify(seen.slice(-200), null, 2), "utf-8");
}

async function main(): Promise<void> {
  const related = await fetchRelatedKeywords(SEED_KEYWORDS);
  if (related.length === 0) {
    console.log("DataForSEO から関連キーワードを取得できませんでした。");
    process.exit(1);
  }

  const seen = loadSeen();
  const candidate = related.find((r) => !seen.includes(r.keyword));
  if (!candidate) {
    console.log("未使用の候補キーワードがありません。");
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify({ keyword: candidate.keyword, searchVolume: candidate.searchVolume }, null, 2),
    "utf-8"
  );
  saveSeen([...seen, candidate.keyword]);

  console.log(`keyword: ${candidate.keyword} (search_volume: ${candidate.searchVolume})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
