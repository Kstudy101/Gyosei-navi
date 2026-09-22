import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";
import { getAllArticles } from "@/lib/content";
import { getAllRankingArticles } from "@/lib/ranking";
import { CATEGORIES } from "@/config/taxonomy";

// AI検索（LLM クローラー）向けサイト概要 — llmstxt.org 形式。GEO/LLMO 対応
export const dynamic = "force-static";

export async function GET() {
  const articles = getAllArticles().filter((a) => a.frontmatter.status === "published");

  const sections: string[] = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "全記事が国・都道府県・市区町村の公式一次情報（出典リンク付き）に基づいています。",
    "",
    "## 主要セクション",
    "",
    ...CATEGORIES.map((c) => `- [${c.labelJa}](${absoluteUrl(`/subsidy/${c.code}`)}): ${c.description}`),
    `- [地域から探す](${absoluteUrl("/area")}): 都道府県・市区町村別の補助金一覧`,
    `- [地域比較](${absoluteUrl("/compare")}): 複数地域の制度比較記事`,
    `- [新着・締切情報](${absoluteUrl("/news")}): 新着公募と締切間近の制度`,
  ];

  for (const c of CATEGORIES) {
    const inCategory = articles.filter((a) => a.section === "subsidy" && a.category === c.code);
    if (inCategory.length === 0) continue;
    sections.push("", `## ${c.labelJa}の記事`, "");
    for (const a of inCategory) {
      sections.push(`- [${a.frontmatter.title}](${absoluteUrl(a.href)})`);
    }
  }

  const compare = articles.filter((a) => a.section === "compare");
  if (compare.length > 0) {
    sections.push("", "## 地域比較の記事", "");
    for (const a of compare) sections.push(`- [${a.frontmatter.title}](${absoluteUrl(a.href)})`);
  }

  const rankings = getAllRankingArticles();
  if (rankings.length > 0) {
    sections.push("", "## ランキング記事", "");
    for (const a of rankings) sections.push(`- [${a.frontmatter.title}](${absoluteUrl(a.href)})`);
  }

  return new Response(sections.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
