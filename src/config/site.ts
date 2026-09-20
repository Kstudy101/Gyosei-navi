/**
 * サイト全体の基本設定
 * v2: 全国補助金・助成金情報サイトへの全面転換に伴い再作成（docs/00_MASTER_PLAN.md v2 参照）
 */

export const siteConfig = {
  name: "全国補助金ナビ",
  shortName: "補助金ナビ",
  url: "https://gyosei-navi.jp", // ドメインはリブランディングのみで継承（docs/00 v2 §0）
  locale: "ja_JP",
  lang: "ja",
  description:
    "国・都道府県・市区町村の補助金・助成金を地域ごとに比較できる情報サイト。出産・育児、住宅、創業、介護など目的別に、最新の募集状況をお届けします。",
  keywords: [
    "補助金",
    "助成金",
    "出産祝い金",
    "移住支援金",
    "創業補助金",
    "地域 比較",
  ],
  publisher: {
    name: "編集部",
    type: "Organization",
  },
  /** 全ページ共通の免責文（フッター固定）— docs/06_LEGAL_COMPLIANCE.md v2 §3.1 */
  disclaimer:
    "本サイトは補助金・助成金制度に関する情報提供を目的としています。掲載情報は執筆時点のものであり、最新の制度内容と異なる場合があります。申請の可否は各制度の実施主体による審査結果によります。個別の申請書類の作成代行は行っておりません。",
  social: {
    x: "",
    line: "",
  },
  analytics: {
    ga4: process.env.NEXT_PUBLIC_GA4_ID ?? "",
    clarity: process.env.NEXT_PUBLIC_CLARITY_ID ?? "",
    adsense: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
  },
  /** 1ページあたりの記事表示件数 */
  postsPerPage: 12,
} as const;

export type SiteConfig = typeof siteConfig;
