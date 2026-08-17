import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import * as cheerio from "cheerio";
import { fetchText, CACHE_ROOT } from "@/lib/sources/http";

/**
 * e-Gov パブリック・コメント 監視 (TASK-03)
 * 조사 결과: docs/api/egov-pubcomment.md
 *   1) RSS  https://public-comment.e-gov.go.jp/rss/pcm_list.xml  — 최신 6건 (신착 즉시)
 *   2) 목록 POST /servlet/Public CLASSNAME=PCMMSTLIST&Page=n     — 20건/페이지, 무상태 (백필)
 *   서버측 키워드 검색은 세션 의존이라 사용하지 않고 클라이언트측에서 필터한다.
 * ★N4: 「0件」과 「파싱 실패」를 반드시 구분 — 구조가 바뀌면 throw
 */

export const RSS_URL = "https://public-comment.e-gov.go.jp/rss/pcm_list.xml";
export const LIST_URL = "https://public-comment.e-gov.go.jp/servlet/Public";
export const SEEN_FILE = path.join(CACHE_ROOT, "pubcomment-seen.json");

export const DEFAULT_KEYWORDS = [
  "行政書士", "在留資格", "入管", "出入国", "永住", "帰化", "育成就労",
  "技能実習", "特定技能", "外国人", "建設業許可", "電子申請", "行政手続",
];

export interface PubComment {
  id: string;
  title: string;
  ministry: string;
  category: string;
  /** YYYY-MM-DD */
  publishedAt: string;
  /** YYYY-MM-DD HH:mm (JST) */
  deadline: string;
  url: string;
  source: "rss" | "list";
}

const seenSchema = z.record(
  z.object({ title: z.string(), deadline: z.string(), firstSeenAt: z.string() })
);
export type SeenMap = z.infer<typeof seenSchema>;

export function loadSeen(file = SEEN_FILE): SeenMap {
  if (!fs.existsSync(file)) return {};
  const parsed = seenSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf-8")));
  if (!parsed.success) throw new Error(`pubcomment-seen.json 이 손상되었습니다: ${file}`);
  return parsed.data;
}

export function saveSeen(seen: SeenMap, file = SEEN_FILE): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(seen, null, 2), "utf-8");
}

/* ---------------- 날짜 정규화 ---------------- */

/** 「2026/09/06 23:59」「2026年9月6日23時59分」「2026/09/06」→ 「2026-09-06 23:59」 or 「2026-09-06」 */
export function normalizeJpDate(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  let m = t.match(/(\d{4})[\/年.\-]\s?(\d{1,2})[\/月.\-]\s?(\d{1,2})日?(?:\s?(\d{1,2})[:時](\d{1,2})分?)?/);
  if (!m) throw new Error(`날짜 해석 불가: 「${s}」`);
  const [, y, mo, d, hh, mm] = m;
  const date = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return hh !== undefined ? `${date} ${hh.padStart(2, "0")}:${(mm ?? "0").padStart(2, "0")}` : date;
}

const idFromUrl = (url: string): string | null => url.match(/[?&]id=(\d+)/)?.[1] ?? null;

/* ---------------- RSS ---------------- */

export async function fetchRss(): Promise<PubComment[]> {
  const xml = await fetchText(RSS_URL, { timeoutMs: 30_000 });
  const $ = cheerio.load(xml, { xml: true });
  if ($("channel").length === 0) {
    throw new Error("RSS 구조 이상: <channel> 없음 (사이트 구조 변경 의심)");
  }
  const items = $("item");
  const out: PubComment[] = [];
  items.each((_, el) => {
    const title = $(el).find("title").first().text().trim();
    const link = $(el).find("link").first().text().trim();
    const desc = $(el).find("description").first().text();
    const id = idFromUrl(link);
    if (!title || !link || !id) {
      throw new Error(`RSS item 파싱 실패: title=「${title}」 link=「${link}」`);
    }
    // description: 案の公示日：2026/08/17<br/>受付締切日時：2026/09/06 23:59<br/>カテゴリー：農業<br/>問合せ先（所管省庁・部局名等）：…
    const parts = desc.split(/<br\s*\/?>/i).map((p) => p.trim()).filter(Boolean);
    const field = (label: string) =>
      parts.find((p) => p.startsWith(label))?.slice(label.length).replace(/^[：:]\s*/, "").trim() ?? "";
    const publishedRaw = field("案の公示日");
    const deadlineRaw = field("受付締切日時");
    if (!publishedRaw || !deadlineRaw) {
      throw new Error(`RSS description 형식 변경 의심 (${id}): ${desc.slice(0, 200)}`);
    }
    out.push({
      id,
      title,
      ministry: field("問合せ先（所管省庁・部局名等）").split(/\s/)[0] || "-",
      category: field("カテゴリー") || "-",
      publishedAt: normalizeJpDate(publishedRaw),
      deadline: normalizeJpDate(deadlineRaw),
      url: link,
      source: "rss",
    });
  });
  if (out.length === 0) {
    console.warn("  ⚠ RSS item 0건 — 사이트가 진짜 0건인지 확인 필요 (드묾)");
  }
  return out;
}

