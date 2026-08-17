import fs from "node:fs";
import path from "node:path";
import { fetchText, CACHE_ROOT } from "@/lib/sources/http";

/**
 * 官報 일일 아카이빙 (TASK-09 — docs/10_MONITORING_REGISTRY.md §5)
 *   2025-04-01「官報の発行に関する法律」施行으로 전자판(kanpo.go.jp)이 정본.
 *   ⚠ 발행 후 90일간만 무료 열람·DL 가능 → 놓친 날은 영구 복구 불가.
 *   RSS·API 부존재 → 톱페이지(직근 90일 색인)를 파싱해 号별 PDF를 취득한다.
 *
 *   실측 구조 (2026-08-17):
 *     톱페이지  https://www.kanpo.go.jp/index.html 에 90일분 링크가 평면 나열
 *     号 전문   ./{YYYYMMDD}/{issueId}/{issueId}full{NNNN}{PPPP}f.html
 *     PDF      ./{YYYYMMDD}/{issueId}/pdf/{issueId}full{NNNN}{PPPP}.pdf
 *     issueId = YYYYMMDD + 種別(h本紙|g号外|c政府調達|t特別号外|m目録) + 5자리 호수
 *
 *   저장:
 *     PDF 원본  .cache/kanpo/YYYY/MM/DD/*.pdf  (CI에서는 Release 자산으로 영구화)
 *     추출 텍스트 data/kanpo-text/YYYY/MM/DD/{issueId}.txt (리포 커밋 → 과거분 검색)
 */

const BASE = "https://www.kanpo.go.jp";

export const ISSUE_TYPES: Record<string, string> = {
  h: "本紙",
  g: "号外",
  c: "政府調達",
  t: "特別号外",
  m: "目録",
};

export interface KanpoIssue {
  /** 예: 20260817h01769 */
  id: string;
  date: string; // YYYY-MM-DD
  type: string; // h|g|c|t|m
  typeLabel: string;
  number: string; // 5자리 호수
  pdfUrl: string;
  pageCount: number | null;
}

export const PDF_ROOT = path.join(CACHE_ROOT, "kanpo");
export const TEXT_ROOT = path.join(process.cwd(), "data", "kanpo-text");

/* ---------------- 색인 ---------------- */

const FULL_LINK = /href="\.\/(\d{8})\/(\d{8}[a-z]\d{5})\/(\2full(\d{4})(\d{4}))f\.html"/g;

/** 톱페이지에서 직근 90일분의 号 목록을 취득한다. 0건이면 구조 변경으로 보고 throw */
export async function fetchIssueIndex(): Promise<Map<string, KanpoIssue[]>> {
  const html = await fetchText(`${BASE}/index.html`, { timeoutMs: 45_000 });
  const byDate = new Map<string, KanpoIssue[]>();
  const seen = new Set<string>();
  for (const m of html.matchAll(FULL_LINK)) {
    const [, ymd, issueId, fullBase, , pages] = m;
    if (seen.has(issueId)) continue;
    seen.add(issueId);
    const type = issueId.charAt(8);
    const date = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
    const issue: KanpoIssue = {
      id: issueId,
      date,
      type,
      typeLabel: ISSUE_TYPES[type] ?? type,
      number: issueId.slice(9),
      pdfUrl: `${BASE}/${ymd}/${issueId}/pdf/${fullBase}.pdf`,
      pageCount: Number.parseInt(pages, 10) || null,
    };
    const arr = byDate.get(date) ?? [];
    arr.push(issue);
    byDate.set(date, arr);
  }
  if (byDate.size === 0) {
    throw new Error("官報トップページから号リンクを 1 件も抽出できません — サイト構造変更の疑い");
  }
  return byDate;
}

/* ---------------- PDF 취득·텍스트 추출 ---------------- */

