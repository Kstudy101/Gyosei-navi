import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { fetchJson } from "@/lib/sources/http";

/**
 * e-Stat API 3.0 래퍼 (TASK-05)
 * 스펙: docs/api/estat-api.md
 *   appId 는 .env.local の ESTAT_APP_ID からのみ読む (C2/C3)
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const BASE = "https://api.e-stat.go.jp/rest/3.0/app/json";
const CACHE = { dir: "estat", ttlMs: 24 * 60 * 60 * 1000 };
export const STATS_DIR = path.join(process.cwd(), "data", "stats");

export function getAppId(): string {
  const id = process.env.ESTAT_APP_ID;
  if (!id) {
    throw new Error(
      [
        "ESTAT_APP_ID 가 설정되어 있지 않습니다.",
        "  1) https://www.e-stat.go.jp/api/ 에서 이용등록 → アプリケーションID 발급 (무료)",
        "  2) .env.local 에 ESTAT_APP_ID=발급받은ID 추가 (커밋 금지)",
        "  3) 다시 실행",
      ].join("\n")
    );
  }
  return id;
}

/* ---------------- 스키마 ---------------- */

const resultSchema = z.object({
  STATUS: z.number(),
  ERROR_MSG: z.string().optional(),
  DATE: z.string().optional(),
});

/** e-Stat JSON은 1건이면 객체, 여러 건이면 배열로 오므로 정규화 */
function oneOrMany<T>(s: z.ZodType<T, z.ZodTypeDef, unknown>): z.ZodType<T[], z.ZodTypeDef, unknown> {
  return z.union([s, z.array(s)]).transform((v): T[] => (Array.isArray(v) ? v : [v]));
}

/** 「文字列」または「{ "$": "文字列", "@code": … }」 → 文字列 */
const nameLike: z.ZodType<string, z.ZodTypeDef, unknown> = z
  .union([z.string(), z.object({ $: z.string() }).passthrough()])
  .transform((v): string => (typeof v === "string" ? v : v.$));

interface TableInf {
  "@id": string;
  STAT_NAME?: string;
  GOV_ORG?: string;
  TITLE?: string;
  SURVEY_DATE?: string | number;
  OPEN_DATE?: string;
  UPDATED_DATE?: string;
  OVERALL_TOTAL_NUMBER?: number;
}

const tableInfSchema: z.ZodType<TableInf, z.ZodTypeDef, unknown> = z
  .object({
    "@id": z.string(),
    STAT_NAME: nameLike.optional(),
    GOV_ORG: nameLike.optional(),
    TITLE: nameLike.optional(),
    SURVEY_DATE: z.union([z.string(), z.number()]).optional(),
    OPEN_DATE: z.string().optional(),
    UPDATED_DATE: z.string().optional(),
    OVERALL_TOTAL_NUMBER: z.number().optional(),
  })
  .passthrough();

const statsListSchema = z.object({
  GET_STATS_LIST: z.object({
    RESULT: resultSchema,
    DATALIST_INF: z
      .object({
        NUMBER: z.number().optional(),
        TABLE_INF: oneOrMany(tableInfSchema).optional(),
      })
      .optional(),
  }),
});

const valueSchema: z.ZodType<Record<string, string | number>> = z
  .object({ $: z.string() })
  .catchall(z.union([z.string(), z.number()]));

/** 分類事典: VALUE の "@cat01": "1010" 등의 코드를 명칭으로 풀기 위한 CLASS_INF */
const classItemSchema = z.object({ "@code": z.string(), "@name": z.string() }).passthrough();
const classObjSchema = z
  .object({
    "@id": z.string(),
    "@name": z.string(),
    CLASS: oneOrMany(classItemSchema),
  })
  .passthrough();

/**
 * RESULT_INF: 1회 요청은 최대 10万건까지만 돌려준다.
 * 더 있으면 NEXT_KEY(다음 レコード 번호)가 붙으므로 startPosition 에 넣어 이어받는다.
 */
const resultInfSchema = z
  .object({
    TOTAL_NUMBER: z.number().optional(),
    FROM_NUMBER: z.number().optional(),
    TO_NUMBER: z.number().optional(),
    NEXT_KEY: z.union([z.number(), z.string()]).optional(),
  })
  .passthrough();

const statsDataSchema = z.object({
  GET_STATS_DATA: z.object({
    RESULT: resultSchema,
    STATISTICAL_DATA: z
      .object({
        RESULT_INF: resultInfSchema.optional(),
        TABLE_INF: tableInfSchema.optional(),
        CLASS_INF: z.object({ CLASS_OBJ: oneOrMany(classObjSchema) }).optional(),
        DATA_INF: z.object({ VALUE: oneOrMany(valueSchema).optional() }).optional(),
      })
      .passthrough()
      .optional(),
  }),
});

function assertOk(result: z.infer<typeof resultSchema>, ctx: string): void {
  // STATUS 0-2 = 성공, 100+ = 오류 (HTTP 200 이어도)
  if (result.STATUS >= 100) {
    throw new Error(`e-Stat API 오류 (${ctx}): STATUS ${result.STATUS} ${result.ERROR_MSG ?? ""}`);
  }
}

/* ---------------- 공개 API ---------------- */

export interface StatsTable {
  statsDataId: string;
  statName: string;
  title: string;
  govOrg: string;
  surveyDate: string;
  openDate: string;
  url: string;
}

