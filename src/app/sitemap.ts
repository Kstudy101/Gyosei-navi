import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import {
  MIN_HUB_ARTICLES,
  getAllArticles,
  getArticlesByPrefecture,
  getArticlesByPrefectureAndCategory,
  getArticlesByRegionCode,
  getTagsWithArchivePage,
} from "@/lib/content";
import { getAllRankingArticles } from "@/lib/ranking";
import { CATEGORY_CODES, TOKUSHU_CATEGORY_CODES } from "@/config/taxonomy";
import { PREFECTURES, MUNICIPALITIES, getPrefectureByCode } from "@/config/regions";

// output: "export"（静的ホスティング）ではメタデータルートも静的生成を明示する必要がある
export const dynamic = "force-static";

/**
 * sitemap に載せるのは「index させたいページ」だけ（2026-09-26 GSC 対策、docs/17）。
 *   - 記事 MIN_HUB_ARTICLES 件未満の地域ハブ（都道府県×カテゴリ / 市区町村 / 市区町村×カテゴリ）は
 *     noindex にしているので載せない（page.tsx 側の robots と同じしきい値）
 *   - タグアーカイブは生成条件（MIN_TAG_ARCHIVE_ARTICLES）を満たすものだけ
 *   - 翻訳ページ（/{locale}/…）は noindex のため載せず、hreflang alternates も出さない
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // 記事が0件の都道府県ページは薄いページなので sitemap から除外する
  // （/area 一覧からのリンクは残る — クロールは可能だが優先度を下げる）
  const prefPaths = PREFECTURES.filter((p) => getArticlesByPrefecture(p.code).length > 0).map(
    (p) => `/area/${p.slug}`
  );

  // 都道府県×カテゴリのハブページ
  const prefCategoryPaths = PREFECTURES.flatMap((p) =>
    CATEGORY_CODES.filter(
      (c) => getArticlesByPrefectureAndCategory(p.code, c).length >= MIN_HUB_ARTICLES
    ).map((c) => `/area/${p.slug}/${c}`)
  );

  const tagPaths = getTagsWithArchivePage().map((t) => `/tag/${t}`);

  // 市区町村ページと、市区町村×カテゴリのハブページ
  const cityPaths: string[] = [];
  for (const m of MUNICIPALITIES) {
    const pref = getPrefectureByCode(m.prefCode);
    if (!pref) continue;
    const cityArticles = getArticlesByRegionCode(m.code);
    if (cityArticles.length >= MIN_HUB_ARTICLES) cityPaths.push(`/area/${pref.slug}/${m.slug}`);
    for (const c of CATEGORY_CODES) {
      const n = cityArticles.filter((a) => a.section === "subsidy" && a.category === c).length;
      if (n >= MIN_HUB_ARTICLES) cityPaths.push(`/area/${pref.slug}/${m.slug}/${c}`);
    }
  }

  const staticPaths = [
    "/",
    "/subsidy",
    ...CATEGORY_CODES.map((c) => `/subsidy/${c}`),
    "/area",
    ...prefPaths,
    ...prefCategoryPaths,
    ...cityPaths,
    ...tagPaths,
    "/tokushu",
    ...TOKUSHU_CATEGORY_CODES.map((c) => `/tokushu/${c}`),
    "/compare",
    "/news",
    "/calendar",
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
    .map((a) => ({
      url: absoluteUrl(a.href),
      lastModified: a.frontmatter.updatedAt,
      changeFrequency: "weekly" as const,
    }));

  const rankingArticles = getAllRankingArticles().map((a) => ({
    url: absoluteUrl(a.href),
    lastModified: a.frontmatter.updatedAt,
    changeFrequency: "weekly" as const,
  }));

  return [...staticPaths, ...articles, ...rankingArticles];
}
