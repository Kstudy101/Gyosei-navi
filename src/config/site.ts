/**
 * サイト全体の基本設定
 * ※ 法的注意: 有資格者になるまで「行政書士事務所」を名乗る表現は使用しない。
 */

export const siteConfig = {
  name: "行政書士ナビ・ジャーナル", // 2026-08-17 行政タイムズ案を検討の後、原案を維持と確定
  shortName: "行政書士ナビ",
  url: "https://gyosei-navi.jp", // 2026-08-17 ドメイン確定（Xserver）。取得・DNS 反映は docs/11 参照
  locale: "ja_JP",
  lang: "ja",
  description:
    "在留資格・許認可・法人設立・相続まで、行政書士業務の全分野を一次情報から解説する総合情報メディア。制度改正を最速でお届けします。",
  keywords: [
    "行政書士",
    "在留資格",
    "永住許可",
    "育成就労",
    "建設業許可",
    "法人設立",
    "相続",
    "補助金",
  ],
  publisher: {
    // 運営者情報（E-E-A-T 必須）
    name: "編集部", // TODO: 実名 or 屋号
    type: "Organization",
    // 資格状況は正直に記載する（信頼獲得 + 法19条リスク回避）
    qualificationNote: "本サイト運営者は行政書士試験受験中であり、有資格者ではありません。",
  },
  // 全ページ共通の免責文（フッター固定）
  disclaimer:
    "本サイトは行政書士業務に関する一般的な情報提供を目的としており、個別の法律相談・書類作成代行は行っておりません。個別のご相談は有資格の行政書士へご依頼ください。掲載情報は執筆時点のものであり、最新の法令・運用と異なる場合があります。",
  social: {
    x: "", // TODO
    note: "", // TODO
    line: "", // TODO: LINE公式アカウント
  },
  analytics: {
    // 計測 ID はハードコードせず .env.local で設定する（docs/youtube.md §2）
    ga4: process.env.NEXT_PUBLIC_GA4_ID ?? "",
    clarity: process.env.NEXT_PUBLIC_CLARITY_ID ?? "",
    // AdSense クライアント ID（ca-pub-…）。public/ads.txt と対で管理
    adsense: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
  },
  /** 1ページあたりの記事表示件数 */
  postsPerPage: 12,
} as const;

export type SiteConfig = typeof siteConfig;
