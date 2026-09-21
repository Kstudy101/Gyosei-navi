import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { z } from "zod";
import matter from "gray-matter";
import * as cheerio from "cheerio";
import { fetchText, CACHE_ROOT } from "@/lib/sources/http";

/**
 * 地自体等 一次情報 変更検知（新着キャッチ）
 *   published subsidy 記事の sourceLinks[0] を監視対象として自動収集し、
 *   HTML を正規化 → SHA-256 で前回と比較する。v1（docs/10_MONITORING_REGISTRY.md）の
 *   monitor.ts を、sources.yaml 手動登録ではなく記事から自動導出する形に作り直したもの。
 *   状態: .cache/monitor-state.json
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const DATA_DIR = path.join(process.cwd(), "data");

export interface WatchTarget {
  /** state のキー。監視URLを安定的に短縮したもの */
  id: string;
  /** 表示名（記事タイトル、または自治体名） */
  label: string;
  /** 記事に由来する場合のみ。content/ からの相対パス */
  articleFile?: string;
  /** 記事に由来する場合のみ。記事の公開URL（例: /subsidy/energy/kobe-fcv-fukyu-sokushin） */
  articleHref?: string;
  /** 監視対象の一次情報URL */
  url: string;
  /** urlの出典説明（記事なら sourceLinks[].label、自治体トップページなら "○○県 △△市 公式サイト"） */
  sourceLabel: string;
}

function walkMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMdxFiles(full));
    else if (entry.name.endsWith(".mdx") && !entry.name.startsWith("_")) out.push(full);
  }
  return out;
}

function targetId(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 16);
}

/**
 * published な subsidy 記事から監視対象を自動収集する。
 * sourceLinks[0] を代表の一次情報とみなす（170件全件で HTML、PDF は0件 — 2026-09-21実測）。
 * PDF は diff 監視に向かないため、拡張子 .pdf の場合はスキップする。
 * jgrants-portal.go.jp は新UIがSPA（javascript:void(0)でリンクが張られクライアント側で
 * 本文を描画する）ため静的fetchでは本文が0字になる（2026-09-21実測、docs/10 §2① と同じ問題）。
 * jGrants の新着は watch-subsidies.ts（API監視）が別途カバーしているため、ここではスキップする。
 */
export function collectArticleWatchTargets(): WatchTarget[] {
  const dir = path.join(CONTENT_DIR, "subsidy");
  const targets: WatchTarget[] = [];
  for (const file of walkMdxFiles(dir)) {
    const { data } = matter(fs.readFileSync(file, "utf-8"));
    if (data.status !== "published") continue;
    const links = (data.sourceLinks ?? []) as { label: string; url: string }[];
    const first = links[0];
    if (!first || first.url.toLowerCase().endsWith(".pdf")) continue;
    if (new URL(first.url).hostname === "www.jgrants-portal.go.jp") continue;

    const rel = path.relative(CONTENT_DIR, file).split(path.sep);
    const category = rel[1];
    const slug = path.basename(file, ".mdx");

    targets.push({
      id: targetId(first.url),
      label: data.title ?? slug,
      articleFile: path.relative(CONTENT_DIR, file),
      articleHref: `/subsidy/${category}/${slug}`,
      url: first.url,
      sourceLabel: first.label,
    });
  }
  return targets;
}

interface MunicipalityHomepage {
  pref: string;
  name: string;
  url: string;
}

/**
 * 全国市区町村の公式ホームページ トップページ（data/watch/municipality-homepages.json、
 * 1,718件 — data/watch/README.md 参照）を監視対象にする。記事の有無を問わず全件を対象にする
 * （2026-09-21 ユーザー確認）。トップページ全体の diff のため、補助金と無関係な変更も
 * 検知されうる点は運用課題として残る（同README参照）。
 */
