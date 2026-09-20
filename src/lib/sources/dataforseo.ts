import { z } from "zod";
import { fetchJson } from "@/lib/sources/http";

/**
 * DataForSEO Keywords Data API（Google Ads検索ボリューム）クライアント。
 * ranking セクション（/ranking）のキーワード発掘専用 — 記事本文の生成には使わない。
 * 認証: .env.local の DataForSEO（"login:password" を base64 化した値。DataForSEO の Basic Auth 仕様通り）。
 */

const API_BASE = "https://api.dataforseo.com/v3";
const LOCATION_CODE_JAPAN = 2392;
const LANGUAGE_CODE = "ja";

function authHeader(): string {
  const token = process.env.DataForSEO;
  if (!token) throw new Error(".env.local に DataForSEO（Basic認証トークン）が設定されていません");
  return `Basic ${token}`;
}

const keywordInfoSchema = z.object({
  keyword: z.string(),
  search_volume: z.number().nullable(),
});

const taskResultSchema = z.object({
  status_code: z.number(),
  status_message: z.string(),
  result: z.array(keywordInfoSchema).nullable(),
});

const responseSchema = z.object({
  status_code: z.number(),
  status_message: z.string(),
  tasks: z.array(taskResultSchema).nullable(),
});

export interface KeywordVolume {
  keyword: string;
  searchVolume: number;
}

/**
 * 指定した種キーワード群に関連する検索キーワードを検索ボリューム降順で取得する
 * （keywords_for_keywords/live、Google Ads データソース）。
 */
export async function fetchRelatedKeywords(seedKeywords: string[]): Promise<KeywordVolume[]> {
  const raw = await fetchJson(`${API_BASE}/keywords_data/google_ads/keywords_for_keywords/live`, {
    method: "POST",
    headers: { authorization: authHeader(), "content-type": "application/json" },
    body: JSON.stringify([
      {
        keywords: seedKeywords,
        location_code: LOCATION_CODE_JAPAN,
        language_code: LANGUAGE_CODE,
        sort_by: "search_volume",
      },
    ]),
  });

  const parsed = responseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`DataForSEO 応答パース失敗:\n${JSON.stringify(raw).slice(0, 500)}`);
  }
  if (parsed.data.status_code !== 20000) {
    throw new Error(`DataForSEO API エラー: ${parsed.data.status_code} ${parsed.data.status_message}`);
  }

  const task = parsed.data.tasks?.[0];
  if (!task || task.status_code !== 20000) {
    throw new Error(`DataForSEO タスクエラー: ${task?.status_code} ${task?.status_message}`);
  }

  return (task.result ?? [])
    .filter((r): r is { keyword: string; search_volume: number } => r.search_volume !== null)
    .map((r) => ({ keyword: r.keyword, searchVolume: r.search_volume }))
    .sort((a, b) => b.searchVolume - a.searchVolume);
}
