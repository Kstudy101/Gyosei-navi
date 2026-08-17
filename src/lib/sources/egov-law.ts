import { z } from "zod";
import { fetchJson, HttpError } from "@/lib/sources/http";
import { toKanji } from "@/lib/sources/jp-number";

/**
 * e-Gov 法令API Version 2 래퍼
 * 스펙 조사 결과: docs/api/egov-law-api.md
 *   Base: https://laws.e-gov.go.jp/api/2
 *   인증 불필요 / 요청 간 1초 (http.ts가 보장) / 캐시 24h (.cache/egov/)
 */

const BASE = "https://laws.e-gov.go.jp/api/2";
const CACHE = { dir: "egov", ttlMs: 24 * 60 * 60 * 1000 };

/* ------------------------------------------------------------------ */
/* zod 스키마 (실측 응답 기준. 알 수 없는 필드는 passthrough)            */
/* ------------------------------------------------------------------ */

const lawInfoSchema = z
  .object({
    law_type: z.string(),
    law_id: z.string(),
    law_num: z.string(),
    promulgation_date: z.string().nullable().optional(),
  })
  .passthrough();

const revisionInfoSchema = z
  .object({
    law_revision_id: z.string(),
    law_title: z.string(),
    law_title_kana: z.string().nullable().optional(),
    amendment_enforcement_date: z.string().nullable().optional(),
    current_revision_status: z.string().nullable().optional(),
    repeal_status: z.string().nullable().optional(),
  })
  .passthrough();

const lawsResponseSchema = z.object({
  total_count: z.number(),
  count: z.number(),
  laws: z.array(
    z.object({
      law_info: lawInfoSchema,
      revision_info: revisionInfoSchema,
      current_revision_info: revisionInfoSchema.nullable().optional(),
    })
  ),
});

const errorInfoSchema = z.object({
  code: z.union([z.string(), z.number()]).optional(),
  message: z.string().optional(),
});

/**
 * json_format=light 의 law_full_text 는 요소별 구조가 다르므로
 * 트리 전체를 관대하게 받고 텍스트는 재귀 추출한다 (N3: 원문 무가공).
 */
const jsonTree: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.null(), z.array(jsonTree), z.record(jsonTree)])
);

const lawDataResponseSchema = z.object({
  law_info: lawInfoSchema,
  revision_info: revisionInfoSchema,
  law_full_text: jsonTree,
});

/* ------------------------------------------------------------------ */
/* 공개 타입                                                            */
/* ------------------------------------------------------------------ */

export interface LawSummary {
  lawId: string;
  lawNumber: string;
  lawTitle: string;
  lawType: string;
  revisionId: string;
  promulgationDate: string | null;
  enforcementDate: string | null;
  status: string | null;
}

export interface LawDocument {
  lawId: string;
  lawNumber: string;
  lawTitle: string;
  revisionId: string;
  /** law_full_text (light JSON) 원형 그대로 */
  fullText: unknown;
  retrievedAt: string;
}

