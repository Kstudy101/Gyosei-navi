import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getAllArticles } from "@/lib/content";
import { CATEGORY_CODES, PRACTICE_CATEGORIES } from "@/config/taxonomy";

// output: "export"（静的ホスティング）ではメタデータルートも静的生成を明示する必要がある
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/news",
    "/guide",
    ...CATEGORY_CODES.map((c) => `/guide/${c}`),
    "/practice",
    ...Object.keys(PRACTICE_CATEGORIES).map((c) => `/practice/${c}`),
    "/exam",
    "/tools",
    "/tools/eiju-shindan",
    "/tools/visa-navi",
    "/data",
    "/about",
    "/contact",
    "/ads",
    "/search",
    "/policy/disclaimer",
    "/policy/privacy",
  ].map((p) => ({
    url: absoluteUrl(p),
    changeFrequency: "weekly" as const,
  }));

  // sitemap には公開記事のみ載せる（draft/review は開発表示専用）
  const articles = getAllArticles()
    .filter((a) => a.frontmatter.status === "published")
    .map((a) => ({
      url: absoluteUrl(a.href),
      lastModified: a.frontmatter.updatedAt,
      changeFrequency: "weekly" as const,
    }));

  return [...staticPaths, ...articles];
}
