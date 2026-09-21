/**
 * 自動 tokushu（特集）記事生成（DataForSEO Engine 未実装のため、既存 published subsidy 記事の
 * データを再構成する方式で代替 — AGENTS.md 絶対規則9の例外対象）。
 *
 * .cache/tokushu-keyword.json のカテゴリについて、published subsidy 記事の amount 文字列から
 * 正規表現で「万円」金額を抽出し、金額の大きい順に rankings（最低5件）を組み立てて
 * status: published で1本生成する。金額を抽出できた記事が5件未満ならそのカテゴリは今回 skip する。
 *
 * 使用: npm run generate:tokushu
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getCategory } from "../src/config/taxonomy";
import { articleFrontmatterSchema, type ArticleFrontmatter } from "../src/lib/content-schema";

const CONTENT_DIR = path.join(process.cwd(), "content");
const SUBSIDY_DIR = path.join(CONTENT_DIR, "subsidy");
const TOKUSHU_DIR = path.join(CONTENT_DIR, "tokushu");
const KEYWORD_FILE = path.join(process.cwd(), ".cache", "tokushu-keyword.json");

const MIN_RANKED = 5;
const MAX_RANKED = 10;

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

/** amount 文字列から「◯万円」の最大値（万円単位）を抽出する。抽出できなければ undefined。 */
function extractMaxManEn(amount: string): number | undefined {
  const matches = [...amount.matchAll(/(\d+(?:[.,]\d+)?)\s*万円/g)];
  if (matches.length === 0) return undefined;
  const values = matches.map((m) => Number(m[1].replace(",", "")));
  return Math.max(...values);
}

function main(): void {
  if (!fs.existsSync(KEYWORD_FILE)) {
    console.log("キーワードファイルなし（tokushu:pick-keyword を先に実行）。");
    process.exit(1);
  }
  const { categoryCode, keyword } = JSON.parse(fs.readFileSync(KEYWORD_FILE, "utf-8")) as {
    categoryCode: string;
    keyword: string;
  };

  const category = getCategory(categoryCode);
  if (!category) {
    console.log(`未知のカテゴリコード: ${categoryCode}`);
    process.exit(1);
  }

  const subsidyArticles = walkMdx(SUBSIDY_DIR)
    .map(loadArticle)
    .filter(
      (a): a is LoadedArticle =>
        a !== undefined &&
        a.data.status === "published" &&
        a.data.category === categoryCode &&
        a.data.subsidy?.provider !== "national"
    );

  const ranked = subsidyArticles
    .map((a) => {
      const amount = a.data.subsidy?.amount;
      const value = amount ? extractMaxManEn(amount) : undefined;
      return value === undefined ? undefined : { article: a, value };
    })
    .filter((x): x is { article: LoadedArticle; value: number } => x !== undefined)
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_RANKED);

  if (ranked.length < MIN_RANKED) {
    console.log(
      `skip: ${categoryCode} は金額を抽出できたpublished記事が${ranked.length}件（${MIN_RANKED}件未満）。`
    );
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const slug = `${categoryCode}-tokushu-jido-${today.replace(/-/g, "")}`;
  const target = path.join(TOKUSHU_DIR, `${slug}.mdx`);
  if (fs.existsSync(target)) {
    console.log(`既に存在: ${target}`);
    return;
  }

  const rankings = ranked.map((r, i) => ({
    rank: i + 1,
    slug: r.article.data.slug,
    label: r.article.data.subsidy!.regionLabel,
    summary: `${r.article.data.subsidy!.regionLabel}: ${r.article.data.subsidy!.amount}（上限${r.value}万円換算）`,
  }));

  const summaryTable = rankings
    .map((r) => `| ${r.rank} | ${r.label} | 上限${ranked[r.rank - 1].value}万円 |`)
    .join("\n");

  const faq = [
    {
      q: `この特集の順位はどう決めていますか？`,
      a: `既に公開済みの各自治体記事に記載された補助上限額（万円換算）を比較し、金額の大きい順に並べています。制度の対象条件や算定方法は自治体ごとに異なるため、金額だけで単純に優劣を判断せず、各記事で条件を確認してください。`,
    },
    {
      q: "掲載されている金額は最新ですか？",
      a: "各自治体記事の一次情報（sourceLinks）を根拠にしていますが、制度は年度で変わることがあります。申請前に必ず各記事のリンク先で最新情報を確認してください。",
    },
    {
      q: "ランクインしていない自治体は制度がないということですか？",
      a: "いいえ。この特集は既に公開済みの記事があり、かつ補助上限額を万円単位で確認できた自治体のみを対象にしています。掲載がない場合でも、お住まいの自治体に同種の制度がある可能性があります。",
    },
  ];

  const frontmatter = {
    title: `${category.labelJa}の補助金が高い自治体TOP${rankings.length}`,
    slug,
    category: categoryCode,
    type: "tokushu" as const,
    tags: [],
    description: `${category.labelJa}分野の補助金・助成制度について、既に公開済みの記事データをもとに補助上限額が高い自治体を順位付けした特集記事です。`,
    publishedAt: today,
    updatedAt: today,
    author: "editorial",
    status: "published" as const,
    sourceLinks: ranked.flatMap((r) => r.article.data.sourceLinks).slice(0, 10),
    relatedSlugs: [],
    faq,
    ogImage: "",
    targetKeywords: [keyword, `${category.labelJa} 補助金 ランキング`],
    changelog: [
      {
        date: today,
        note: `既存published記事${rankings.length}件の補助上限額データから自動生成（DataForSEO Engine未実装時の代替方式 — AGENTS.md規則9）。参考キーワード: ${keyword}`,
      },
    ],
    compareTargets: [],
    rankings,
  };

  const body = `${category.description}\n\n既に公開済みの記事データをもとに、${category.labelJa}分野で補助上限額が高い自治体を順位付けしました。\n\n## ランキング\n\n<TokushuRanking />\n\n## よくある質問\n\n<FAQ />\n\n## まとめ\n\n| 順位 | 自治体 | 補助上限額 |\n|---|---|---|\n${summaryTable}\n\n<SourceLinkList />\n<Disclaimer />\n`;

  const mdxContent = matter.stringify(body, frontmatter);
  fs.mkdirSync(TOKUSHU_DIR, { recursive: true });
  fs.writeFileSync(target, mdxContent, "utf-8");
  console.log(`生成: ${target} (順位${rankings.length}件)`);
}

main();
