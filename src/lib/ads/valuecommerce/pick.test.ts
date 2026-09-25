import { test } from "node:test";
import assert from "node:assert/strict";
import { pickAdvertisers, SLOT_COUNT } from "@/lib/ads/valuecommerce/pick";
import { advertisers } from "@/lib/ads/valuecommerce/advertisers";

test("同じ seed なら同じ結果（決定的）", () => {
  assert.deepEqual(pickAdvertisers("a-2026-09-25"), pickAdvertisers("a-2026-09-25"));
});

test("SLOT_COUNT 件・重複なし", () => {
  const r = pickAdvertisers("x");
  assert.equal(r.length, SLOT_COUNT);
  assert.equal(new Set(r.map((a) => a.id)).size, SLOT_COUNT);
});

test("seed を変えると全広告主がまんべんなく選ばれる", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 500; i++) for (const a of pickAdvertisers(`slug-${i}`)) seen.add(a.id);
  assert.equal(seen.size, advertisers.length);
});

test("広告主が SLOT_COUNT 未満でも落ちない", () => {
  assert.equal(pickAdvertisers("x", advertisers.slice(0, 1)).length, 1);
});

test("レジストリの id は一意・URLは https・画像パスは妥当", () => {
  assert.equal(new Set(advertisers.map((a) => a.id)).size, advertisers.length);
  for (const a of advertisers) {
    assert.ok(a.url.startsWith("https://"), a.id);
    if (a.image) assert.ok(a.image.src.startsWith("/") || a.image.src.startsWith("https://"), `${a.id} image`);
  }
});