export async function searchStats(params: { searchWord: string; limit?: number }): Promise<StatsTable[]> {
  const sp = new URLSearchParams({
    appId: getAppId(),
    searchWord: params.searchWord,
    limit: String(params.limit ?? 30),
  });
  // 검색은 서버 측이 느릴 때가 있다 (「帰化」 등 광범위 매칭어에서 30초 초과 실측, 2026-08-19)
  const raw = await fetchJson(`${BASE}/getStatsList?${sp}`, { cache: CACHE, timeoutMs: 60_000 });
  const parsed = statsListSchema.parse(raw);
  assertOk(parsed.GET_STATS_LIST.RESULT, "getStatsList");
  const tables = parsed.GET_STATS_LIST.DATALIST_INF?.TABLE_INF ?? [];
  return tables.map((t) => ({
    statsDataId: t["@id"],
    statName: t.STAT_NAME ?? "",
    title: t.TITLE ?? "",
    govOrg: t.GOV_ORG ?? "",
    surveyDate: String(t.SURVEY_DATE ?? ""),
    openDate: t.OPEN_DATE ?? "",
    url: `https://www.e-stat.go.jp/dbview?sid=${t["@id"]}`,
  }));
}

export interface StatsDataResult {
  meta: StatsTable & { retrievedAt: string; apiUrl: string };
  /** 축별 코드→명칭 사전 (예: classes.cat01.name="在留資格", .items["1010"]="総数") */
  classes: Record<string, { name: string; items: Record<string, string> }>;
  values: Record<string, string | number>[];
}

export async function getStatsData(statsDataId: string, extra: Record<string, string> = {}): Promise<StatsDataResult> {
  // e-Stat 는 1회 최대 10万건. 이어받지 않으면 대형 통계표가 조용히 잘린다
  // (실증 2026-08-23: 0004019020 은 全191,475건인데 100,000건만 저장돼 있었다).
  // 잘린 통계로 기사를 쓰면 一次情報 원칙이 무너지므로 NEXT_KEY 를 끝까지 따라간다.
  const values: StatsDataResult["values"] = [];
  const classes: StatsDataResult["classes"] = {};
  let t: TableInf | undefined;
  let firstUrl = "";
  let total: number | undefined;
  let startPosition: string | undefined;
  let page = 0;

  do {
    const sp = new URLSearchParams({
      appId: getAppId(),
      statsDataId,
      ...extra,
      ...(startPosition ? { startPosition } : {}),
    });
    const url = `${BASE}/getStatsData?${sp}`;
    if (page === 0) firstUrl = url;
    // 페이지마다 URL 이 달라 캐시 키도 달라진다 (캐시 그대로 활용 가능)
    const raw = await fetchJson(url, { cache: CACHE });
    const parsed = statsDataSchema.parse(raw);
    assertOk(parsed.GET_STATS_DATA.RESULT, "getStatsData");
    const sd = parsed.GET_STATS_DATA.STATISTICAL_DATA;
    t ??= sd?.TABLE_INF;
    total ??= sd?.RESULT_INF?.TOTAL_NUMBER;
    values.push(...(sd?.DATA_INF?.VALUE ?? []));
    // CLASS_INF 는 매 페이지 동일하지만 1회만 채운다
    if (page === 0) {
      for (const c of sd?.CLASS_INF?.CLASS_OBJ ?? []) {
        classes[c["@id"]] = {
          name: c["@name"],
          items: Object.fromEntries(c.CLASS.map((it) => [it["@code"], it["@name"]])),
        };
      }
    }
    const next = sd?.RESULT_INF?.NEXT_KEY;
    startPosition = next === undefined ? undefined : String(next);
    page++;
    if (startPosition) {
      console.log(`  … ${values.length}${total ? `/${total}` : ""}건 취득 (계속)`);
      await sleep(1000); // 절대규칙5: 연속 요청은 1초 간격
    }
  } while (startPosition);

  if (values.length === 0) {
    throw new Error(`데이터가 0건입니다 (statsDataId=${statsDataId}). 조건 또는 ID를 확인하세요.`);
  }
  // 잘림은 침묵시키지 않는다 — 부분 데이터를 전체로 오인하면 기사가 틀린다
  if (total !== undefined && values.length !== total) {
    throw new Error(
      `취득 건수 불일치 (statsDataId=${statsDataId}): ${values.length}건 / 전체 ${total}건. ` +
        `페이징이 중단됐습니다 — 부분 데이터로 기사를 쓰지 말 것.`
    );
  }
  const url = firstUrl;
  return {
    meta: {
      statsDataId,
      statName: t?.STAT_NAME ?? "",
      title: t?.TITLE ?? "",
      govOrg: t?.GOV_ORG ?? "",
      surveyDate: String(t?.SURVEY_DATE ?? ""),
      openDate: t?.OPEN_DATE ?? "",
      url: `https://www.e-stat.go.jp/dbview?sid=${statsDataId}`,
      retrievedAt: new Date().toISOString(),
      apiUrl: url.replace(/appId=[^&]+/, "appId=***"),
    },
    classes,
    values,
  };
}

/** data/stats/ 에 JSON + 메타 저장 (기사 인용용 출처 정보 포함) */
export function saveStats(result: StatsDataResult): { dataFile: string; metaFile: string } {
  fs.mkdirSync(STATS_DIR, { recursive: true });
  const dataFile = path.join(STATS_DIR, `${result.meta.statsDataId}.json`);
  const metaFile = path.join(STATS_DIR, `${result.meta.statsDataId}.meta.json`);
  fs.writeFileSync(dataFile, JSON.stringify(result.values, null, 2), "utf-8");
  fs.writeFileSync(
    metaFile,
    JSON.stringify({ ...result.meta, classes: result.classes }, null, 2),
    "utf-8"
  );
  return { dataFile, metaFile };
}
