/**
 * sitemap ダイエット（docs/17、2026-09-26 GSC 対策）の仕様テスト。
 * 実コンテンツ（content/）を読んで、薄いページが sitemap・index から外れていることを検証する。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import sitemap from "@/app/sitemap";
import { generateMetadata as cityCategoryMetadata } from "@/app/area/[pref]/[city]/[category]/page";
import { generateMetadata as cityOrPrefCategoryMetadata } from "@/app/area/[pref]/[city]/page";
import {
  MIN_HUB_ARTICLES,
  MIN_TAG_ARCHIVE_ARTICLES,
  getArticlesByPrefectureAndCategory,
  getArticlesByRegionAndCategory,
  getArticlesByRegionCode,
  getTagIndex,
  getTagsWithArchivePage,
} from "@/lib/content";
import { MUNICIPALITIES, PREFECTURES, getPrefectureByCode } from "@/config/regions";
import { CATEGORY_CODES } from "@/config/taxonomy";
import { LOCALES } from "@/i18n/locales";

// content.ts は production のときだけ全記事をキャッシュする。sitemap() は数千回
// 記事一覧を引くので、テストでもビルドと同じ production 経路（キャッシュあり・draft 非表示）で走らせる。
Object.assign(process.env, { NODE_ENV: "production" });

const entries = sitemap();
const paths = entries.map((e) => new URL(e.url).pathname);

function findHub(predicate: (n: number) => boolean) {
  for (const m of MUNICIPALITIES) {
    const pref = getPrefectureByCode(m.prefCode);
    if (!pref) continue;
    for (const category of CATEGORY_CODES) {
      if (predicate(getArticlesByRegionAndCategory(m.code, category).length)) {
        return { pref: pref.slug, city: m.slug, category };
      }
    }
  }
  return undefined;
}

test("しきい値: ハブは2件、タグアーカイブは3件", () => {
  assert.equal(MIN_HUB_ARTICLES, 2);
  assert.equal(MIN_TAG_ARCHIVE_ARTICLES, 3);
});

test("sitemap: 翻訳ページ URL と hreflang alternates を含まない", () => {
  const localePrefix = new RegExp(`^/(${LOCALES.join("|")})/`);
  assert.deepEqual(
    paths.filter((p) => localePrefix.test(p)).slice(0, 3),
    []
  );
  assert.equal(entries.filter((e) => e.alternates !== undefined).length, 0);
});

test("sitemap: 市区町村×カテゴリのハブは記事 MIN_HUB_ARTICLES 件以上のみ", () => {
  const hubs = paths.filter((p) => /^\/area\/[^/]+\/[^/]+\/[^/]+\/$/.test(p));
  assert.ok(hubs.length > 0, "ハブが1件もない");
  for (const p of hubs) {
    const [, , pref, city, category] = p.split("/");
    const m = MUNICIPALITIES.find((x) => x.slug === city && getPrefectureByCode(x.prefCode)?.slug === pref);
    assert.ok(m, p);
    assert.ok(getArticlesByRegionAndCategory(m.code, category).length >= MIN_HUB_ARTICLES, p);
  }
});

test("sitemap: 都道府県×カテゴリ・市区町村ページも記事 MIN_HUB_ARTICLES 件以上のみ", () => {
  const four = paths.filter((p) => /^\/area\/[^/]+\/[^/]+\/$/.test(p));
  assert.ok(four.length > 0);
  for (const p of four) {
    const [, , pref, second] = p.split("/");
    const prefDef = PREFECTURES.find((x) => x.slug === pref);
    assert.ok(prefDef, p);
    if ((CATEGORY_CODES as readonly string[]).includes(second)) {
      assert.ok(getArticlesByPrefectureAndCategory(prefDef.code, second).length >= MIN_HUB_ARTICLES, p);
    } else {
      const m = MUNICIPALITIES.find((x) => x.slug === second && x.prefCode === prefDef.code);
      assert.ok(m, p);
      assert.ok(getArticlesByRegionCode(m.code).length >= MIN_HUB_ARTICLES, p);
    }
  }
});

test("タグアーカイブは記事 MIN_TAG_ARCHIVE_ARTICLES 件以上のタグのみ", () => {
  const index = getTagIndex();
  const tags = getTagsWithArchivePage();
  assert.ok(tags.length > 0);
  for (const t of tags) assert.ok((index.get(t)?.length ?? 0) >= MIN_TAG_ARCHIVE_ARTICLES, t);
});

test("記事1件の市区町村×カテゴリ hub は noindex,follow", async () => {
  const thin = findHub((n) => n === 1);
  assert.ok(thin, "記事1件のハブが見つからない");
  const md = await cityCategoryMetadata({ params: Promise.resolve(thin) });
  assert.deepEqual(md.robots, { index: false, follow: true });
});

test("記事2件以上の市区町村×カテゴリ hub は index 可", async () => {
  const thick = findHub((n) => n >= MIN_HUB_ARTICLES);
  assert.ok(thick, "記事2件以上のハブが見つからない");
  const md = await cityCategoryMetadata({ params: Promise.resolve(thick) });
  assert.equal(md.robots, undefined);
});

test("記事1件の市区町村ページ・都道府県×カテゴリ hub も noindex,follow", async () => {
  const m = MUNICIPALITIES.find((x) => getArticlesByRegionCode(x.code).length === 1);
  assert.ok(m, "記事1件の市区町村が見つからない");
  const cityMd = await cityOrPrefCategoryMetadata({
    params: Promise.resolve({ pref: getPrefectureByCode(m.prefCode)!.slug, city: m.slug }),
  });
  assert.deepEqual(cityMd.robots, { index: false, follow: true });

  let thinPrefCat: { pref: string; city: string } | undefined;
  for (const p of PREFECTURES) {
    const c = CATEGORY_CODES.find((code) => getArticlesByPrefectureAndCategory(p.code, code).length === 1);
    if (c) {
      thinPrefCat = { pref: p.slug, city: c };
      break;
    }
  }
  assert.ok(thinPrefCat, "記事1件の都道府県×カテゴリが見つからない");
  const prefMd = await cityOrPrefCategoryMetadata({ params: Promise.resolve(thinPrefCat) });
  assert.deepEqual(prefMd.robots, { index: false, follow: true });
});
