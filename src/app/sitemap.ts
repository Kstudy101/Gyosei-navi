import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getAllArticles, getArticlesBySectionAndLocale, getAvailableLocalesFor } from "@/lib/content";
import { getAllRankingArticles } from "@/lib/ranking";
import { CATEGORY_CODES } from "@/config/taxonomy";
import { PREFECTURES } from "@/config/regions";
import { LOCALES } from "@/i18n/locales";

// output: "export"（静的ホスティング）ではメタデータルートも静的生成を明示する必要がある
export const dynamic = "force-static";

function languageAlternates(originalPath: string, availableLocales: readonly string[]) {
  const languages: Record<string, string> = { ja: absoluteUrl(originalPath) };
  for (const l of availableLocales) languages[l] = absoluteUrl(`/${l}${originalPath}`);
  languages["x-default"] = absoluteUrl(originalPath);
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/subsidy",
    ...CATEGORY_CODES.map((c) => `/subsidy/${c}`),
    "/area",
    ...PREFECTURES.map((p) => `/area/${p.slug}`),
    "/compare",
    "/news",
    "/ranking",
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
    .map((a) => {
      const availableLocales =
        a.section === "subsidy" || a.section === "compare"
          ? getAvailableLocalesFor(a.section, a.frontmatter.slug, a.category ?? undefined)
          : [];
      return {
        url: absoluteUrl(a.href),
        lastModified: a.frontmatter.updatedAt,
        changeFrequency: "weekly" as const,
        ...(availableLocales.length > 0
          ? { alternates: { languages: languageAlternates(a.href, availableLocales) } }
          : {}),
      };
    });

  const translatedArticles = LOCALES.flatMap((locale) => [
    ...getArticlesBySectionAndLocale(locale, "subsidy"),
    ...getArticlesBySectionAndLocale(locale, "compare"),
  ])
    .filter((a) => a.frontmatter.status === "published")
    .map((a) => {
      const availableLocales = getAvailableLocalesFor(a.section, a.frontmatter.slug, a.category ?? undefined);
      return {
        url: absoluteUrl(a.href),
        lastModified: a.frontmatter.updatedAt,
        changeFrequency: "weekly" as const,
        alternates: { languages: languageAlternates(a.originalHref, availableLocales) },
      };
    });

  const rankingArticles = getAllRankingArticles().map((a) => ({
    url: absoluteUrl(a.href),
    lastModified: a.frontmatter.updatedAt,
    changeFrequency: "weekly" as const,
  }));

  return [...staticPaths, ...articles, ...translatedArticles, ...rankingArticles];
}
