import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { z } from "zod";
import YAML from "yaml";
import * as cheerio from "cheerio";
import { fetchText, CACHE_ROOT } from "@/lib/sources/http";

/**
 * 一次情報 変更検知 (TASK-02)
 *   sources.yaml → fetch → ノイズ除去 → 正規化テキスト → SHA-256 → 前回と比較
 *   状態: .cache/monitor-state.json
 * ★誤検知抑制が成否を分ける: 日付・カウンタ・セッションIDは ignoreSelectors + 正規化で落とす
 */

/* ---------------- sources.yaml スキーマ ---------------- */

/**
 * v2.1 レジストリ（docs/10_MONITORING_REGISTRY.md）対応。
 *   method: diff のみ本モジュールが処理。rss/api は TASK-10 / 専用スクリプト。
 *   status: unverified|blocked はレポートに「未検証」バッジ。
 *   frequencyHint: 本来望ましい頻度（enum に丸められた場合の元値）。
 */
export const sourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  checkFrequency: z.enum(["daily", "weekly", "monthly"]),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  note: z.string().optional(),
  selector: z.string().optional(),
  ignoreSelectors: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
  notifyOn: z.array(z.enum(["content", "newLink"])).default(["content", "newLink"]),
  // ---- v2.1 拡張フィールド ----
  method: z.enum(["diff", "rss", "api"]).default("diff"),
  status: z.enum(["confirmed", "listed", "unverified", "blocked"]).optional(),
  publishPriority: z.enum(["P0", "P1", "P2", "P3"]).optional(),
  frequencyHint: z.string().optional(),
  baseUrl: z.string().optional(),
  docUrl: z.string().optional(),
  related: z.array(z.string()).optional(),
});
export type MonitorSource = z.infer<typeof sourceSchema>;

const sourcesFileSchema = z.object({
  version: z.union([z.string(), z.number()]).optional(),
  updated: z.string().optional(),
  sources: z.array(sourceSchema).min(1),
  onChange: z
    .object({
      createGithubIssue: z.boolean().optional(),
      labels: z.array(z.string()).optional(),
      assignPriority: z.string().optional(),
    })
    .passthrough()
    .optional(),
  /** 実地確認で死んでいた URL。sources[].url に現れたらロード時に拒否する */
  deadUrls: z.array(z.string()).default([]),
  todoVerify: z.array(z.object({ id: z.string(), issue: z.string(), severity: z.string().optional() })).optional(),
  automationPriority: z.array(z.record(z.unknown())).optional(),
});

/** 既知の本文コンテナ（selector 未指定ソースの誤検知抑制）。ホスト単位で適用 */
const KNOWN_CONTENT_SELECTORS: { host: RegExp; selector: string }[] = [
  { host: /^www\.moj\.go\.jp$/, selector: "#contentsArea" },
];

export interface LoadOptions {
  /** true なら method !== "diff" のソースも返す（既定 false = diff のみ） */
  includeNonDiff?: boolean;
}

export function loadSources(
  file = path.join(process.cwd(), "prompts/monitor/sources.yaml"),
  opts: LoadOptions = {}
): MonitorSource[] {
  const raw = YAML.parse(fs.readFileSync(file, "utf-8")) as unknown;
  const parsed = sourcesFileSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`sources.yaml 스키마 오류:\n${issues}`);
  }
  const dead = new Set(parsed.data.deadUrls);
  const ids = new Set<string>();
  const out: MonitorSource[] = [];
  for (const s of parsed.data.sources) {
    if (ids.has(s.id)) throw new Error(`sources.yaml: id 중복「${s.id}」`);
    ids.add(s.id);
    if (dead.has(s.url)) {
      throw new Error(`sources.yaml: 「${s.id}」の url は deadUrls に登録済み（死リンク）: ${s.url}`);
    }
    if (s.method !== "diff" && !opts.includeNonDiff) continue;
    // selector 未指定でも既知サイトは本文コンテナに絞る
    let selector = s.selector;
    if (!selector) {
      const host = new URL(s.url).hostname;
      selector = KNOWN_CONTENT_SELECTORS.find((k) => k.host.test(host))?.selector;
    }
    out.push({ ...s, selector });
  }
  return out;
}

/* ---------------- 状態ファイル ---------------- */

