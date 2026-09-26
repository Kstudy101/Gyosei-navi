/**
 * 自動生成記事（compare / tokushu）の純粋ロジック。
 *
 * 2026-09-26 方針転換: 日付付き slug で毎回新規ファイルを増やす方式をやめ、
 * カテゴリごとに固定 slug の記事1本を「更新」する。GSC で同一タイトルの
 * 日付違い記事が重複扱いされ、クロール予算を食っていたため（docs/17 参照）。
 *
 * - buildCompare / buildTokushu: published subsidy 記事の構造化データから記事を組み立てる（AI は呼ばない）
 * - reconcile: 既存ファイルと比べ、内容が同じなら何もしない。変わっていれば publishedAt を保ったまま
 *   updatedAt と changelog だけ進める（日付以外が同じ = 変更なし、という冪等性の定義）
 *
 * AGENTS.md 絶対規則9の例外（既存 published 記事の再構成のみ）はそのまま適用される。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { SUBSIDY_STATUSES, type CategoryDef } from "@/config/taxonomy";
import { articleFrontmatterSchema, type ArticleFrontmatter } from "@/lib/content-schema";

export type SubsidyRow = Pick<ArticleFrontmatter, "slug" | "sourceLinks"> & {
  subsidy: NonNullable<ArticleFrontmatter["subsidy"]>;
};

export interface AutoArticle {
  frontmatter: ArticleFrontmatter;
  body: string;
  /** 既存記事を更新するときに changelog へ残す一文 */
  updateNote: string;
}

const MIN_TARGETS = 5;
const MAX_RANKED = 10;
const MAX_SOURCE_LINKS = 10;

/** 日本の会計年度（4月始まり）ラベル。例: 2026-03-31 → "2025年度" */
export function fiscalYearLabel(isoDate: string): string {
  const [y, m] = isoDate.split("-").map(Number);
  return `${m >= 4 ? y : y - 1}年度`;
}

/** amount 文字列から「◯万円」の最大値（万円単位）を抽出する。抽出できなければ undefined。 */
function extractMaxManEn(amount: string): number | undefined {
  const matches = [...amount.matchAll(/(\d+(?:[.,]\d+)?)\s*万円/g)];
  if (matches.length === 0) return undefined;
  return Math.max(...matches.map((m) => Number(m[1].replace(",", ""))));
}

const COMMON_FAQ_FRESHNESS = {
  q: "掲載されている金額は最新ですか？",
  a: "各自治体記事の一次情報（sourceLinks）を根拠にしていますが、制度は年度で変わることがあります。申請前に必ず各記事のリンク先で最新情報を確認してください。",
};

function baseFrontmatter(today: string, note: string) {
  return {
    tags: [] as string[],
    publishedAt: today,
    updatedAt: today,
    author: "editorial",
    status: "published" as const,
    relatedSlugs: [] as string[],
    ogImage: "",
    changelog: [{ date: today, note }],
  };
}