export function collectMunicipalityWatchTargets(): WatchTarget[] {
  const file = path.join(DATA_DIR, "watch", "municipality-homepages.json");
  if (!fs.existsSync(file)) return [];
  const list = JSON.parse(fs.readFileSync(file, "utf-8")) as MunicipalityHomepage[];
  return list.map((m) => ({
    id: targetId(m.url),
    label: `${m.pref}${m.name}`,
    url: m.url,
    sourceLabel: `${m.pref}${m.name} 公式サイト`,
  }));
}

/**
 * 1,718件の市区町村トップページを毎日全件監視すると1件1秒間隔でも30分近くかかり、
 * GitHub Actions の実行時間を圧迫する（2026-09-21 ユーザー確認のうえ、曜日分割で対応）。
 * 対象を7分割し、その日の曜日（0=日〜6=土）に対応する分だけを返す。
 */
export function partitionByWeekday(targets: WatchTarget[], weekday: number): WatchTarget[] {
  return targets.filter((t) => {
    const bucket = parseInt(t.id.slice(0, 8), 16) % 7;
    return bucket === weekday;
  });
}

/* ---------------- 状態ファイル ---------------- */

const stateSchema = z.record(
  z.object({
    hash: z.string(),
    checkedAt: z.string(),
    changedAt: z.string().optional(),
    /** 直近の正規化テキスト（diff 用。長大なので先頭のみ保持） */
    snapshot: z.string().optional(),
  })
);
export type MonitorState = z.infer<typeof stateSchema>;

export const STATE_FILE = path.join(CACHE_ROOT, "monitor-state.json");

export function loadState(file = STATE_FILE): MonitorState {
  if (!fs.existsSync(file)) return {};
  const raw = JSON.parse(fs.readFileSync(file, "utf-8")) as unknown;
  const parsed = stateSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`monitor-state.json が壊れています: ${file}`);
  return parsed.data;
}

export function saveState(state: MonitorState, file = STATE_FILE): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2), "utf-8");
}

/* ---------------- 本文抽出・正規化 ---------------- */

/**
 * 常に除去する要素。nav/header/footer/aside は「新着リンク」「更新日」などで
 * 毎日変わりやすく、本文の変更検知には不要。
 */
const ALWAYS_IGNORE = [
  "script", "style", "noscript", "template", "svg", "iframe",
  "nav", "header", "footer", "aside", "time",
  "[role=navigation]", "[role=banner]", "[role=contentinfo]",
];

/** 毎回変わる文字列パターンを正規化（日付・時刻・カウンタ・セッションID） */
function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/　/g, " ")
    .replace(/\d{4}年\s?\d{1,2}月\s?\d{1,2}日/g, "<DATE>")
    .replace(/\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2}/g, "<DATE>")
    .replace(/\b\d{1,2}:\d{2}(:\d{2})?\b/g, "<TIME>")
    .replace(/令和\s?\d{1,2}年\s?\d{1,2}月\s?\d{1,2}日/g, "<DATE>")
    .replace(/\b[a-f0-9]{24,}\b/gi, "<HEX>")
    .replace(/[?&](sid|sessionid|jsessionid|_t|ts|cache|v)=[^&\s]+/gi, "")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, arr) => l !== "" || (i > 0 && arr[i - 1] !== ""))
    .join("\n")
    .trim();
}

export interface Extracted {
  text: string;
  hash: string;
}

export function extract(html: string): Extracted {
  const $ = cheerio.load(html);
  for (const sel of ALWAYS_IGNORE) {
    try {
      $(sel).remove();
    } catch {
      // 無効なセレクタは無視
    }
  }
  $("br, p, div, li, h1, h2, h3, h4, h5, h6, tr, dt, dd, section, article").each((_, el) => {
    $(el).append("\n");
  });
  const text = normalizeText($("body").text() || $.text());
  const hash = crypto.createHash("sha256").update(text).digest("hex");
  return { text, hash };
}

/* ---------------- diff（行単位・追加/削除 最大20行） ---------------- */

