/**
 * 分類体系（タクソノミー）マスター
 * ここが唯一の正（Single Source of Truth）。
 * content/ 配下のディレクトリ名と category コードは必ず一致させること。
 */

/* ------------------------------------------------------------------ */
/* 1. セクション（第1階層）                                             */
/* ------------------------------------------------------------------ */

export const SECTIONS = {
  news: { label: "速報・動向", path: "/news", audience: "all" },
  guide: { label: "手続きガイド", path: "/guide", audience: "consumer" },
  practice: { label: "実務インテリジェンス", path: "/practice", audience: "pro" },
  exam: { label: "試験・開業", path: "/exam", audience: "pre-pro" },
  tools: { label: "診断ツール", path: "/tools", audience: "consumer" },
  data: { label: "資料室", path: "/data", audience: "all" },
} as const;

export type SectionCode = keyof typeof SECTIONS;

/* ------------------------------------------------------------------ */
/* 2. 業務8大分野（guide 配下のカテゴリ）                                */
/* ------------------------------------------------------------------ */

export interface CategoryDef {
  code: string;
  labelJa: string;
  labelShort: string;
  /** 展開優先度: P0 が最優先 */
  priority: "P0" | "P1" | "P2" | "P3";
  description: string;
  /** 主要検索意図キーワード（記事企画の起点） */
  seedKeywords: string[];
}

export const CATEGORIES: readonly CategoryDef[] = [
  {
    code: "nyukan",
    labelJa: "入管業務・国際業務",
    labelShort: "入管・国際",
    priority: "P0",
    description:
      "在留資格の取得・変更・更新、永住許可、帰化、育成就労、外国人雇用など国際関連業務。",
    seedKeywords: [
      "在留資格",
      "永住許可",
      "帰化申請",
      "育成就労",
      "特定技能",
      "技術・人文知識・国際業務",
      "経営・管理",
      "配偶者ビザ",
    ],
  },
  {
    code: "houjin",
    labelJa: "法人設立・企業法務",
    labelShort: "法人設立",
    priority: "P1",
    description: "株式会社・合同会社の設立、定款作成・認証、各種法人の設立支援。",
    seedKeywords: ["会社設立", "合同会社 設立", "定款認証", "一般社団法人", "NPO法人"],
  },
  {
    code: "kyoninka",
    labelJa: "建設業・各種許認可",
    labelShort: "許認可",
    priority: "P1",
    description: "建設業許可、飲食店営業、古物商、風俗営業、産廃、宅建業などの許認可申請。",
    seedKeywords: ["建設業許可", "飲食店営業許可", "古物商許可", "風俗営業許可", "産業廃棄物"],
  },
  {
    code: "souzoku",
    labelJa: "相続・遺言",
    labelShort: "相続",
    priority: "P1",
    description: "遺産分割協議書、相続関係説明図、遺言書作成支援、相続手続き全般。",
    seedKeywords: ["遺産分割協議書", "相続手続き", "遺言書 作成", "相続放棄", "法定相続情報"],
  },
  {
    code: "hojokin",
    labelJa: "補助金・助成金",
    labelShort: "補助金",
    priority: "P2",
    description: "国・自治体の補助金／助成金の申請支援、事業計画書作成。",
    seedKeywords: ["補助金 申請", "小規模事業者持続化補助金", "ものづくり補助金", "助成金"],
  },
  {
    code: "jidosha",
    labelJa: "自動車・運輸",
    labelShort: "自動車",
    priority: "P2",
    description: "車庫証明、名義変更、自動車登録、貨物・旅客運送事業許可。",
    seedKeywords: ["車庫証明", "名義変更", "自動車登録", "運送業許可", "貨物利用運送"],
  },
  {
    code: "keiyaku",
    labelJa: "契約書・民事法務",
    labelShort: "契約・民事",
    priority: "P2",
    description: "各種契約書作成、内容証明、離婚協議書、示談書などの民事書類。",
    seedKeywords: ["契約書 作成", "内容証明", "離婚協議書", "示談書", "公正証書"],
  },
  {
    code: "shinryoiki",
    labelJa: "新領域",
    labelShort: "新領域",
    priority: "P3",
    description: "ドローン飛行許可、ペット関連、民泊、IT・データ関連許認可など成長分野。",
    seedKeywords: ["ドローン 飛行許可", "動物取扱業", "民泊 許可", "電気通信事業届出"],
  },
] as const;

export const CATEGORY_CODES = CATEGORIES.map((c) => c.code);
export type CategoryCode = (typeof CATEGORIES)[number]["code"];

/* ------------------------------------------------------------------ */
/* 3. practice 配下のカテゴリ（専門家向け）                              */
/* ------------------------------------------------------------------ */

export const PRACTICE_CATEGORIES = {
  jitsumu: { labelJa: "分野別実務論点", description: "許可基準・審査要領・自治体差の実務解説" },
  dx: { labelJa: "IT・DX／電子申請", description: "電子申請、Lステップ、AI活用、業務自動化" },
  keiei: { labelJa: "事務所経営・集客", description: "単価設定、集客導線、他士業連携、開業実務" },
} as const;

/* ------------------------------------------------------------------ */
/* 4. 横断タグ（カテゴリと直交する軸）                                   */
/* ------------------------------------------------------------------ */

/** 読者軸 */
export const AUDIENCE_TAGS = {
  "for-individual": "一般個人向け",
  "for-business": "企業・経営者向け",
  "for-pro": "現役行政書士向け",
  "for-exam": "受験生・開業準備者向け",
} as const;
export type AudienceTag = keyof typeof AUDIENCE_TAGS;

/** 制度軸（大型テーマ。特集ページの単位になる） */
export const THEME_TAGS = {
  "houkaisei-2026": "行政書士法改正2026",
  "ikusei-shuro": "育成就労制度",
  "eiju-guideline": "永住ガイドライン改定",
  "denshi-shinsei": "電子申請・DX",
  "gaikokujin-koyo": "外国人雇用",
} as const;

/** 形式軸 */
export const TYPE_TAGS = {
  pillar: "総合ガイド",
  cluster: "個別解説",
  news: "速報",
  checklist: "チェックリスト",
  interview: "インタビュー",
  tool: "診断ツール",
} as const;
export type ContentType = keyof typeof TYPE_TAGS;

/** 制度ステータス（記事上部の警告バナー制御に使用） */
export const NOTICE_LEVELS = {
  enforced: { label: "施行済", tone: "neutral", banner: null },
  scheduled: {
    label: "施行予定",
    tone: "info",
    banner: "この制度は施行予定です。施行日までに内容が変更される可能性があります。",
  },
  "draft-proposal": {
    label: "改定案",
    tone: "warning",
    banner:
      "本記事は公表された「改定案」に基づく解説です。確定した制度ではなく、今後変更される可能性があります。",
  },
  outdated: {
    label: "旧制度",
    tone: "danger",
    banner: "本記事は改正前の制度に関する解説です。最新情報は関連記事をご確認ください。",
  },
} as const;
export type NoticeLevel = keyof typeof NOTICE_LEVELS;

/* ------------------------------------------------------------------ */
/* 5. ヘルパ                                                            */
/* ------------------------------------------------------------------ */

export const getCategory = (code: string): CategoryDef | undefined =>
  CATEGORIES.find((c) => c.code === code);
