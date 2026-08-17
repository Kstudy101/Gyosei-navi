import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import * as cheerio from "cheerio";
import { fetchText, CACHE_ROOT } from "@/lib/sources/http";
import type { MonitorSource } from "@/lib/sources/monitor";

/**
 * RSS フィード監視 (TASK-10 — docs/10_MONITORING_REGISTRY.md §5)
 *   method: "rss" のソースをハッシュではなくフィードパースで処理する。
 *   - RSS 2.0（<rss><channel><item>）と RDF/RSS 1.0（<rdf:RDF><item>）両対応（官公庁は RDF が多い）
 *   - item の guid（無ければ link）をキーに .cache/rss-seen.json と対照 → 新規 item のみ報告
 *   - keywords があれば title + description に部分一致でフィルタ（moj-news はフィルタ必須）
 *   - パース失敗・item 0 件は「変更なし」ではなく明示的にエラーにする（AC）
 *   - 初回実行はベースライン記録のみ（既存 item を新着として報告しない — pubcomment と同方針）
 */

export interface RssItem {
  key: string;
  title: string;
  link: string;
  date?: string;
  description?: string;
}

/** RSS 2.0 / RDF(RSS 1.0) 共通パーサ。item が 1 件も無ければ throw */
export function parseFeed(xml: string): RssItem[] {
  const $ = cheerio.load(xml, { xml: true });
  // RSS 2.0 も RDF も item 要素を持つ（RDF は <rdf:RDF> 直下、2.0 は <channel> 配下）
  const nodes = $("item");
  if (nodes.length === 0) {
    const root = $.root().children().first().prop("tagName") ?? "(不明)";
    throw new Error(`フィードに item がありません（ルート要素: ${root}）— 形式変更か取得失敗の疑い`);
  }
  const items: RssItem[] = [];
  nodes.each((_, el) => {
    const n = $(el);
    const title = n.find("title").first().text().trim();
    // RDF では link が rdf:about と重複、2.0 では guid が isPermaLink の場合 link と同値
    const link = n.find("link").first().text().trim() || n.attr("rdf:about")?.trim() || "";
    const guid = n.find("guid").first().text().trim();
    const rawDate =
      n.find("pubDate").first().text().trim() ||
      n.find("dc\\:date").first().text().trim() ||
      n.find("date").first().text().trim();
    // pubDate は RFC 822 形式（Mon, 17 Aug …）なので ISO の日付部分に正規化。解釈不能なら原文のまま
    let date: string | undefined;
    if (rawDate) {
      const t = Date.parse(rawDate);
      date = Number.isNaN(t) ? rawDate : new Date(t).toISOString().slice(0, 10);
    }
    const description = n.find("description").first().text().trim() || undefined;
    if (!title && !link) return; // 空要素はスキップ（全件空なら下の整合性チェックで落ちる）
    if (!link) throw new Error(`RSS item に link がありません: title=「${title}」`);
    items.push({ key: guid || link, title, link, date, description });
  });
  if (items.length === 0) {
    throw new Error("item 要素はあるが有効な項目を 1 件も抽出できません — パーサ/形式の不一致");
  }
  return items;
}

/* ---------------- seen 状態 ---------------- */

const seenSchema = z.record(
  z.object({
    keys: z.array(z.string()),
    initializedAt: z.string(),
    checkedAt: z.string(),
  })
);
export type RssSeenState = z.infer<typeof seenSchema>;

export const RSS_SEEN_FILE = path.join(CACHE_ROOT, "rss-seen.json");
/** ソースごとに保持する既知キーの上限（ローリング窓のフィードで無限成長を防ぐ） */
const KEYS_LIMIT = 500;

export function loadRssSeen(file = RSS_SEEN_FILE): RssSeenState {
  if (!fs.existsSync(file)) return {};
  const parsed = seenSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf-8")));
  if (!parsed.success) throw new Error(`rss-seen.json 이 손상되었습니다: ${file}`);
  return parsed.data;
}

export function saveRssSeen(state: RssSeenState, file = RSS_SEEN_FILE): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2), "utf-8");
}

/* ---------------- チェック本体 ---------------- */

export interface RssCheckResult {
  status: "initialized" | "unchanged" | "changed" | "error";
  newItems?: RssItem[];
  error?: string;
}

export function matchesKeywords(item: RssItem, keywords: string[] | undefined): boolean {
  if (!keywords || keywords.length === 0) return true;
  const haystack = `${item.title} ${item.description ?? ""}`;
  return keywords.some((k) => haystack.includes(k));
}

export async function checkRssSource(
  source: MonitorSource,
  state: RssSeenState,
  opts: { dryRun: boolean }
): Promise<RssCheckResult> {
  let items: RssItem[];
  try {
    const xml = await fetchText(source.url, { timeoutMs: 45_000 });
    items = parseFeed(xml);
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : String(e) };
  }

  const now = new Date().toISOString();
  const prev = state[source.id];

  if (!prev) {
    // 初回: 現在の item をベースラインとして記録し、新着としては報告しない
    if (!opts.dryRun) {
      state[source.id] = { keys: items.map((i) => i.key).slice(0, KEYS_LIMIT), initializedAt: now, checkedAt: now };
    }
    return { status: "initialized" };
  }

  const seen = new Set(prev.keys);
  const fresh = items.filter((i) => !seen.has(i.key));
  const matched = fresh.filter((i) => matchesKeywords(i, source.keywords));

  if (!opts.dryRun) {
    // 新規キーは（キーワード不一致でも）既知に加える — 次回以降の再判定を防ぐ
    const keys = [...fresh.map((i) => i.key), ...prev.keys].slice(0, KEYS_LIMIT);
    state[source.id] = { keys, initializedAt: prev.initializedAt, checkedAt: now };
  }

  if (matched.length === 0) return { status: "unchanged" };
  return { status: "changed", newItems: matched };
}
