/**
 * 自動 compare 記事生成（DataForSEO Engine 未実装のため、既存 published subsidy 記事の
 * データを再構成する方式で代替 — AGENTS.md 絶対規則9の例外対象）。
 *
 * カテゴリごとに published subsidy 記事を集め、まだどの compare 記事の compareTargets にも
 * 使われていない slug が5件以上あれば、新しい compare 記事を1本 status: published で生成する。
 * 本文は AI を呼ばず、subsidy フィールドから固定テンプレートで組み立てる。
 *
 * 使用: npm run generate:compare
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATEGORIES, SUBSIDY_STATUSES } from "../src/config/taxonomy";
import { articleFrontmatterSchema, type ArticleFrontmatter } from "../src/lib/content-schema";

const CONTENT_DIR = path.join(process.cwd(), "content");
const SUBSIDY_DIR = path.join(CONTENT_DIR, "subsidy");
const COMPARE_DIR = path.join(CONTENT_DIR, "compare");

interface LoadedArticle {
  filePath: string;
  data: ArticleFrontmatter;
}

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

function loadArticle(filePath: string): LoadedArticle | undefined {
  const { data } = matter(fs.readFileSync(filePath, "utf-8"));
  const parsed = articleFrontmatterSchema.safeParse(data);
  if (!parsed.success) return undefined;
  return { filePath, data: parsed.data };
}

const subsidyArticles = walkMdx(SUBSIDY_DIR)
  .map(loadArticle)
  .filter((a): a is LoadedArticle => a !== undefined && a.data.status === "published");

const compareArticles = walkMdx(COMPARE_DIR)
  .map(loadArticle)
  .filter((a): a is LoadedArticle => a !== undefined);

const usedSlugs = new Set(compareArticles.flatMap((a) => a.data.compareTargets));

const MIN_TARGETS = 5;
const today = new Date().toISOString().slice(0, 10);
let created = 0;

for (const category of CATEGORIES) {
  const candidates = subsidyArticles.filter(
    (a) => a.data.category === category.code && !usedSlugs.has(a.data.slug)
  );
  if (candidates.length < MIN_TARGETS) continue;

  const slug = `${category.code}-hikaku-jido-${today.replace(/-/g, "")}`;
  const target = path.join(COMPARE_DIR, `${slug}.mdx`);
  if (fs.existsSync(target)) continue;

  const rows = candidates
    .map((a) => a.data.subsidy!)
    .sort((x, y) => x.regionLabel.localeCompare(y.regionLabel, "ja"));

  const summaryTable = rows
    .map((s) => `| ${s.regionLabel} | ${s.amount ?? "—"} | ${SUBSIDY_STATUSES[s.status].label} | ${s.periodEnd ?? "—"} |`)
    .join("\n");

  const faq = [
    {
      q: `${category.labelJa}の補助金は自治体によってどう違いますか？`,
      a: `対象条件・金額の算定方法（定額・定率・条件付き）が自治体ごとに異なります。この記事では既に公開済みの各記事のデータをもとに、金額・募集状況・申請期限を横並びで整理しています。`,
    },
    {
      q: "掲載されている金額は最新ですか？",
      a: "各自治体記事の一次情報（sourceLinks）を根拠にしていますが、制度は年度で変わることがあります。申請前に必ず各記事のリンク先で最新情報を確認してください。",
    },
    {
      q: "自分の自治体が載っていない場合はどうすればいいですか？",
      a: "この記事は既に公開済みの記事があった自治体のみを掲載しています。掲載がない場合はお住まいの自治体の公式サイトで同種の制度の有無を確認してください。",
    },
  ];

  const frontmatter = {
    title: `${category.labelJa}の補助金 自治体比較【${rows.length}件】`,
    slug,
    category: "compare",
    type: "compare" as const,
    tags: [],
    description: `${category.labelJa}に関する補助金・助成制度を自治体別に比較する記事です。各自治体の金額・募集状況・申請期限を一覧で確認できます。`,
    publishedAt: today,
    updatedAt: today,
    author: "editorial",
    status: "published" as const,
    sourceLinks: candidates
      .flatMap((a) => a.data.sourceLinks)
      .slice(0, 10),
    relatedSlugs: [],
    faq,
    ogImage: "",
    targetKeywords: [`${category.labelJa} 補助金 比較`],
    changelog: [{ date: today, note: `既存published記事${rows.length}件から自動生成（DataForSEO Engine未実装時の代替方式 — AGENTS.md規則9）。` }],
    compareTargets: candidates.map((a) => a.data.slug),
  };

  const body = `${category.description}\n\n既に公開済みの記事データをもとに、${category.labelJa}分野の補助金・助成制度を自治体別に比較します。\n\n## 比較表\n\n<CompareTable />\n\n## よくある質問\n\n<FAQ />\n\n## まとめ\n\n| 自治体 | 金額 | 状況 | 申請期限 |\n|---|---|---|---|\n${summaryTable}\n\n<SourceLinkList />\n<Disclaimer />\n`;

  const mdxContent = matter.stringify(body, frontmatter);
  fs.mkdirSync(COMPARE_DIR, { recursive: true });
  fs.writeFileSync(target, mdxContent, "utf-8");
  console.log(`生成: ${target} (対象${rows.length}件)`);
  created += 1;
}

if (created === 0) {
  console.log("生成対象なし（各カテゴリで未使用のpublished subsidy記事が5件未満）。");
}
