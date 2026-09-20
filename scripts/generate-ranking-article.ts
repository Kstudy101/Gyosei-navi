/**
 * DataForSEO の関連キーワードから /ranking 記事を自動生成する CLI（v1・完全自動）
 *   npm run ranking:generate
 *
 * 手順:
 *   1. .env.local の DataForSEO で「補助金」関連の検索ボリューム上位キーワードを取得
 *   2. 直近生成済みキーワード（.cache/ranking-seen.json）と重複しないものを1件選ぶ
 *   3. 固定テンプレートで TOP5 の見出し・本文を機械的に組み立てる（個別の制度名・金額は断定しない）
 *   4. content/ranking/<slug>.mdx を status: published で書き出す
 *
 * 注意: この記事は一次情報の裏取りをしない自動生成コンテンツ。断定・保証表現は使わない
 * （.claude/config/article-policy.json の legalBoundaries に準拠）。
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
const RANKING_DIR = path.join(process.cwd(), "content", "ranking");

const RANK_ANGLES = [
  { title: "制度の幅広さ", body: "対象となる世帯・事業者の条件が比較的広く、多くの人が候補になりやすい傾向がある切り口です。" },
  { title: "申請のしやすさ", body: "必要書類やオンライン申請の対応など、手続きの負担が話題になりやすい切り口です。" },
  { title: "支給・助成の速さ", body: "申請から支給までのスピード感が検索・比較の関心を集めやすい切り口です。" },
  { title: "自治体ごとの上乗せ", body: "国の制度に自治体独自の上乗せ・加算がある場合に注目されやすい切り口です。" },
  { title: "併用のしやすさ", body: "他の補助金・助成金と併用できるかどうかが検索されやすい切り口です。" },
] as const;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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

/**
 * キーワードは日本語が前提のため、スキーマが求める英小文字・数字・ハイフンの slug には
 * ローマ字変換せず使わない — 日付+時刻の連番で一意性を確保する（衝突しない・可逆な変換が無いため）。
 */
function slugify(date: string): string {
  const time = new Date().toISOString().slice(11, 19).replace(/:/g, "");
  return `${date}-${time}-ranking-top5`;
}

function escapeYaml(s: string): string {
  return s.replace(/"/g, '\\"');
}

function buildMdx(keyword: string, date: string, slug: string): string {
  const title = `「${keyword}」で今注目のポイントTOP5`;
  const description = `「${keyword}」の検索トレンドをもとに、補助金・助成金を比較するときに注目したい観点をTOP5形式でまとめました。`;

  const itemsYaml = RANK_ANGLES.map(
    (a, i) => `  - rank: ${i + 1}
    title: "${escapeYaml(a.title)}"
    body: "${escapeYaml(a.body)}"`
  ).join("\n");

  return `---
title: "${escapeYaml(title)}"
slug: "${slug}"
description: "${escapeYaml(description)}"
keyword: "${escapeYaml(keyword)}"
publishedAt: "${date}"
updatedAt: "${date}"
status: "published"
source: "dataforseo-auto"
items:
${itemsYaml}
---
`;
}

async function main(): Promise<void> {
  const related = await fetchRelatedKeywords(SEED_KEYWORDS);
  if (related.length === 0) {
    console.log("DataForSEO から関連キーワードを取得できませんでした。今回はスキップします。");
    return;
  }

  const seen = loadSeen();
  const candidate = related.find((r) => !seen.includes(r.keyword));
  if (!candidate) {
    console.log("未使用の候補キーワードがありません。今回はスキップします。");
    return;
  }

  const date = todayIso();
  const slug = slugify(date);
  const target = path.join(RANKING_DIR, `${slug}.mdx`);

  if (fs.existsSync(target)) {
    console.log(`既に存在: ${target}`);
    return;
  }

  fs.mkdirSync(RANKING_DIR, { recursive: true });
  fs.writeFileSync(target, buildMdx(candidate.keyword, date, slug), "utf-8");
  saveSeen([...seen, candidate.keyword]);

  console.log(`生成完了: ${target}`);
  console.log(`keyword: ${candidate.keyword} (search_volume: ${candidate.searchVolume})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
