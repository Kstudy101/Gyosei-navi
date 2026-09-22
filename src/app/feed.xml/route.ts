import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";
import { getAllArticles } from "@/lib/content";
import { getAllRankingArticles } from "@/lib/ranking";

// output: "export" では Route Handler も静的生成を明示する
export const dynamic = "force-static";

const FEED_SIZE = 50;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const items = [
    ...getAllArticles()
      .filter((a) => a.frontmatter.status === "published")
      .map((a) => ({
        title: a.frontmatter.title,
        description: a.frontmatter.description,
        href: a.href,
        publishedAt: a.frontmatter.publishedAt,
      })),
    ...getAllRankingArticles().map((a) => ({
      title: a.frontmatter.title,
      description: a.frontmatter.description,
      href: a.href,
      publishedAt: a.frontmatter.publishedAt,
    })),
  ]
    .sort((x, y) => y.publishedAt.localeCompare(x.publishedAt))
    .slice(0, FEED_SIZE);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>ja</language>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${absoluteUrl(item.href)}</link>
      <guid>${absoluteUrl(item.href)}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${new Date(`${item.publishedAt}T00:00:00+09:00`).toUTCString()}</pubDate>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
