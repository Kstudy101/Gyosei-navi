import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORY_CODES } from "@/config/taxonomy";
import { getAdKeywords, subsidyCategoryAdMapping, inferCategoryFromText } from "@/lib/ads/rakuten/mapping";

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

test("inferCategoryFromText: タイトル文から既存カテゴリを推測できる（/ranking 用）", () => {
  assert.equal(inferCategoryFromText("家庭用蓄電池補助金の上限額が高い都道府県TOP5"), "energy");
  assert.equal(inferCategoryFromText("出産祝い金・子育て支援金が高額な自治体TOP5"), "shussan");
  assert.equal(inferCategoryFromText("小規模事業者持続化補助金、補助上限額が高い枠TOP5"), "sogyo");
});

test("inferCategoryFromText: どのカテゴリにも一致しない場合は null（広告なし）", () => {
  assert.equal(inferCategoryFromText("一律給付金の1人あたり支給額が高い自治体TOP5"), null);
});