const stateSchema = z.record(
  z.object({
    hash: z.string(),
    links: z.array(z.string()),
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
  if (!parsed.success) throw new Error(`monitor-state.json 이 손상되었습니다: ${file}`);
  return parsed.data;
}

export function saveState(state: MonitorState, file = STATE_FILE): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2), "utf-8");
}

/* ---------------- 本文抽出・正規化 ---------------- */

/**
 * 常に除去する要素。nav/header/footer/aside は「新着リンク」「更新日」などで
 * 毎日変わりやすく、本文の変更検知には不要（v2.1 は selector 未指定ソースが多いため必須）。
 */
const ALWAYS_IGNORE = [
  "script", "style", "noscript", "template", "svg", "iframe",
  "nav", "header", "footer", "aside", "time",
  "[role=navigation]", "[role=banner]", "[role=contentinfo]",
];

/** 매번 바뀌는 문자열 패턴을 정규화 (날짜·시각·카운터·세션ID) */
function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "")
    // 全角空白 → 半角
    .replace(/　/g, " ")
    // 日付・時刻（2026年8月17日 / 2026/08/17 / 2026-08-17 / 12:34:56）
    .replace(/\d{4}年\s?\d{1,2}月\s?\d{1,2}日/g, "<DATE>")
    .replace(/\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2}/g, "<DATE>")
    .replace(/\b\d{1,2}:\d{2}(:\d{2})?\b/g, "<TIME>")
    // 令和X年X月X日
    .replace(/令和\s?\d{1,2}年\s?\d{1,2}月\s?\d{1,2}日/g, "<DATE>")
    // アクセスカウンタ・セッションID風の長い英数字
    .replace(/\b[a-f0-9]{24,}\b/gi, "<HEX>")
    .replace(/[?&](sid|sessionid|jsessionid|_t|ts|cache|v)=[^&\s]+/gi, "")
    // 空白の連続を1つに、空行の連続を1つに
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
  links: string[];
}

export function extract(html: string, source: MonitorSource, baseUrl: string): Extracted {
  const $ = cheerio.load(html);
  for (const sel of [...ALWAYS_IGNORE, ...source.ignoreSelectors]) {
    try {
      $(sel).remove();
    } catch {
      // 잘못된 셀렉터는 무시하되 조용히 넘어가지 않도록 경고
      console.warn(`  ⚠ ${source.id}: 무효한 셀렉터「${sel}」`);
    }
  }
  let root = source.selector ? $(source.selector) : $("body");
  if (root.length === 0) {
    console.warn(`  ⚠ ${source.id}: selector「${source.selector}」에 해당 요소 없음 → body 로 대체`);
    root = $("body");
  }

  const links = new Set<string>();
  root.find("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) return;
    try {
      const abs = new URL(href, baseUrl);
      abs.hash = "";
      // キャッシュバスター（?1786951130 / ?v=…/ ?t=… / ?_=…）は毎回変わる → 除去
      if (/^\d{6,}$/.test(abs.search.slice(1))) abs.search = "";
      for (const k of ["v", "ver", "t", "ts", "_", "cache", "cachebuster", "rev", "nocache"]) {
        abs.searchParams.delete(k);
      }
      links.add(abs.toString());
    } catch {
      /* 무효 URL 무시 */
    }
  });

  // block 요소 경계를 개행으로 (텍스트가 한 줄로 뭉치는 것을 방지)
  root.find("br, p, div, li, h1, h2, h3, h4, h5, h6, tr, dt, dd, section, article").each((_, el) => {
    $(el).append("\n");
  });
  const text = normalizeText(root.text());
  const hash = crypto.createHash("sha256").update(text).digest("hex");
  return { text, hash, links: [...links].sort() };
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
  source: MonitorSource;
  status: "initialized" | "unchanged" | "changed" | "error";
  hash?: string;
  newLinks?: string[];
  diff?: { added: string[]; removed: string[] };
  /** method: "rss" のソースの新着記事 (TASK-10) */
  rssItems?: { title: string; link: string; date?: string }[];
  error?: string;
}

const SNAPSHOT_LIMIT = 200_000;