export function summarizeDiff(before: string, after: string, max = 20): { added: string[]; removed: string[] } {
  const b = new Set(before.split("\n"));
  const a = new Set(after.split("\n"));
  const added = [...a].filter((l) => l && !b.has(l)).slice(0, max);
  const removed = [...b].filter((l) => l && !a.has(l)).slice(0, max);
  return { added, removed };
}

/* ---------------- 実行 ---------------- */

export interface CheckResult {
  target: WatchTarget;
  status: "initialized" | "unchanged" | "changed" | "error";
  hash?: string;
  diff?: { added: string[]; removed: string[] };
  error?: string;
}

const SNAPSHOT_LIMIT = 200_000;

/**
 * <meta http-equiv="Refresh" content="0;URL=..."> を最大 depth 回追跡する。
 * 官公庁サイトは HTTP リダイレクトではなく meta refresh を多用することがあるため必要。
 */
export async function fetchFollowingMetaRefresh(
  url: string,
  depth = 3
): Promise<{ html: string; finalUrl: string }> {
  let current = url;
  for (let i = 0; i <= depth; i++) {
    const html = await fetchText(current, { timeoutMs: 45_000 });
    const m = html.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["']?\s*\d+\s*;\s*url=([^"'>\s]+)/i);
    if (!m || html.length > 5_000) return { html, finalUrl: current };
    const next = new URL(m[1], current).toString();
    if (next === current) return { html, finalUrl: current };
    current = next;
  }
  throw new Error(`meta refresh が ${depth} 回を超えました: ${url}`);
}

export async function checkTarget(
  target: WatchTarget,
  state: MonitorState,
  opts: { dryRun: boolean }
): Promise<CheckResult> {
  let html: string;
  try {
    ({ html } = await fetchFollowingMetaRefresh(target.url));
  } catch (e) {
    return { target, status: "error", error: e instanceof Error ? e.message : String(e) };
  }
  if (html.trim().length < 200) {
    return { target, status: "error", error: `応答が異常に短い（${html.length}字）— ブロック/リダイレクトの疑い` };
  }

  const ex = extract(html);
  if (ex.text.length < 50) {
    return { target, status: "error", error: `抽出テキストが短すぎる（${ex.text.length}字）— ページ構造変更の疑い` };
  }

  const prev = state[target.id];
  const now = new Date().toISOString();

  if (!prev) {
    if (!opts.dryRun) {
      state[target.id] = { hash: ex.hash, checkedAt: now, snapshot: ex.text.slice(0, SNAPSHOT_LIMIT) };
    }
    return { target, status: "initialized", hash: ex.hash };
  }

  if (prev.hash === ex.hash) {
    if (!opts.dryRun) state[target.id] = { ...prev, checkedAt: now };
    return { target, status: "unchanged", hash: ex.hash };
  }

  const diff = prev.snapshot ? summarizeDiff(prev.snapshot, ex.text) : undefined;
  if (!opts.dryRun) {
    state[target.id] = {
      hash: ex.hash,
      checkedAt: now,
      changedAt: now,
      snapshot: ex.text.slice(0, SNAPSHOT_LIMIT),
    };
  }
  return { target, status: "changed", hash: ex.hash, diff };
}

/** レポート本文（コンソール / GitHub Issue 共用） */
export function formatChangeReport(r: CheckResult): string {
  const lines: string[] = [];
  lines.push(`## ${r.target.label}`);
  if (r.target.articleHref) lines.push(`- 記事: ${r.target.articleHref}`);
  lines.push(`- 一次情報: ${r.target.sourceLabel}`);
  lines.push(`  ${r.target.url}`);
  if (r.diff) {
    if (r.diff.added.length > 0) {
      lines.push("", "### 追加された内容");
      for (const l of r.diff.added) lines.push(`+ ${l}`);
    }
    if (r.diff.removed.length > 0) {
      lines.push("", "### 削除された内容");
      for (const l of r.diff.removed) lines.push(`- ${l}`);
    }
  }
  return lines.join("\n");
}
