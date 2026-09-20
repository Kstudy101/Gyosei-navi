import { z } from "zod";
import { fetchJson, HttpError } from "@/lib/sources/http";
import type { RakutenProduct } from "@/lib/ads/rakuten/types";

/**
 * Rakuten Web Service — IchibaItem/Search 래퍼（作業指示書 §3 RakutenApiClient）。
 * ビルド前の取得スクリプト（scripts/fetch-rakuten-products.ts）専用。
 * RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY は Node（スクリプト）context でのみ読む — クライアントバンドルには一切含まれない。
 *
 * 2026-02 API 移行: 旧エンドポイント(app.rakuten.co.jp/services/api)は 2026-05-14 に完全停止。
 * 新エンドポイント(openapi.rakuten.co.jp/ichibams/api)は applicationId に加えて accessKey も必須。
 */
const SEARCH_ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";

export class RakutenApiError extends Error {}
export class RakutenTimeoutError extends RakutenApiError {}
export class RakutenHttpStatusError extends RakutenApiError {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}
export class RakutenInvalidResponseError extends RakutenApiError {}

export function getAppId(): string {
  const id = process.env.RAKUTEN_APP_ID;
  if (!id) {
    throw new RakutenApiError(
      [
        "RAKUTEN_APP_ID가 설정되어 있지 않습니다.",
        "  1) https://webservice.rakuten.co.jp/app/list 에서 アプリID 발급 (무료)",
        "  2) .env.local 에 RAKUTEN_APP_ID=발급받은ID 추가 (커밋 금지)",
        "  3) 다시 실행",
      ].join("\n")
    );
  }
  return id;
}

/** 2026-02 API 이전 후 필수 — applicationId만으로는 wrong_parameter 에러 발생 */
export function getAccessKey(): string {
  const key = process.env.RAKUTEN_ACCESS_KEY;
  if (!key) {
    throw new RakutenApiError(
      [
        "RAKUTEN_ACCESS_KEY가 설정되어 있지 않습니다.",
        "  1) https://webservice.rakuten.co.jp/app/list 에서 Access Key 확인 (아이콘 클릭 시 표시)",
        "  2) .env.local 에 RAKUTEN_ACCESS_KEY=발급받은Key 추가 (커밋 금지)",
        "  3) 다시 실행",
      ].join("\n")
    );
  }
  return key;
}

/** 미설정이어도 예외를 던지지 않음 — affiliateId 없이도 검색 자체는 가능하므로 */
export function getAffiliateId(): string | undefined {
  return process.env.RAKUTEN_AFFILIATE_ID || undefined;
}

/**
 * 2026-02 API 移行後、リクエストの Referer/Origin と楽天ウェブサービス側に登録した
 * Application URL が一致しないと 403 REQUEST_CONTEXT_BODY_HTTP_REFERRER_MISSING になる。
 * https://webservice.rakuten.co.jp/app/list に登録した Application URL と同じ値を使うこと。
 */
export function getAppReferer(): string {
  const referer = process.env.RAKUTEN_APP_REFERER;
  if (!referer) {
    throw new RakutenApiError(
      [
        "RAKUTEN_APP_REFERER가 설정되어 있지 않습니다.",
        "  1) https://webservice.rakuten.co.jp/app/list 에서 앱의 Application URL 확인",
        "  2) .env.local 에 RAKUTEN_APP_REFERER=해당URL 추가",
        "  3) 다시 실행",
      ].join("\n")
    );
  }
  return referer;
}

const itemSchema = z
  .object({
    itemName: z.string(),
    itemPrice: z.number(),
    itemCode: z.string(),
    shopName: z.string(),
    itemUrl: z.string().url(),
    /** affiliateId 파라미터를 넘겼을 때만 응답에 포함됨 — 없으면 이 상품은 채택하지 않는다 */
    affiliateUrl: z.string().url().optional(),
    mediumImageUrls: z.array(z.string()).default([]),
  })
  .passthrough();

const searchResponseSchema = z
  .object({
    Items: z.array(itemSchema).default([]),
  })
  .passthrough();

const errorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

export interface SearchItemsParams {
  keyword: string;
  hits?: number;
  page?: number;
  timeoutMs?: number;
}

/**
 * 상품 검색. 실패는 항상 RakutenApiError(혹은 하위 클래스)로 throw —
 * 호출측(취득 스크립트)이 카테고리별로 catch해서 개별 처리한다.
 * 빈 결과는 예외가 아니라 빈 배열로 정상 반환한다.
 */
export async function searchItems({
  keyword,
  hits = 10,
  page = 1,
  timeoutMs = 8000,
}: SearchItemsParams): Promise<RakutenProduct[]> {
  const params = new URLSearchParams({
    applicationId: getAppId(),
    accessKey: getAccessKey(),
    keyword,
    hits: String(Math.min(Math.max(hits, 1), 30)),
    page: String(page),
    formatVersion: "2",
    imageFlag: "1",
    availability: "1",
  });
  const affiliateId = getAffiliateId();
  if (affiliateId) params.set("affiliateId", affiliateId);

  const referer = getAppReferer();

  let raw: unknown;
  try {
    raw = await fetchJson(`${SEARCH_ENDPOINT}?${params.toString()}`, {
      timeoutMs,
      headers: { referer, origin: new URL(referer).origin },
    });
  } catch (e) {
    if (e instanceof HttpError) {
      throw new RakutenHttpStatusError(e.status, `Rakuten API HTTP ${e.status}: ${e.bodySnippet}`);
    }
    if (e instanceof Error && e.name === "TimeoutError") {
      throw new RakutenTimeoutError(`Rakuten API timeout (${timeoutMs}ms): keyword="${keyword}"`);
    }
    throw new RakutenApiError(`Rakuten API 요청 실패: ${e instanceof Error ? e.message : String(e)}`);
  }

  const errParsed = errorResponseSchema.safeParse(raw);
  if (errParsed.success) {
    throw new RakutenApiError(
      `Rakuten API error: ${errParsed.data.error} — ${errParsed.data.error_description ?? ""}`
    );
  }

  const parsed = searchResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new RakutenInvalidResponseError(`Rakuten API 응답 형식이 예상과 다릅니다: ${parsed.error.message}`);
  }

  return parsed.data.Items.filter((it) => it.affiliateUrl && it.itemPrice > 0).map((it) => ({
    itemCode: it.itemCode,
    name: it.itemName,
    price: it.itemPrice,
    imageUrl: it.mediumImageUrls[0] ?? null,
    shopName: it.shopName,
    affiliateUrl: it.affiliateUrl!,
  }));
}
