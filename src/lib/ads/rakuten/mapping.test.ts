import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORY_CODES } from "@/config/taxonomy";
import { getAdKeywords, subsidyCategoryAdMapping } from "@/lib/ads/rakuten/mapping";

test("既存の全カテゴリ（config/taxonomy.ts）に商品キーワードが定義されている", () => {
  for (const code of CATEGORY_CODES) {
    const keywords = getAdKeywords(code);
    assert.ok(keywords.length > 0, `category "${code}" にキーワードが無い`);
  }
});

test("IT/創業カテゴリ(sogyo) → 事業者向けキーワード", () => {
  const keywords = getAdKeywords("sogyo");
  assert.ok(keywords.some((k) => /デスク|チェア|プリンター|タブレット/.test(k)));
});

test("省エネカテゴリ(energy) → 省エネ関連キーワード", () => {
  const keywords = getAdKeywords("energy");
  assert.ok(keywords.some((k) => /LED|省エネ|エアコン/.test(k)));
});

test("出産・育児カテゴリ(shussan) → 育児用品キーワード", () => {
  const keywords = getAdKeywords("shussan");
  assert.ok(keywords.some((k) => /ベビー|チャイルドシート|抱っこ紐/.test(k)));
});

test("未定義カテゴリは空配列（広告非表示として扱われる）", () => {
  assert.deepEqual(getAdKeywords("unknown-category"), []);
});

test("マッピングは唯一の管理箇所 — 直接オブジェクトからも同じ値が読める", () => {
  assert.deepEqual(getAdKeywords("jutaku"), subsidyCategoryAdMapping.jutaku);
});