export interface LawArticle {
  lawId: string;
  lawTitle: string;
  lawNumber: string;
  /** 条番号 표기 (예 「第十九条」) */
  articleTitle: string;
  /** 条見出し (예 「（業務の制限）」). 없으면 "" */
  articleCaption: string;
  /** 条文原文 프레인텍스트 (項 단위 개행). 원문 무가공 */
  text: string;
  /** e-Gov 法令検索 該当条文 URL — legalBasis에 그대로 사용 */
  sourceUrl: string;
  retrievedAt: string;
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

function q(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") sp.set(k, v);
  return sp.toString();
}

async function callApi(pathAndQuery: string): Promise<unknown> {
  try {
    return await fetchJson(`${BASE}${pathAndQuery}`, { cache: CACHE });
  } catch (e) {
    if (e instanceof HttpError) {
      // 400 계열은 error_info 를 담고 있으므로 메시지를 뽑아 준다
      try {
        const info = errorInfoSchema.parse(JSON.parse(e.bodySnippet));
        throw new Error(`e-Gov API ${e.status}: ${info.message ?? "(no message)"} [${pathAndQuery}]`);
      } catch (inner) {
        if (inner instanceof Error && inner.message.startsWith("e-Gov API")) throw inner;
      }
    }
    throw e;
  }
}

function toSummary(entry: z.infer<typeof lawsResponseSchema>["laws"][number]): LawSummary {
  const rev = entry.current_revision_info ?? entry.revision_info;
  return {
    lawId: entry.law_info.law_id,
    lawNumber: entry.law_info.law_num,
    lawTitle: rev.law_title,
    lawType: entry.law_info.law_type,
    revisionId: rev.law_revision_id,
    promulgationDate: entry.law_info.promulgation_date ?? null,
    enforcementDate: rev.amendment_enforcement_date ?? null,
    status: rev.current_revision_status ?? null,
  };
}

/** 법령 검색 (/laws) */
export async function searchLaws(params: {
  keyword?: string;
  lawTitle?: string;
  asOf?: string;
}): Promise<LawSummary[]> {
  // /laws 는 법령명 검색. keyword 는 법령명 부분일치로 취급 (본문 검색은 /keyword — 별도)
  const title = params.lawTitle ?? params.keyword;
  const query = q({ law_title: title, asof: params.asOf, response_format: "json" });
  const raw = await callApi(`/laws?${query}`);
  const parsed = lawsResponseSchema.parse(raw);
  return parsed.laws.map(toSummary);
}

/**
 * 법령명 → 법령ID 해결.
 *   - 이미 법령ID 형식(영숫자 15자)이면 그대로
 *   - 부분일치 결과 중 완전일치 우선, 폐지법령 제외
 */
export async function resolveLawId(lawIdOrTitle: string, asOf?: string): Promise<LawSummary> {
  if (/^[0-9]{3}[A-Z]{2}[0-9A-Z]{10}$/.test(lawIdOrTitle)) {
    const list = await searchLaws({ lawTitle: undefined, asOf });
    const hit = list.find((l) => l.lawId === lawIdOrTitle);
    if (hit) return hit;
    // 일람에 없어도 ID 자체는 유효할 수 있으므로 최소 정보로 반환
    return {
      lawId: lawIdOrTitle,
      lawNumber: "",
      lawTitle: lawIdOrTitle,
      lawType: "",
      revisionId: "",
      promulgationDate: null,
      enforcementDate: null,
      status: null,
    };
  }
  const list = await searchLaws({ lawTitle: lawIdOrTitle, asOf });
  const alive = list.filter((l) => l.status !== "Repealed" && l.status !== "Expired");
  const exact = alive.find((l) => l.lawTitle === lawIdOrTitle);
  if (exact) return exact;
  if (alive.length === 1) return alive[0];
  if (alive.length === 0) {
    throw new Error(`법령을 찾을 수 없습니다: 「${lawIdOrTitle}」`);
  }
  const names = alive.map((l) => `  - ${l.lawTitle} (${l.lawId})`).join("\n");
  throw new Error(
    `법령명이 여러 건에 부분일치합니다. 정식 명칭 또는 법령ID를 지정하세요:\n${names}`
  );
}

/** 법령 전문 취득 (/law_data) — 대형 법령은 크므로 조 단위 getArticle 을 권장 */
export async function getLaw(lawId: string, asOf?: string): Promise<LawDocument> {
  const query = q({ asof: asOf, json_format: "light", response_format: "json" });
  const raw = await callApi(`/law_data/${encodeURIComponent(lawId)}?${query}`);
  const parsed = lawDataResponseSchema.parse(raw);
  return {
    lawId: parsed.law_info.law_id,
    lawNumber: parsed.law_info.law_num,
    lawTitle: parsed.revision_info.law_title,
    revisionId: parsed.revision_info.law_revision_id,
    fullText: parsed.law_full_text,
    retrievedAt: new Date().toISOString(),
  };
}

/* ---- 조문 텍스트 추출 (light JSON) ---- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** 노드 아래의 모든 Sentence 문자열을 문서 순서대로 수집 */
function collectSentences(node: unknown, out: string[]): void {
  if (typeof node === "string") {
    out.push(node);
  } else if (Array.isArray(node)) {
    for (const n of node) collectSentences(n, out);
  } else if (isRecord(node)) {
    for (const [k, v] of Object.entries(node)) {
      // 番号・見出し 계열은 본문 문장이 아니므로 제외 (Title/Caption/Num)
      if (/(Title|Caption|Num)$/.test(k)) continue;
      collectSentences(v, out);
    }
  }
}

function paragraphToLines(paragraph: Record<string, unknown>): string[] {
  const num = typeof paragraph.ParagraphNum === "string" ? paragraph.ParagraphNum : "";
  const sentences: string[] = [];
  collectSentences(paragraph.ParagraphSentence, sentences);
  const head = `${num ? num + "　" : ""}${sentences.join("")}`;
  const lines = [head];

  const items = paragraph.Item;
  const itemList = Array.isArray(items) ? items : items ? [items] : [];
  for (const item of itemList) {
    if (!isRecord(item)) continue;
    const title = typeof item.ItemTitle === "string" ? item.ItemTitle : "";
    const s: string[] = [];
    collectSentences(item.ItemSentence, s);
    lines.push(`${title ? title + "　" : ""}${s.join("")}`);
    // 号細分 (Subitem1…)
    for (const key of ["Subitem1", "Subitem2", "Subitem3"]) {
      const subs = item[key];
      const subList = Array.isArray(subs) ? subs : subs ? [subs] : [];
      for (const sub of subList) {
        if (!isRecord(sub)) continue;
        const st = typeof sub[`${key}Title`] === "string" ? (sub[`${key}Title`] as string) : "";
        const ss: string[] = [];
        collectSentences(sub[`${key}Sentence`], ss);
        lines.push(`　${st ? st + "　" : ""}${ss.join("")}`);
      }
    }
  }
  return lines;
}

/** e-Gov 法令検索 조문 앵커: 第19条 → Mp-At_19, 第19条の3 → Mp-At_19_3 */
export function articleAnchor(articleNumber: string): string {
  const parts = articleNumber.split(/[_\-]/).map((p) => p.trim()).filter(Boolean);
  return `Mp-At_${parts.join("_")}`;
}

/** 조 번호 문자열 → elm 표기 및 표시용 漢数字 (「19」「19-3」「19_3」 허용) */
function parseArticleNumber(articleNumber: string): { elm: string; kanji: string } {
  const parts = articleNumber.split(/[_\-]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0 || parts.some((p) => !/^\d+$/.test(p))) {
    throw new Error(`조 번호 형식 오류: 「${articleNumber}」 (예: 19, 19-3)`);
  }
  const elm = `Article_${parts.join("_")}`;
  const kanji = parts.map((p, i) => (i === 0 ? toKanji(Number(p)) : `の${toKanji(Number(p))}`)).join("");
  return { elm, kanji };
}

/**
 * 조문 단위 취득 — 기사 인용의 핵심 함수
 *   getArticle("行政書士法", "19") → 제19조 원문
 *   getArticle("行政書士法", "19-3") → 제19조の3
 *   opts.paragraph 지정 시 해당 項만
 */
export async function getArticle(
  lawIdOrTitle: string,
  articleNumber: string,
  opts: { paragraph?: string; asOf?: string } = {}
): Promise<LawArticle> {
  const law = await resolveLawId(lawIdOrTitle, opts.asOf);
  const { elm: articleElm, kanji } = parseArticleNumber(articleNumber);
  const elm = opts.paragraph
    ? `MainProvision-${articleElm}-Paragraph_${opts.paragraph}`
    : `MainProvision-${articleElm}`;

  const query = q({ elm, asof: opts.asOf, json_format: "light", response_format: "json" });
  let raw: unknown;
  try {
    raw = await callApi(`/law_data/${encodeURIComponent(law.lawId)}?${query}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`${law.lawTitle} 第${kanji}条${opts.paragraph ? `第${opts.paragraph}項` : ""} 취득 실패: ${msg}`);
  }
  const parsed = lawDataResponseSchema.parse(raw);
  const full = parsed.law_full_text;

  // light JSON: { Article: {...} } 또는 { Paragraph: {...} } (項 지정 시)
  if (!isRecord(full)) throw new Error("law_full_text 형식이 예상과 다릅니다 (object 아님)");

  let articleTitle = `第${kanji}条`;
  let articleCaption = "";
  const lines: string[] = [];

  const articleNode = full.Article;
  const paragraphNode = full.Paragraph;

  if (isRecord(articleNode)) {
    if (typeof articleNode.ArticleTitle === "string") articleTitle = articleNode.ArticleTitle;
    if (typeof articleNode.ArticleCaption === "string") articleCaption = articleNode.ArticleCaption;
    const ps = articleNode.Paragraph;
    const list = Array.isArray(ps) ? ps : ps ? [ps] : [];
    for (const p of list) if (isRecord(p)) lines.push(...paragraphToLines(p));
  } else if (paragraphNode !== undefined) {
    const list = Array.isArray(paragraphNode) ? paragraphNode : [paragraphNode];
    for (const p of list) if (isRecord(p)) lines.push(...paragraphToLines(p));
  } else {
    throw new Error(
      `조문을 찾을 수 없습니다: ${law.lawTitle} 第${kanji}条 (응답에 Article/Paragraph 없음)`
    );
  }

  if (lines.join("").trim() === "") {
    throw new Error(`조문 본문이 비어 있습니다: ${law.lawTitle} 第${kanji}条`);
  }

  return {
    lawId: law.lawId,
    lawTitle: parsed.revision_info.law_title,
    lawNumber: parsed.law_info.law_num,
    articleTitle,
    articleCaption,
    text: lines.join("\n"),
    sourceUrl: `https://laws.e-gov.go.jp/law/${law.lawId}#${articleAnchor(articleNumber)}`,
    retrievedAt: new Date().toISOString(),
  };
}

/** frontmatter legalBasis 항목 생성 */
export function toLegalBasis(a: LawArticle): { label: string; url: string; accessedAt: string } {
  return {
    label: `${a.lawTitle} ${a.articleTitle}${a.articleCaption}`,
    url: a.sourceUrl,
    accessedAt: a.retrievedAt.slice(0, 10),
  };
}

/** MDX 인용 블록 (docs/07 TASK-01 CLI 사양 형식) */
export function toMdxQuote(a: LawArticle): string {
  const date = a.retrievedAt.slice(0, 10);
  const body = a.text
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");
  return [
    `> 【${a.lawTitle} ${a.articleTitle}${a.articleCaption}】`,
    body,
    `>`,
    `> ― 出典: [e-Gov法令検索](${a.sourceUrl})（${date} 取得）`,
  ].join("\n");
}
