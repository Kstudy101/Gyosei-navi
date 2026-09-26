/**
 * ホーム（くらしの便利帳型レイアウト）のデータ組み立て。
 * すべて published 記事の frontmatter から算出する — 数値を手で書かない。
 */
import { PREFECTURES, MUNICIPALITIES, REGION_BLOCKS } from "@/config/regions";
import { CATEGORIES } from "@/config/taxonomy";
import {
  getAllArticles,
  getArticlesByPrefecture,
  getArticlesByRegionCode,
  getArticlesBySection,
  type Article,
} from "@/lib/content";

export interface PrefectureIndexEntry {
  slug: string;
  labelJa: string;
  /** 都道府県配下（都道府県・市区町村）の published subsidy 記事数 */
  articleCount: number;
  /** 記事が1件以上ある市区町村の数 */
  municipalityCount: number;
}

export interface RegionIndexBlock {
  label: string;
  prefectures: PrefectureIndexEntry[];
}

/** 地域索引: 8地方 × 都道府県、各県の掲載件数つき */
export function buildRegionIndex(): RegionIndexBlock[] {
  return REGION_BLOCKS.map((block) => ({
    label: block.label,
    prefectures: block.prefCodes.map((code) => {
      const p = PREFECTURES.find((x) => x.code === code)!;
      return {
        slug: p.slug,
        labelJa: p.labelJa,
        articleCount: getArticlesByPrefecture(code).length,
        municipalityCount: MUNICIPALITIES.filter(
          (m) => m.prefCode === code && getArticlesByRegionCode(m.code).length > 0
        ).length,
      };
    }),
  }));
}

/** dateISO が todayISO の何日後か（過去は負）。締切の朱色判定に使う */
export function daysUntil(dateISO: string, todayISO: string): number {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(dateISO) - toUtc(todayISO)) / 86_400_000);
}

/** 初版公開後に更新された subsidy 記事を updatedAt 降順で */
export function getRecentlyUpdatedArticles(n: number): Article[] {
  return getArticlesBySection("subsidy")
    .filter((a) => a.frontmatter.updatedAt > a.frontmatter.publishedAt)
    .sort((a, b) => b.frontmatter.updatedAt.localeCompare(a.frontmatter.updatedAt))
    .slice(0, n);
}

export interface CategoryIndexEntry {
  code: string;
  labelJa: string;
  description: string;
  articleCount: number;
}

/** 目的別目次: 9カテゴリと掲載件数 */
export function getCategoryIndex(): CategoryIndexEntry[] {
  return CATEGORIES.map((c) => ({
    code: c.code,
    labelJa: c.labelJa,
    description: c.description,
    articleCount: getArticlesBySection("subsidy", c.code).length,
  }));
}

export interface SiteStats {
  subsidyCount: number;
  prefectureCount: number;
  municipalityCount: number;
  /** 全記事の updatedAt の最大値（題字の発行日に使う） */
  updatedAt: string;
}

export function getSiteStats(): SiteStats {
  const all = getAllArticles();
  return {
    subsidyCount: all.filter((a) => a.section === "subsidy").length,
    prefectureCount: PREFECTURES.filter((p) => getArticlesByPrefecture(p.code).length > 0).length,
    municipalityCount: MUNICIPALITIES.filter((m) => getArticlesByRegionCode(m.code).length > 0).length,
    updatedAt: all.reduce((max, a) => (a.frontmatter.updatedAt > max ? a.frontmatter.updatedAt : max), ""),
  };
}

/** "2026-09-06" → "2026年9月6日" */
export function formatJaDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

/** "2026-10-10" → "10月10日" */
export function formatMonthDay(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}月${d}日`;
}

/**
 * regionLabel の括弧書き（「県単独事業。regionCode は…」のような編集注記）を落として地域名だけにする。
 * 一覧の地域列は短く揃える必要があり、注記は記事本文側で読めれば足りる。
 */
export function shortRegionLabel(label: string): string {
  return label.replace(/[（(].*$/u, "").trim();
}

export interface DeadlineGroup {
  date: string;
  articles: Article[];
  /** 日付ごとの上限を超えて省いた件数（「ほかN件」） */
  more: number;
}

/**
 * 締切一覧を日付ごとにまとめる（便利帳のカレンダー式）。入力は periodEnd 昇順であること。
 * 同じ日に多数の締切が並ぶとき、日付ごと perDate 件までを載せて残りは件数だけ示し、次の日付が見えるようにする。
 */
export function groupDeadlines(articles: Article[], opts: { perDate: number; total: number }): DeadlineGroup[] {
  const groups: DeadlineGroup[] = [];
  let rows = 0;
  for (const a of articles) {
    const date = a.frontmatter.subsidy!.periodEnd!;
    let g = groups[groups.length - 1];
    if (!g || g.date !== date) {
      if (rows >= opts.total) break;
      g = { date, articles: [], more: 0 };
      groups.push(g);
    }
    if (g.articles.length < opts.perDate && rows < opts.total) {
      g.articles.push(a);
      rows++;
    } else {
      g.more++;
    }
  }
  return groups;
}