/**
 * <meta http-equiv="Refresh" content="0;URL=..."> を最大 depth 回追跡する。
 * 入管庁サイトは HTTP リダイレクトではなく meta refresh を多用するため必須。
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
  throw new Error(`meta refresh 가 ${depth}회를 초과했습니다: ${url}`);
}

export async function checkSource(
  source: MonitorSource,
  state: MonitorState,
  opts: { dryRun: boolean }
): Promise<CheckResult> {
  let html: string;
  let finalUrl = source.url;
  try {
    ({ html, finalUrl } = await fetchFollowingMetaRefresh(source.url));
  } catch (e) {
    return { source, status: "error", error: e instanceof Error ? e.message : String(e) };
  }
  if (finalUrl !== source.url) {
    process.stdout.write(`(↪ ${finalUrl}) `);
  }
  if (html.trim().length < 200) {
    return { source, status: "error", error: `응답이 비정상적으로 짧음 (${html.length}자) — 차단/리다이렉트 의심` };
  }

  const ex = extract(html, source, finalUrl);
  if (ex.text.length < 50) {
    return { source, status: "error", error: `추출 텍스트가 너무 짧음 (${ex.text.length}자) — selector/구조 변경 의심` };
  }

  const prev = state[source.id];
  const now = new Date().toISOString();

  if (!prev) {
    if (!opts.dryRun) {
      state[source.id] = { hash: ex.hash, links: ex.links, checkedAt: now, snapshot: ex.text.slice(0, SNAPSHOT_LIMIT) };
    }
    return { source, status: "initialized", hash: ex.hash };
  }

  const contentChanged = source.notifyOn.includes("content") && prev.hash !== ex.hash;
  const prevLinks = new Set(prev.links);
  const newLinks = source.notifyOn.includes("newLink") ? ex.links.filter((l) => !prevLinks.has(l)) : [];

  if (!contentChanged && newLinks.length === 0) {
    if (!opts.dryRun) state[source.id] = { ...prev, checkedAt: now };
    return { source, status: "unchanged", hash: ex.hash };
  }

  const diff = prev.snapshot ? summarizeDiff(prev.snapshot, ex.text) : undefined;
  if (!opts.dryRun) {
    state[source.id] = {
      hash: ex.hash,
      links: ex.links,
      checkedAt: now,
      changedAt: now,
      snapshot: ex.text.slice(0, SNAPSHOT_LIMIT),
    };
  }
  return { source, status: "changed", hash: ex.hash, newLinks, diff };
}

/** レポート本文（コンソール / GitHub Issue 共用） */
export function formatChangeReport(r: CheckResult): string {
  const lines: string[] = [];
  const badges: string[] = [];
  if (r.source.status === "unverified" || r.source.status === "blocked") badges.push(`【未検証: ${r.source.status}】`);
  if (r.source.frequencyHint) badges.push(`【希望頻度: ${r.source.frequencyHint}】`);
  lines.push(`## ${r.source.name} (${r.source.priority}${r.source.category ? " / " + r.source.category : ""}) ${badges.join(" ")}`.trimEnd());
  lines.push(r.source.url);
  if (r.source.note) lines.push(`> ${r.source.note.trim().replace(/\n/g, "\n> ")}`);
  if (r.rssItems && r.rssItems.length > 0) {
    lines.push("", `### 新着記事 (${r.rssItems.length})`);
    for (const it of r.rssItems.slice(0, 20)) {
      lines.push(`- ${it.date ? `[${it.date.slice(0, 10)}] ` : ""}${it.title}\n  ${it.link}`);
    }
    if (r.rssItems.length > 20) lines.push(`- …他 ${r.rssItems.length - 20} 件`);
  }
  if (r.newLinks && r.newLinks.length > 0) {
    lines.push("", `### 新規リンク (${r.newLinks.length})`);
    for (const l of r.newLinks.slice(0, 20)) lines.push(`- ${l}`);
    if (r.newLinks.length > 20) lines.push(`- …他 ${r.newLinks.length - 20} 件`);
  }
  if (r.diff) {
    if (r.diff.added.length > 0) {
      lines.push("", "### 追加された行");
      for (const l of r.diff.added) lines.push(`+ ${l}`);
    }
    if (r.diff.removed.length > 0) {
      lines.push("", "### 削除された行");
      for (const l of r.diff.removed) lines.push(`- ${l}`);
    }
  }
  const opportunity = r.source.priority === "P0" ? "高" : r.source.priority === "P1" ? "中" : "低";
  lines.push("", `→ 記事機会: ${opportunity}${r.source.category ? ` (カテゴリ ${r.source.category})` : ""}`);
  return lines.join("\n");
}