/* ---------------- 목록 페이지 ---------------- */

export async function fetchListPage(page: number): Promise<{ items: PubComment[]; totalPages: number }> {
  const body = new URLSearchParams({ CLASSNAME: "PCMMSTLIST", Mode: "0", Page: String(page), dspcnt: "20" });
  const html = await fetchText(LIST_URL, { method: "POST", body, timeoutMs: 45_000 });
  const $ = cheerio.load(html);

  const totalRaw = $('input[name="totalPage"]').attr("value");
  const list = $("ul.egovui-list-comment-list > li");
  if (totalRaw === undefined || list.length === 0) {
    throw new Error(
      `목록 페이지 구조 이상 (page ${page}): totalPage=${totalRaw ?? "없음"}, li=${list.length} — HTML 구조 변경 의심`
    );
  }
  const totalPages = Number(totalRaw);

  const items: PubComment[] = [];
  list.each((_, li) => {
    const $li = $(li);
    const onClick = $li.find(".egovui-link-area-cursor").attr("onclick") ?? "";
    const id = onClick.match(/id=(\d+)/)?.[1] ?? null;
    const title = $li.find("h2.egovui-title-finer").text().trim();
    const category = $li.find(".egovui-list-tags .egovui-badge").first().text().trim();

    const detail = (label: string): string => {
      let found = "";
      $li.find(".egovui-comment-detail").each((__, d) => {
        const $d = $(d);
        const first = $d.children("span").first();
        if (first.text().trim() === label) {
          // 값은 두 번째 span 또는 텍스트 노드
          const second = $d.children("span").eq(1);
          found = (second.length ? second.text() : $d.text().replace(label, "")).trim();
        }
      });
      return found;
    };
    const publishedRaw = detail("案の公示日");
    const deadlineRaw = detail("受付締切日時");
    const ministry = detail("所管省庁");

    if (!id || !title || !deadlineRaw || !publishedRaw) {
      throw new Error(
        `목록 항목 파싱 실패 (page ${page}): id=${id} title=「${title}」 deadline=「${deadlineRaw}」`
      );
    }
    items.push({
      id,
      title,
      ministry: ministry || "-",
      category: category || "-",
      publishedAt: normalizeJpDate(publishedRaw),
      deadline: normalizeJpDate(deadlineRaw),
      url: `https://public-comment.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id=${id}&Mode=0`,
      source: "list",
    });
  });
  return { items, totalPages };
}

/** 최신 N페이지 순회 (기본 3페이지 = 60건). 1페이지 실패는 전체 실패로 승격 */
export async function fetchListPages(pages: number): Promise<PubComment[]> {
  const out: PubComment[] = [];
  let total = pages;
  for (let p = 1; p <= Math.min(pages, total); p++) {
    const { items, totalPages } = await fetchListPage(p);
    total = totalPages;
    out.push(...items);
  }
  return out;
}

/* ---------------- 필터·판정 ---------------- */

export function matchKeywords(c: PubComment, keywords: string[]): string[] {
  const hay = `${c.title} ${c.category} ${c.ministry}`;
  return keywords.filter((k) => hay.includes(k));
}

/** JST 기준 마감까지 남은 일수 (마감일 당일 = 0, 지났으면 음수) */
export function daysUntil(deadline: string, now = new Date()): number {
  const dateOnly = deadline.slice(0, 10);
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const today = jstNow.toISOString().slice(0, 10);
  const a = Date.UTC(Number(dateOnly.slice(0, 4)), Number(dateOnly.slice(5, 7)) - 1, Number(dateOnly.slice(8, 10)));
  const b = Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1, Number(today.slice(8, 10)));
  return Math.round((a - b) / 86_400_000);
}

/** P0 카테고리(nyukan) 키워드에 걸리면 高 */
const P0_KEYWORDS = ["在留資格", "入管", "出入国", "永住", "帰化", "育成就労", "技能実習", "特定技能", "外国人", "行政書士"];
export function opportunity(matched: string[]): "高" | "中" | "低" {
  if (matched.some((k) => P0_KEYWORDS.includes(k))) return "高";
  if (matched.length > 0) return "中";
  return "低";
}

export function formatItem(c: PubComment, matched: string[]): string {
  const d = daysUntil(c.deadline);
  const urgent = d <= 7 ? "★ 緊急 " : "";
  return [
    `${urgent}[${matched.join("/") || c.category}] ${c.title}`,
    `  所管: ${c.ministry} / 公示: ${c.publishedAt} / 締切: ${c.deadline} (D${d >= 0 ? "-" + d : "+" + Math.abs(d)})`,
    `  ${c.url}`,
    `  → 記事機会: ${opportunity(matched)}`,
  ].join("\n");
}
