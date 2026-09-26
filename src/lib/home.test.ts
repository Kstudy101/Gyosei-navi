/**
 * ホーム（くらしの便利帳型）のデータ組み立ての仕様テスト。実コンテンツ（content/）で検証する。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PREFECTURES, REGION_BLOCKS } from "@/config/regions";
import { CATEGORIES } from "@/config/taxonomy";
import { getArticlesByPrefecture, getArticlesBySection } from "@/lib/content";
import {
  buildRegionIndex,
  daysUntil,
  getCategoryIndex,
  getRecentlyUpdatedArticles,
  getSiteStats,
} from "@/lib/home";

Object.assign(process.env, { NODE_ENV: "production" });

test("REGION_BLOCKS: 8地方で47都道府県をちょうど1回ずつ含む", () => {
  assert.equal(REGION_BLOCKS.length, 8);
  const codes = REGION_BLOCKS.flatMap((b) => b.prefCodes);
  assert.equal(codes.length, 47);
  assert.deepEqual([...codes].sort(), PREFECTURES.map((p) => p.code).sort());
});

test("buildRegionIndex: 地方ごとに都道府県と掲載件数・市区町村数を返す", () => {
  const index = buildRegionIndex();
  assert.equal(index.length, 8);
  const tokyo = index.flatMap((b) => b.prefectures).find((p) => p.slug === "tokyo")!;
  assert.equal(tokyo.articleCount, getArticlesByPrefecture("13").length);
  assert.ok(tokyo.articleCount > 0);
  assert.ok(tokyo.municipalityCount > 0, "記事のある市区町村数");
  const total = index.flatMap((b) => b.prefectures).length;
  assert.equal(total, 47);
});

test("daysUntil: 今日は0、明日は1、過去は負", () => {
  assert.equal(daysUntil("2026-09-26", "2026-09-26"), 0);
  assert.equal(daysUntil("2026-09-27", "2026-09-26"), 1);
  assert.equal(daysUntil("2026-10-10", "2026-09-26"), 14);
  assert.equal(daysUntil("2026-09-25", "2026-09-26"), -1);
});

test("getRecentlyUpdatedArticles: 初版以降に更新された subsidy 記事を updatedAt 降順で返す", () => {
  const list = getRecentlyUpdatedArticles(5);
  assert.ok(list.length > 0);
  for (const a of list) {
    assert.equal(a.section, "subsidy");
    assert.ok(a.frontmatter.updatedAt > a.frontmatter.publishedAt, a.frontmatter.slug);
  }
  for (let i = 1; i < list.length; i++) {
    assert.ok(list[i - 1].frontmatter.updatedAt >= list[i].frontmatter.updatedAt);
  }
});

test("getCategoryIndex: 9カテゴリと published subsidy 件数", () => {
  const index = getCategoryIndex();
  assert.equal(index.length, CATEGORIES.length);
  const shussan = index.find((c) => c.code === "shussan")!;
  assert.equal(shussan.articleCount, getArticlesBySection("subsidy", "shussan").length);
});

test("getSiteStats: 制度数・都道府県数・市区町村数・最終更新日", () => {
  const s = getSiteStats();
  assert.equal(s.subsidyCount, getArticlesBySection("subsidy").length);
  assert.ok(s.prefectureCount > 0 && s.prefectureCount <= 47);
  assert.ok(s.municipalityCount > 0);
  assert.match(s.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
});

test("formatJaDate / formatMonthDay: 便利帳の表記（先頭ゼロなし）", async () => {
  const { formatJaDate, formatMonthDay } = await import("@/lib/home");
  assert.equal(formatJaDate("2026-09-06"), "2026年9月6日");
  assert.equal(formatMonthDay("2026-10-10"), "10月10日");
});

test("shortRegionLabel: 括弧書きの編集注記を落とし、地域名だけにする", async () => {
  const { shortRegionLabel } = await import("@/lib/home");
  assert.equal(shortRegionLabel("徳島県（県単独事業。県内全域が対象）"), "徳島県");
  assert.equal(shortRegionLabel("大阪府大阪市淀川区（大阪市統一制度）"), "大阪府大阪市淀川区");
  assert.equal(shortRegionLabel("東京都世田谷区"), "東京都世田谷区");
  assert.equal(shortRegionLabel("全国共通（プレースホルダ）"), "全国共通");
});

test("groupDeadlines: 同じ締切日はまとめ、日付ごとの上限を超えた分は「ほかN件」として数える", async () => {
  const { groupDeadlines } = await import("@/lib/home");
  const mk = (slug: string, periodEnd: string) =>
    ({ href: `/x/${slug}`, frontmatter: { title: slug, subsidy: { periodEnd } } }) as never;
  const groups = groupDeadlines(
    [mk("a", "2026-09-30"), mk("b", "2026-09-30"), mk("c", "2026-09-30"), mk("d", "2026-10-15"), mk("e", "2026-11-01")],
    { perDate: 2, total: 4 }
  );
  assert.deepEqual(
    groups.map((g) => [g.date, g.articles.length, g.more]),
    [
      ["2026-09-30", 2, 1],
      ["2026-10-15", 1, 0],
      ["2026-11-01", 1, 0],
    ]
  );
});