async function fetchBinary(url: string): Promise<Buffer> {
  // fetchText 는 문자열 변환을 거치므로 바이너리는 직접 fetch (간격 보장은 호출측 순차 처리로 충분)
  const res = await fetch(url, {
    headers: { "user-agent": "gyosei-portal-pipeline/0.1 (kanpo archiver; contact: editorial)" },
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024 || buf.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new Error(`PDF ではない応答 (${buf.length} bytes) ${url}`);
  }
  return buf;
}

export async function extractPdfText(buf: Buffer): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // pdfjs は URL 形式（/ 区切り・末尾 /）を要求する — Windows の \ 区切りは不可
  const modRoot = process.cwd().replace(/\\/g, "/");
  const task = pdfjs.getDocument({
    data: new Uint8Array(buf),
    cMapUrl: `${modRoot}/node_modules/pdfjs-dist/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${modRoot}/node_modules/pdfjs-dist/standard_fonts/`,
    verbosity: 0,
  });
  const doc = await task.promise;
  const pages = doc.numPages;
  const parts: string[] = [];
  for (let p = 1; p <= pages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    parts.push(tc.items.map((i) => ("str" in i ? i.str : "")).join(""));
  }
  await task.destroy();
  return { text: parts.join("\n\n"), pages };
}

export function pdfPathFor(issue: KanpoIssue): string {
  const [y, m, d] = issue.date.split("-");
  return path.join(PDF_ROOT, y, m, d, `${issue.id}.pdf`);
}

export function textPathFor(issue: KanpoIssue): string {
  const [y, m, d] = issue.date.split("-");
  return path.join(TEXT_ROOT, y, m, d, `${issue.id}.txt`);
}

export interface ArchiveResult {
  issue: KanpoIssue;
  status: "archived" | "skipped" | "error";
  pdfFile?: string;
  textFile?: string;
  error?: string;
}

/**
 * 1号를 아카이브. 텍스트 파일이 이미 있으면 skip (멱등).
 * forcePdf: 텍스트는 있지만 PDF 원본이 없는 경우(예: 업로드 실패 후 재취득)에
 *           PDF만 다시 내려받아 manifest 에 올린다 (텍스트 재추출은 하지 않음).
 */
export async function archiveIssue(
  issue: KanpoIssue,
  opts: { forcePdf?: boolean } = {}
): Promise<ArchiveResult> {
  const textFile = textPathFor(issue);
  if (fs.existsSync(textFile)) {
    if (!opts.forcePdf) return { issue, status: "skipped", textFile };
    const pdfFile = pdfPathFor(issue);
    if (fs.existsSync(pdfFile)) return { issue, status: "skipped", textFile, pdfFile };
    try {
      const pdf = await fetchBinary(issue.pdfUrl);
      fs.mkdirSync(path.dirname(pdfFile), { recursive: true });
      fs.writeFileSync(pdfFile, pdf);
      return { issue, status: "archived", pdfFile, textFile };
    } catch (e) {
      return { issue, status: "error", error: e instanceof Error ? e.message : String(e) };
    }
  }
  try {
    const pdf = await fetchBinary(issue.pdfUrl);
    const pdfFile = pdfPathFor(issue);
    fs.mkdirSync(path.dirname(pdfFile), { recursive: true });
    fs.writeFileSync(pdfFile, pdf);

    const { text, pages } = await extractPdfText(pdf);
    const header = [
      `# 官報 ${issue.typeLabel} 第${issue.number.replace(/^0+/, "")}号 (${issue.date})`,
      `# id: ${issue.id} / pages: ${pages} / source: ${issue.pdfUrl}`,
      `# archivedAt: ${new Date().toISOString()}`,
      "",
    ].join("\n");
    fs.mkdirSync(path.dirname(textFile), { recursive: true });
    fs.writeFileSync(textFile, header + text, "utf-8");
    return { issue, status: "archived", pdfFile, textFile };
  } catch (e) {
    return { issue, status: "error", error: e instanceof Error ? e.message : String(e) };
  }
}

/* ---------------- 검색 ---------------- */

export interface SearchHit {
  file: string;
  date: string;
  line: string;
}

/** data/kanpo-text/ 전체에서 키워드를 검색 (아카이브 목적의 최소 구현) */
export function searchKanpoText(keyword: string, root = TEXT_ROOT): SearchHit[] {
  if (!fs.existsSync(root)) return [];
  const hits: SearchHit[] = [];
  const walk = (dir: string): void => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith(".txt")) {
        const rel = path.relative(root, p);
        const date = rel.split(path.sep).slice(0, 3).join("-");
        for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
          if (line.includes(keyword)) hits.push({ file: rel, date, line: line.trim().slice(0, 200) });
        }
      }
    }
  };
  walk(root);
  return hits;
}