export function buildCompare(category: CategoryDef, rows: SubsidyRow[], today: string): AutoArticle | null {
  if (rows.length < MIN_TARGETS) return null;

  const sorted = [...rows].sort((a, b) => a.subsidy.regionCode.localeCompare(b.subsidy.regionCode));
  const n = sorted.length;
  const summaryTable = sorted
    .map(
      (r) =>
        `| ${r.subsidy.regionLabel} | ${r.subsidy.amount ?? "—"} | ${SUBSIDY_STATUSES[r.subsidy.status].label} | ${r.subsidy.periodEnd ?? "—"} |`
    )
    .join("\n");

  const frontmatter: ArticleFrontmatter = {
    title: `${category.labelJa}の補助金 自治体比較【${fiscalYearLabel(today)}】`,
    slug: `${category.code}-hikaku`,
    category: category.code,
    type: "compare",
    description: `${category.labelJa}に関する補助金・助成制度を全国の自治体別に比較する記事です。各自治体の金額・募集状況・申請期限を一覧で確認できます。`,
    sourceLinks: sorted.flatMap((r) => r.sourceLinks).slice(0, MAX_SOURCE_LINKS),
    faq: [
      {
        q: `${category.labelJa}の補助金は自治体によってどう違いますか？`,
        a: "対象条件・金額の算定方法（定額・定率・条件付き）が自治体ごとに異なります。この記事では既に公開済みの各記事のデータをもとに、金額・募集状況・申請期限を横並びで整理しています。",
      },
      COMMON_FAQ_FRESHNESS,
      {
        q: "自分の自治体が載っていない場合はどうすればいいですか？",
        a: "この記事は既に公開済みの記事があった自治体のみを掲載しています。掲載がない場合はお住まいの自治体の公式サイトで同種の制度の有無を確認してください。",
      },
    ],
    targetKeywords: [`${category.labelJa} 補助金 比較`, `${category.labelJa} 補助金 自治体 一覧`],
    compareTargets: sorted.map((r) => r.slug),
    rankings: [],
    ...baseFrontmatter(today, `既存published記事${n}件から自動生成（既存記事の再構成 — AGENTS.md規則9）。`),
  };

  const body = `${category.description}\n\n既に公開済みの記事データをもとに、${category.labelJa}分野の補助金・助成制度を全国${n}自治体で比較します。表は地域コード順（北から南）に並べています。\n\n## 比較表\n\n<CompareTable />\n\n## よくある質問\n\n<FAQ />\n\n## まとめ\n\n| 自治体 | 金額 | 状況 | 申請期限 |\n|---|---|---|---|\n${summaryTable}\n\n<SourceLinkList />\n<Disclaimer />\n`;

  return { frontmatter, body, updateNote: `比較対象を${n}自治体に更新（自動生成）。` };
}

export function buildTokushu(category: CategoryDef, rows: SubsidyRow[], today: string): AutoArticle | null {
  const ranked = rows
    .filter((r) => r.subsidy.provider !== "national")
    .map((r) => ({ row: r, value: extractMaxManEn(r.subsidy.amount ?? "") }))
    .filter((x): x is { row: SubsidyRow; value: number } => x.value !== undefined)
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_RANKED);
  if (ranked.length < MIN_TARGETS) return null;

  const rankings = ranked.map((r, i) => ({
    rank: i + 1,
    slug: r.row.slug,
    label: r.row.subsidy.regionLabel,
    summary: `${r.row.subsidy.regionLabel}: ${r.row.subsidy.amount}（上限${r.value}万円換算）`,
  }));
  const summaryTable = ranked
    .map((r, i) => `| ${i + 1} | ${r.row.subsidy.regionLabel} | 上限${r.value}万円 |`)
    .join("\n");

  const frontmatter: ArticleFrontmatter = {
    title: `${category.labelJa}の補助金が高い自治体TOP${rankings.length}【${fiscalYearLabel(today)}】`,
    slug: `${category.code}-tokushu`,
    category: category.code,
    type: "tokushu",
    description: `${category.labelJa}分野の補助金・助成制度について、既に公開済みの記事データをもとに補助上限額が高い自治体を順位付けした特集記事です。`,
    sourceLinks: ranked.flatMap((r) => r.row.sourceLinks).slice(0, MAX_SOURCE_LINKS),
    faq: [
      {
        q: "この特集の順位はどう決めていますか？",
        a: "既に公開済みの各自治体記事に記載された補助上限額（万円換算）を比較し、金額の大きい順に並べています。制度の対象条件や算定方法は自治体ごとに異なるため、金額だけで単純に優劣を判断せず、各記事で条件を確認してください。",
      },
      COMMON_FAQ_FRESHNESS,
      {
        q: "ランクインしていない自治体は制度がないということですか？",
        a: "いいえ。この特集は既に公開済みの記事があり、かつ補助上限額を万円単位で確認できた自治体のみを対象にしています。掲載がない場合でも、お住まいの自治体に同種の制度がある可能性があります。",
      },
    ],
    targetKeywords: [`${category.labelJa} 補助金 ランキング`, `${category.labelJa} 補助金 高い 自治体`],
    compareTargets: [],
    rankings,
    ...baseFrontmatter(
      today,
      `既存published記事${rankings.length}件の補助上限額データから自動生成（既存記事の再構成 — AGENTS.md規則9）。`
    ),
  };

  const body = `${category.description}\n\n既に公開済みの記事データをもとに、${category.labelJa}分野で補助上限額が高い自治体を順位付けしました。\n\n## ランキング\n\n<TokushuRanking />\n\n## よくある質問\n\n<FAQ />\n\n## まとめ\n\n| 順位 | 自治体 | 補助上限額 |\n|---|---|---|\n${summaryTable}\n\n<SourceLinkList />\n<Disclaimer />\n`;

  return { frontmatter, body, updateNote: "順位を最新の公開記事データで更新（自動生成）。" };
}

