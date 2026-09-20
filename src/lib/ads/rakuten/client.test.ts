import { test, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  searchItems,
  getAppId,
  RakutenTimeoutError,
  RakutenHttpStatusError,
  RakutenInvalidResponseError,
  RakutenApiError,
} from "@/lib/ads/rakuten/client";

type FetchStub = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

let originalFetch: typeof globalThis.fetch;
let originalAppId: string | undefined;
let originalAffiliateId: string | undefined;

function stubFetch(fn: FetchStub): void {
  globalThis.fetch = fn as typeof globalThis.fetch;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

before(() => {
  originalFetch = globalThis.fetch;
  originalAppId = process.env.RAKUTEN_APP_ID;
  originalAffiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  process.env.RAKUTEN_APP_ID = "test-app-id";
  process.env.RAKUTEN_AFFILIATE_ID = "test-affiliate-id";
});

after(() => {
  globalThis.fetch = originalFetch;
  if (originalAppId === undefined) delete process.env.RAKUTEN_APP_ID;
  else process.env.RAKUTEN_APP_ID = originalAppId;
  if (originalAffiliateId === undefined) delete process.env.RAKUTEN_AFFILIATE_ID;
  else process.env.RAKUTEN_AFFILIATE_ID = originalAffiliateId;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("getAppId throws a descriptive error when RAKUTEN_APP_ID is missing", () => {
  const saved = process.env.RAKUTEN_APP_ID;
  delete process.env.RAKUTEN_APP_ID;
  try {
    assert.throws(() => getAppId(), RakutenApiError);
  } finally {
    process.env.RAKUTEN_APP_ID = saved;
  }
});

test("정상 상품 조회: valid items are normalized with affiliateUrl", async () => {
  stubFetch(async () =>
    jsonResponse({
      Items: [
        {
          itemName: "テスト商品",
          itemPrice: 1980,
          itemCode: "shop:0001",
          shopName: "テストショップ",
          itemUrl: "https://item.rakuten.co.jp/shop/0001/",
          affiliateUrl: "https://hb.afl.rakuten.co.jp/xxx",
          mediumImageUrls: ["https://image.rakuten.co.jp/shop/0001.jpg"],
        },
      ],
    })
  );
  const items = await searchItems({ keyword: "LED照明" });
  assert.equal(items.length, 1);
  assert.equal(items[0].itemCode, "shop:0001");
  assert.equal(items[0].price, 1980);
  assert.equal(items[0].affiliateUrl, "https://hb.afl.rakuten.co.jp/xxx");
  assert.equal(items[0].imageUrl, "https://image.rakuten.co.jp/shop/0001.jpg");
});

test("Empty Result: 0件は例外にならず空配列を返す", async () => {
  stubFetch(async () => jsonResponse({ Items: [] }));
  const items = await searchItems({ keyword: "存在しないキーワード" });
  assert.deepEqual(items, []);
});

test("Affiliate URL 누락: affiliateUrl が無い商品は除外される", async () => {
  stubFetch(async () =>
    jsonResponse({
      Items: [
        {
          itemName: "アフィリエイトリンク無し商品",
          itemPrice: 1000,
          itemCode: "shop:0002",
          shopName: "テストショップ",
          itemUrl: "https://item.rakuten.co.jp/shop/0002/",
          mediumImageUrls: [],
        },
      ],
    })
  );
  const items = await searchItems({ keyword: "何か" });
  assert.deepEqual(items, []);
});

test("4xx: HTTP 400 は RakutenHttpStatusError", async () => {
  stubFetch(async () => new Response(JSON.stringify({ error: "wrong_parameter" }), { status: 400 }));
  await assert.rejects(() => searchItems({ keyword: "何か" }), (e: unknown) => {
    assert.ok(e instanceof RakutenHttpStatusError);
    assert.equal(e.status, 400);
    return true;
  });
});

test("5xx: HTTP 500 は RakutenHttpStatusError", async () => {
  stubFetch(async () => new Response("internal error", { status: 500 }));
  await assert.rejects(() => searchItems({ keyword: "何か" }), (e: unknown) => {
    assert.ok(e instanceof RakutenHttpStatusError);
    assert.equal(e.status, 500);
    return true;
  });
});

test("API timeout: AbortSignal.timeout 相当のエラーは RakutenTimeoutError", async () => {
  stubFetch(async () => {
    const err = new Error("The operation was aborted");
    err.name = "TimeoutError";
    throw err;
  });
  await assert.rejects(() => searchItems({ keyword: "何か" }), RakutenTimeoutError);
});

test("Invalid response: スキーマ不一致は RakutenInvalidResponseError", async () => {
  stubFetch(async () => jsonResponse({ Items: [{ itemName: "不完全なデータ" }] }));
  await assert.rejects(() => searchItems({ keyword: "何か" }), RakutenInvalidResponseError);
});
