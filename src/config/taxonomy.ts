/**
 * 分類体系（タクソノミー）マスター v2
 * ここが唯一の正（Single Source of Truth）。
 * content/ 配下のディレクトリ名と category コードは必ず一致させること。
 * 設計意図: docs/01_IA_TAXONOMY.md
 */

/* ------------------------------------------------------------------ */
/* 1. セクション（第1階層）                                             */
/* ------------------------------------------------------------------ */

export const SECTIONS = {
  subsidy: { label: "補助金を探す", path: "/subsidy", audience: "all" },
  area: { label: "地域から探す", path: "/area", audience: "all" },
  compare: { label: "地域比較", path: "/compare", audience: "all" },
  tokushu: { label: "特集", path: "/tokushu", audience: "all" },
  news: { label: "新着・締切情報", path: "/news", audience: "all" },
} as const;

export type SectionCode = keyof typeof SECTIONS;

/* ------------------------------------------------------------------ */
/* 2. カテゴリ（目的別分類、subsidy 配下）                               */
/* ------------------------------------------------------------------ */

export interface CategoryDef {
  code: string;
  labelJa: string;
  labelShort: string;
  description: string;
  /** 主要検索意図キーワード（記事企画の起点） */
  seedKeywords: string[];
}

/**
 * 初期カテゴリ（多分野同時着手方針 — docs/00 v2 §0, docs/01 §3）。
 * 実際の新設は「Pillar 1本 + Cluster 3本を同時に出せる時のみ」（docs/01 §6）。
 */
export const CATEGORIES: readonly CategoryDef[] = [
  {
    code: "shussan",
    labelJa: "出産・育児",
    labelShort: "出産育児",
    description: "出産祝い金、育児支援金、保育料補助など出産・子育てに関する給付制度。",
    seedKeywords: ["出産祝い金", "出産育児一時金", "育児支援金", "保育料 補助"],
  },
  {
    code: "jutaku",
    labelJa: "住宅・引っ越し",
    labelShort: "住宅引越",
    description: "住宅リフォーム補助、移住支援金、公営住宅関連の給付制度。",
    seedKeywords: ["住宅リフォーム 補助金", "移住支援金", "空き家 改修 補助"],
  },
  {
    code: "sogyo",
    labelJa: "創業・事業",
    labelShort: "創業事業",
    description: "創業補助金、事業再構築補助金、小規模事業者持続化補助金など事業者向け制度。",
    seedKeywords: ["創業補助金", "事業再構築補助金", "小規模事業者持続化補助金"],
  },
  {
    code: "kaigo",
    labelJa: "高齢・介護",
    labelShort: "高齢介護",
    description: "介護リフォーム補助、高齢者向け給付制度。",
    seedKeywords: ["介護リフォーム 補助金", "高齢者 助成金"],
  },
  {
    code: "energy",
    labelJa: "エネルギー・環境",
    labelShort: "エネルギー",
    description: "太陽光発電、断熱リフォーム、EV導入などに関する補助金。",
    seedKeywords: ["太陽光 補助金", "断熱リフォーム 補助金", "EV 補助金"],
  },
] as const;

export const CATEGORY_CODES = CATEGORIES.map((c) => c.code);
export type CategoryCode = (typeof CATEGORIES)[number]["code"];

export const getCategory = (code: string): CategoryDef | undefined =>
  CATEGORIES.find((c) => c.code === code);

/* ------------------------------------------------------------------ */
/* 2-2. 特集のカテゴリ（tokushu 配下、subsidy の CATEGORIES とは別体系）    */
/* ------------------------------------------------------------------ */

/**
 * 特集（編集的ランキングコンテンツ）のテーマ軸。docs/01 §7。
 * subsidy の目的別カテゴリと違い、複数の subsidy カテゴリを横断してよい
 * （例: 「子育てに手厚い市」は shussan + kaigo のデータを併用しうる）。
 * 今後継続的に追加していく前提で設計する — 新設条件は docs/01 §7.2。
 *
 * 2026-09-20 時点: 実際の特集記事はまだ0件（比較対象の自治体データが
 * 最低5件に達したカテゴリのみ発行可 — content-schema.ts の refine で強制）。
 * ここではカテゴリの器だけを先に用意する。
 */
export const TOKUSHU_CATEGORIES: readonly CategoryDef[] = [
  {
    code: "kosodate",
    labelJa: "子育て支援",
    labelShort: "子育て",
    description: "出産祝い金・保育料補助など、子育て世帯への支援が手厚い自治体のランキング特集。",
    seedKeywords: ["子育て 手厚い 市", "出産祝い金 ランキング", "子育て支援 自治体 比較"],
  },
] as const;

export const TOKUSHU_CATEGORY_CODES = TOKUSHU_CATEGORIES.map((c) => c.code);
export type TokushuCategoryCode = (typeof TOKUSHU_CATEGORIES)[number]["code"];

export const getTokushuCategory = (code: string): CategoryDef | undefined =>
  TOKUSHU_CATEGORIES.find((c) => c.code === code);

/* ------------------------------------------------------------------ */
/* 3. 補助金の実施主体レベル                                            */
/* ------------------------------------------------------------------ */

export const PROVIDER_LEVELS = {
  national: "国",
  prefecture: "都道府県",
  municipality: "市区町村",
} as const;
export type ProviderLevel = keyof typeof PROVIDER_LEVELS;

/* ------------------------------------------------------------------ */
/* 4. 募集状況（subsidy.status）                                       */
/* ------------------------------------------------------------------ */

export const SUBSIDY_STATUSES = {
  open: { label: "募集中", tone: "positive" },
  closed: { label: "締切", tone: "neutral" },
  ongoing: { label: "通年", tone: "info" },
  /** 調査未着手。「該当なし」と絶対に混同しない（docs/01 §4.2, AGENTS.md 絶対規則6） */
  unresearched: { label: "調査中", tone: "warning" },
} as const;
export type SubsidyStatus = keyof typeof SUBSIDY_STATUSES;

/* ------------------------------------------------------------------ */
/* 5. 形式軸（記事タイプ）                                              */
/* ------------------------------------------------------------------ */

export const TYPE_TAGS = {
  pillar: "総合ガイド",
  cluster: "個別解説",
  compare: "地域比較",
  tokushu: "特集",
  news: "速報",
  checklist: "チェックリスト",
  tool: "診断ツール",
} as const;
export type ContentType = keyof typeof TYPE_TAGS;