export function renderMdx(article: AutoArticle): string {
  return matter.stringify(article.body, article.frontmatter);
}

export type ReconcileResult =
  | { action: "create" | "update"; content: string }
  | { action: "unchanged"; content?: undefined };

/**
 * 既存ファイルの内容と突き合わせる。日付（publishedAt/updatedAt）と changelog を既存のまま差し替えて
 * 描画した結果が既存ファイルと一致すれば「変更なし」。一致しなければ updatedAt=today、changelog 追記で更新。
 * 人手で編集した自動生成記事は次回実行で上書きされる（自動生成記事は手で直さない前提）。
 */
export function reconcile(existingRaw: string | undefined, next: AutoArticle, today: string): ReconcileResult {
  if (existingRaw === undefined) return { action: "create", content: renderMdx(next) };

  const existing = matter(existingRaw).data as Pick<ArticleFrontmatter, "publishedAt" | "updatedAt" | "changelog">;
  const candidate: AutoArticle = {
    ...next,
    frontmatter: {
      ...next.frontmatter,
      publishedAt: existing.publishedAt,
      updatedAt: existing.updatedAt,
      changelog: existing.changelog,
    },
  };
  const normalize = (s: string) => s.replace(/\r\n/g, "\n");
  if (normalize(renderMdx(candidate)) === normalize(existingRaw)) return { action: "unchanged" };

  candidate.frontmatter.updatedAt = today;
  candidate.frontmatter.changelog = [...existing.changelog, { date: today, note: next.updateNote }];
  return { action: "update", content: renderMdx(candidate) };
}

/* ------------------------------------------------------------------ */
/* ファイル I/O                                                        */
/* ------------------------------------------------------------------ */

function walkMdx(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMdx(full));
    else if (entry.name.endsWith(".mdx") && !entry.name.startsWith("_")) out.push(full);
  }
  return out;
}

/** content/subsidy 配下の published 記事のうち subsidy フィールドを持つものを読む */
export function loadPublishedSubsidyRows(contentDir: string): Map<string, SubsidyRow[]> {
  const byCategory = new Map<string, SubsidyRow[]>();
  for (const file of walkMdx(path.join(contentDir, "subsidy"))) {
    const parsed = articleFrontmatterSchema.safeParse(matter(fs.readFileSync(file, "utf-8")).data);
    if (!parsed.success || parsed.data.status !== "published" || !parsed.data.subsidy) continue;
    const { slug, sourceLinks, subsidy, category } = parsed.data;
    const rows = byCategory.get(category) ?? [];
    rows.push({ slug, sourceLinks, subsidy });
    byCategory.set(category, rows);
  }
  return byCategory;
}

/** 1記事分を書き込む（必要なときだけ）。戻り値は実施した操作。 */
export function syncAutoArticle(filePath: string, next: AutoArticle, today: string): ReconcileResult["action"] {
  const existingRaw = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : undefined;
  const result = reconcile(existingRaw, next, today);
  if (result.action !== "unchanged") {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, result.content, "utf-8");
  }
  return result.action;
}
