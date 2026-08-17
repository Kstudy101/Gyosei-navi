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
});
export type MonitorSource = z.infer<typeof sourceSchema>;

const sourcesFileSchema = z.object({
  sources: z.array(sourceSchema).min(1),
  onChange: z
    .object({
      createGithubIssue: z.boolean().optional(),
      labels: z.array(z.string()).optional(),
      assignPriority: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export function loadSources(file = path.join(process.cwd(), "prompts/monitor/sources.yaml")): MonitorSource[] {
  const raw = YAML.parse(fs.readFileSync(file, "utf-8")) as unknown;
  const parsed = sourcesFileSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`sources.yaml 스키마 오류:\n${issues}`);
  }
  const ids = new Set<string>();
  for (const s of parsed.data.sources) {
    if (ids.has(s.id)) throw new Error(`sources.yaml: id 중복「${s.id}」`);
    ids.add(s.id);
  }
  return parsed.data.sources;
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

const ALWAYS_IGNORE = ["script", "style", "noscript", "template", "svg"];

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
  lines.push(`## ${r.source.name} (${r.source.priority}${r.source.category ? " / " + r.source.category : ""})`);
  lines.push(r.source.url);
  if (r.source.note) lines.push(`> ${r.source.note}`);
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
