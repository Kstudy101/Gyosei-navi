/**
 * 地域コード ↔ ローマ字スラッグ マッピング v2（新設）
 * 設計意図: docs/01_IA_TAXONOMY.md §4.1
 *
 * 識別子は総務省 全国地方公共団体コード（5桁）を正とする。
 * 表示・URL 用のローマ字スラッグはこのファイルでのみ管理する（docs/02 設計原則5）。
 *
 * 現状: 47都道府県は全件登録。市区町村（約1,700）は全件を一度に持たず、
 * 記事化・データ確保が進んだ地域から追加する（docs/00 v2 §8 ロードマップの段階拡大方針）。
 * 未登録の市区町村を参照するコードは、登録前提にせず `unresearched` 状態として扱うこと。
 */

export interface PrefectureDef {
  /** 総務省 都道府県コード（2桁） */
  code: string;
  slug: string;
  labelJa: string;
}

export const PREFECTURES: readonly PrefectureDef[] = [
  { code: "01", slug: "hokkaido", labelJa: "北海道" },
  { code: "02", slug: "aomori", labelJa: "青森県" },
  { code: "03", slug: "iwate", labelJa: "岩手県" },
  { code: "04", slug: "miyagi", labelJa: "宮城県" },
  { code: "05", slug: "akita", labelJa: "秋田県" },
  { code: "06", slug: "yamagata", labelJa: "山形県" },
  { code: "07", slug: "fukushima", labelJa: "福島県" },
  { code: "08", slug: "ibaraki", labelJa: "茨城県" },
  { code: "09", slug: "tochigi", labelJa: "栃木県" },
  { code: "10", slug: "gunma", labelJa: "群馬県" },
  { code: "11", slug: "saitama", labelJa: "埼玉県" },
  { code: "12", slug: "chiba", labelJa: "千葉県" },
  { code: "13", slug: "tokyo", labelJa: "東京都" },
  { code: "14", slug: "kanagawa", labelJa: "神奈川県" },
  { code: "15", slug: "niigata", labelJa: "新潟県" },
  { code: "16", slug: "toyama", labelJa: "富山県" },
  { code: "17", slug: "ishikawa", labelJa: "石川県" },
  { code: "18", slug: "fukui", labelJa: "福井県" },
  { code: "19", slug: "yamanashi", labelJa: "山梨県" },
  { code: "20", slug: "nagano", labelJa: "長野県" },
  { code: "21", slug: "gifu", labelJa: "岐阜県" },
  { code: "22", slug: "shizuoka", labelJa: "静岡県" },
  { code: "23", slug: "aichi", labelJa: "愛知県" },
  { code: "24", slug: "mie", labelJa: "三重県" },
  { code: "25", slug: "shiga", labelJa: "滋賀県" },
  { code: "26", slug: "kyoto", labelJa: "京都府" },
  { code: "27", slug: "osaka", labelJa: "大阪府" },
  { code: "28", slug: "hyogo", labelJa: "兵庫県" },
  { code: "29", slug: "nara", labelJa: "奈良県" },
  { code: "30", slug: "wakayama", labelJa: "和歌山県" },
  { code: "31", slug: "tottori", labelJa: "鳥取県" },
  { code: "32", slug: "shimane", labelJa: "島根県" },
  { code: "33", slug: "okayama", labelJa: "岡山県" },
  { code: "34", slug: "hiroshima", labelJa: "広島県" },
  { code: "35", slug: "yamaguchi", labelJa: "山口県" },
  { code: "36", slug: "tokushima", labelJa: "徳島県" },
  { code: "37", slug: "kagawa", labelJa: "香川県" },
  { code: "38", slug: "ehime", labelJa: "愛媛県" },
  { code: "39", slug: "kochi", labelJa: "高知県" },
  { code: "40", slug: "fukuoka", labelJa: "福岡県" },
  { code: "41", slug: "saga", labelJa: "佐賀県" },
  { code: "42", slug: "nagasaki", labelJa: "長崎県" },
  { code: "43", slug: "kumamoto", labelJa: "熊本県" },
  { code: "44", slug: "oita", labelJa: "大分県" },
  { code: "45", slug: "miyazaki", labelJa: "宮崎県" },
  { code: "46", slug: "kagoshima", labelJa: "鹿児島県" },
  { code: "47", slug: "okinawa", labelJa: "沖縄県" },
] as const;

export interface MunicipalityDef {
  /** 総務省 全国地方公共団体コード（5桁） */
  code: string;
  slug: string;
  labelJa: string;
  prefCode: string;
}

/**
 * 市区町村レジストリ（段階拡大）。
 * 記事化する自治体が決まり次第、ここに追加する。
 * 2026-09-20: 出産・子育て給付の地域比較記事のため東京23区のうち5区を追加登録。
 */
export const MUNICIPALITIES: readonly MunicipalityDef[] = [
  { code: "13101", slug: "chiyoda", labelJa: "千代田区", prefCode: "13" },
  { code: "13103", slug: "minato", labelJa: "港区", prefCode: "13" },
  { code: "13109", slug: "shinagawa", labelJa: "品川区", prefCode: "13" },
  { code: "13112", slug: "setagaya", labelJa: "世田谷区", prefCode: "13" },
  { code: "13113", slug: "shibuya", labelJa: "渋谷区", prefCode: "13" },
];

export const getPrefectureBySlug = (slug: string): PrefectureDef | undefined =>
  PREFECTURES.find((p) => p.slug === slug);

export const getPrefectureByCode = (code: string): PrefectureDef | undefined =>
  PREFECTURES.find((p) => p.code === code);

export const getMunicipalityBySlug = (
  prefSlug: string,
  citySlug: string
): MunicipalityDef | undefined => {
  const pref = getPrefectureBySlug(prefSlug);
  if (!pref) return undefined;
  return MUNICIPALITIES.find((m) => m.prefCode === pref.code && m.slug === citySlug);
};

/** 国レベル（都道府県・市区町村を問わない全国共通制度）を表す特殊コード */
export const NATIONAL_REGION_CODE = "00000";
