import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getAllArticles } from "@/lib/content";
import { CATEGORY_CODES } from "@/config/taxonomy";

// output: "export"（静的ホスティング）ではメタデータルートも静的生成を明示する必要がある
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/subsidy",
    ...CATEGORY_CODES.map((c) => `/subsidy/${c}`),
    "/area",
    "/compare",
    "/about",
    "/contact",
    "/policy/disclaimer",
    "/policy/privacy",
  ].map((p) => ({
    url: absoluteUrl(p),
    changeFrequency: "weekly" as const,
  }));

  const articles = getAllArticles()
    .filter((a) => a.frontmatter.status === "published")
    .map((a) => ({
      url: absoluteUrl(a.href),
      lastModified: a.frontmatter.updatedAt,
      changeFrequency: "weekly" as const,
    }));

  return [...staticPaths, ...articles];
}
