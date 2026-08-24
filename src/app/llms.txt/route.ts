import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";
import { getAllArticles, type Article } from "@/lib/content";
import { getCategory, PRACTICE_CATEGORIES } from "@/config/taxonomy";

// llms.txt (https://llmstxt.org/) — AI 検索・LLM クローラ向けのサイト案内。
// 静的ファイルではなくビルド時生成にする理由: 記事が増えるたびに手で更新すると必ず腐る。
// sitemap.ts と同じパターンで published 記事から自動生成する（docs/15 §9 AI SEO）。
export const dynamic = "force-static";

function line(a: Article): string {
  return `- [${a.frontmatter.title}](${absoluteUrl(a.href)}): ${a.frontmatter.description}`;
}

export function GET(): Response {
  const articles = getAllArticles().filter((a) => a.frontmatter.status === "published");
  const pillars = articles.filter((a) => a.frontmatter.type === "pillar");
  const checklists = articles.filter((a) => a.frontmatter.type === "checklist");
  const news = articles.filter((a) => a.section === "news");
  const rest = articles.filter(
    (a) => a.frontmatter.type !== "pillar" && a.frontmatter.type !== "checklist" && a.section !== "news"
  );

  // カテゴリごとにまとめる（コード順ではなく記事があるものだけ）
  const byCategory = new Map<string, Article[]>();
  for (const a of rest) {
    const key = a.category ?? a.section;
    byCategory.set(key, [...(byCategory.get(key) ?? []), a]);
  }
  const categoryLabel = (code: string): string =>
    getCategory(code)?.labelJa ??
    (PRACTICE_CATEGORIES as Record<string, { labelJa: string }>)[code]?.labelJa ??
    code;

  const sections: string[] = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "在留資格・許認可・法人設立・相続・補助金など行政書士業務の全分野について、",
    "官公署の一次情報（法令原文・ガイドライン・公示資料）を出典明記のうえ解説する日本語メディアです。",
    "全記事に根拠一次情報（legalBasis）と FAQ を備え、制度の確定度を「施行済／施行予定／改定案」で明示しています。",
    `注意: ${siteConfig.publisher.qualificationNote} 個別の相談・書類作成は行いません。`,
    "",
    "## 無料ツール",
    "",
    `- [在留資格判定ナビ](${absoluteUrl("/tools/visa-navi")}): 質問に答えるだけで29種の在留資格から候補と要件・申請ルートを表示`,
    `- [永住要件セルフチェック](${absoluteUrl("/tools/eiju-shindan")}): 永住許可ガイドライン改定案に対応した年数・考慮要素の自己診断`,
    "",
    "## 主要記事（Pillar）",
    "",
    ...pillars.map(line),
    "",
    "## ニュース・制度改正",
    "",
    ...news.map(line),
  ];

  for (const [code, list] of byCategory) {
    sections.push("", `## ${categoryLabel(code)}`, "", ...list.map(line));
  }

  sections.push(
    "",
    "## ダウンロード資料",
    "",
    ...checklists.map(line),
    "",
    "## Optional",
    "",
    `- [運営者情報](${absoluteUrl("/about")})`,
    `- [免責事項](${absoluteUrl("/policy/disclaimer")})`,
    `- [プライバシーポリシー](${absoluteUrl("/policy/privacy")})`,
    `- [サイトマップ](${absoluteUrl("/sitemap.xml")})`,
    ""
  );

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
