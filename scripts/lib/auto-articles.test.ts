import { test } from "node:test";
import assert from "node:assert/strict";
import matter from "gray-matter";
import { getCategory } from "@/config/taxonomy";
import {
  fiscalYearLabel,
  buildCompare,
  buildTokushu,
  renderMdx,
  reconcile,
  type SubsidyRow,
} from "./auto-articles";

const shussan = getCategory("shussan")!;
const TODAY = "2026-09-26";

function row(
  slug: string,
  regionCode: string,
  amount: string,
  provider: SubsidyRow["subsidy"]["provider"] = "municipality"
): SubsidyRow {
  return {
    slug,
    sourceLinks: [{ label: `${slug} 公式`, url: `https://example.jp/${slug}`, accessedAt: TODAY }],
    subsidy: {
      regionCode,
      regionLabel: `自治体${regionCode}`,
      provider,
      amount,
      status: "open",
      applyUrl: `https://example.jp/${slug}/apply`,
      verifiedAt: TODAY,
    },
  };
}

const six: SubsidyRow[] = [
  row("c", "13103", "上限10万円"),
  row("a", "01100", "上限30万円"),
  row("f", "47201", "1万円"),
  row("b", "02201", "上限5万円"),
  row("e", "40130", "最大20万円"),
  row("d", "27100", "上限50万円"),
];

test("fiscalYearLabel: 4月以降は当年、3月までは前年の年度", () => {
  assert.equal(fiscalYearLabel("2026-09-26"), "2026年度");
  assert.equal(fiscalYearLabel("2026-04-01"), "2026年度");
  assert.equal(fiscalYearLabel("2026-03-31"), "2025年度");
});

test("buildCompare: 5件未満なら null", () => {
  assert.equal(buildCompare(shussan, six.slice(0, 4), TODAY), null);
});

test("buildCompare: 固定slug・年度入りタイトル・regionCode順の compareTargets", () => {
  const art = buildCompare(shussan, six, TODAY)!;
  assert.equal(art.frontmatter.slug, "shussan-hikaku");
  assert.equal(art.frontmatter.title, "出産・育児の補助金 自治体比較【2026年度】");
  assert.equal(art.frontmatter.category, "shussan");
  assert.equal(art.frontmatter.type, "compare");
  assert.deepEqual(art.frontmatter.compareTargets, ["a", "b", "c", "d", "e", "f"]);
  assert.equal(art.frontmatter.publishedAt, TODAY);
  assert.equal(art.frontmatter.updatedAt, TODAY);
  assert.equal(art.frontmatter.changelog.length, 1);
  assert.ok(art.body.includes("6自治体"), "本文冒頭に件数");
});

test("buildTokushu: 国の制度を除き、万円上限の大きい順に最大10件・rank連番", () => {
  const rows = [...six, row("n", "00000", "上限100万円", "national")];
  const art = buildTokushu(shussan, rows, TODAY)!;
  assert.equal(art.frontmatter.slug, "shussan-tokushu");
  assert.equal(art.frontmatter.title, "出産・育児の補助金が高い自治体TOP6【2026年度】");
  assert.deepEqual(
    art.frontmatter.rankings.map((r) => r.slug),
    ["d", "a", "e", "c", "b", "f"]
  );
  assert.deepEqual(
    art.frontmatter.rankings.map((r) => r.rank),
    [1, 2, 3, 4, 5, 6]
  );
});

test("buildTokushu: 金額を抽出できた記事が5件未満なら null", () => {
  const rows = six.map((r, i) => (i < 2 ? r : row(r.slug, r.subsidy.regionCode, "実費相当")));
  assert.equal(buildTokushu(shussan, rows, TODAY), null);
});

test("reconcile: 既存なしは create、内容が同じなら unchanged", () => {
  const next = buildCompare(shussan, six, TODAY)!;
  const created = reconcile(undefined, next, TODAY);
  assert.equal(created.action, "create");
  assert.equal(created.content, renderMdx(next));

  const again = reconcile(created.content, next, "2026-10-01");
  assert.equal(again.action, "unchanged");
});

test("reconcile: 内容が変わったら publishedAt を保ち updatedAt と changelog だけ進める", () => {
  const first = buildCompare(shussan, six, "2026-09-01")!;
  const existing = renderMdx(first);

  const seven = [...six, row("g", "34100", "上限7万円")];
  const next = buildCompare(shussan, seven, TODAY)!;
  const result = reconcile(existing, next, TODAY);
  assert.equal(result.action, "update");

  const fm = matter(result.content!).data;
  assert.equal(fm.publishedAt, "2026-09-01");
  assert.equal(fm.updatedAt, TODAY);
  assert.equal(fm.changelog.length, 2);
  assert.equal(fm.changelog[1].date, TODAY);
  assert.deepEqual(fm.compareTargets, ["a", "b", "c", "d", "g", "e", "f"]);
});

test("loadPublishedSubsidyRows + syncAutoArticle: 実ファイルで create → unchanged → update", () => {
  const fs = require("node:fs") as typeof import("node:fs");
  const os = require("node:os") as typeof import("node:os");
  const path = require("node:path") as typeof import("node:path");
  const { loadPublishedSubsidyRows, syncAutoArticle } = require("./auto-articles") as typeof import("./auto-articles");

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "auto-articles-"));
  const subsidyDir = path.join(dir, "subsidy", "shussan");
  fs.mkdirSync(subsidyDir, { recursive: true });
  const writeSubsidy = (r: SubsidyRow, status = "published") =>
    fs.writeFileSync(
      path.join(subsidyDir, `${r.slug}.mdx`),
      matter.stringify("本文", {
        title: `【自治体${r.subsidy.regionCode}】テスト記事タイトル`,
        slug: r.slug,
        category: "shussan",
        type: "cluster",
        description: "テスト用の説明文です。五十文字以上になるように文章を続けます。五十文字以上になるように文章を続けます。",
        publishedAt: TODAY,
        updatedAt: TODAY,
        status,
        sourceLinks: r.sourceLinks,
        subsidy: r.subsidy,
      })
    );
  six.forEach((r) => writeSubsidy(r));
  writeSubsidy(row("z", "99999", "上限99万円"), "draft");

  const rows = loadPublishedSubsidyRows(dir);
  assert.deepEqual([...rows.keys()], ["shussan"]);
  assert.equal(rows.get("shussan")!.length, 6, "draft は除外");

  const target = path.join(dir, "compare", "shussan-hikaku.mdx");
  const next = buildCompare(shussan, rows.get("shussan")!, TODAY)!;
  assert.equal(syncAutoArticle(target, next, TODAY), "create");
  assert.equal(syncAutoArticle(target, next, "2026-10-01"), "unchanged");

  writeSubsidy(row("g", "34100", "上限7万円"));
  const more = buildCompare(shussan, loadPublishedSubsidyRows(dir).get("shussan")!, "2026-10-01")!;
  assert.equal(syncAutoArticle(target, more, "2026-10-01"), "update");
  assert.equal(matter(fs.readFileSync(target, "utf-8")).data.publishedAt, TODAY);
});
