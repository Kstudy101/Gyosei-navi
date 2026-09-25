import { test } from "node:test";
import assert from "node:assert/strict";
import { matchAdvertisers, type MatchTarget } from "@/lib/ads/valuecommerce/match";
import { advertisers } from "@/lib/ads/valuecommerce/advertisers";

const base: MatchTarget = { title: "", description: "", tags: [], targetKeywords: [], body: "" };

test("無関係な記事は広告なし", () => {
  const r = matchAdvertisers({ ...base, title: "創業補助金の申請手順", category: "sogyo", body: "事業計画書を提出する" });
  assert.deepEqual(r, []);
});

test("本文の単発ヒット（1点）だけでは出さない", () => {
  const r = matchAdvertisers({ ...base, title: "住宅リフォーム補助金", body: "旅行の話が一度だけ出る" });
  assert.deepEqual(r, []);
});

test("タイトルに旅行系語があればじゃらん", () => {
  const r = matchAdvertisers({ ...base, title: "旅行支援クーポンの対象宿泊施設" });
  assert.equal(r[0]?.id, "jalan");
});

test("出産カテゴリは大丸松坂屋（カテゴリ一致）", () => {
  const r = matchAdvertisers({ ...base, title: "出産育児一時金", category: "shussan" });
  assert.equal(r[0]?.id, "daimaru-matsuzakaya");
});

test("看護師関連の記事はスーパーナース", () => {
  const r = matchAdvertisers({ ...base, title: "看護師の修学資金貸付制度", description: "看護師を目指す人向けの貸付" });
  assert.equal(r[0]?.id, "supernurse");
});

test("介護カテゴリはスーパーナース（カテゴリ一致）", () => {
  const r = matchAdvertisers({ ...base, title: "介護保険サービス利用料の助成", category: "kaigo" });
  assert.equal(r[0]?.id, "supernurse");
});

test("ベビー用品がタイトルにあればYahoo!ショッピング", () => {
  const r = matchAdvertisers({ ...base, title: "ベビー用品の購入費を助成する制度" });
  assert.equal(r[0]?.id, "yahoo-shopping");
});

test("最大2件まで", () => {
  const r = matchAdvertisers({
    ...base,
    title: "出産祝いと旅行",
    tags: ["ギフト", "宿泊"],
    category: "shussan",
  });
  assert.ok(r.length <= 2);
});

test("レジストリの id は一意・URLは https", () => {
  assert.equal(new Set(advertisers.map((a) => a.id)).size, advertisers.length);
  for (const a of advertisers) {
    assert.ok(a.url.startsWith("https://"), a.id);
    if (a.image) assert.ok(a.image.src.startsWith("/") || a.image.src.startsWith("https://"), `${a.id} image`);
  }
});
