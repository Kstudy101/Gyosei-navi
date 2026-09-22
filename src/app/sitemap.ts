import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import {
  getAllArticles,
  getArticlesByPrefecture,
  getArticlesByRegionCode,
  getArticlesBySectionAndLocale,
  getAvailableLocalesFor,
} from "@/lib/content";
import { getAllRankingArticles } from "@/lib/ranking";
import { CATEGORY_CODES } from "@/config/taxonomy";
import { PREFECTURES, MUNICIPALITIES, getPrefectureByCode } from "@/config/regions";
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
  // 記事が0件の都道府県ページは薄いページなので sitemap から除外する
  // （/area 一覧からのリンクは残る — クロールは可能だが優先度を下げる）
  const prefPaths = PREFECTURES.filter((p) => getArticlesByPrefecture(p.code).length > 0).map(
    (p) => `/area/${p.slug}`
  );

  // 記事がある市区町村ページと、市区町村×カテゴリのハブページ
  const cityPaths: string[] = [];
  for (const m of MUNICIPALITIES) {
    const pref = getPrefectureByCode(m.prefCode);
    if (!pref) continue;
    const cityArticles = getArticlesByRegionCode(m.code);
    if (cityArticles.length === 0) continue;
    cityPaths.push(`/area/${pref.slug}/${m.slug}`);
    for (const c of CATEGORY_CODES) {
      if (cityArticles.some((a) => a.section === "subsidy" && a.category === c)) {
        cityPaths.push(`/area/${pref.slug}/${m.slug}/${c}`);
      }
    }
  }

  const staticPaths = [
    "/",
    "/subsidy",
    ...CATEGORY_CODES.map((c) => `/subsidy/${c}`),
    "/area",
    ...prefPaths,
    ...cityPaths,
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
