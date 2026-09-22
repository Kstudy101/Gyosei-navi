import { CATEGORY_CODES } from "@/config/taxonomy";

/**
 * 補助金カテゴリ → 楽天商品検索キーワードのマッピング（作業指示書 §4）。
 * 既存の taxonomy.ts の CATEGORY_CODES をそのまま流用し、新しいカテゴリ体系は作らない。
 * キーワードは記事ごとの手書きではなく、ここ1箇所だけで管理する。
 *
 * 注意: CategoryCode（config/taxonomy.ts）は実質 string 型のため、
 * TypeScript の網羅性チェックは効かない。CATEGORY_CODES 全件を確認するテストは
 * mapping.test.ts 側で担保する。
 */
export const subsidyCategoryAdMapping: Record<string, string[]> = {
  shussan: ["ベビーカー", "チャイルドシート", "抱っこ紐", "ベビー用品"],
  jutaku: ["カーテン", "照明器具", "収納家具", "掃除機"],
  sogyo: ["オフィスデスク", "オフィスチェア", "プリンター", "タブレット"],
  kaigo: ["介護用品", "大人用紙おむつ", "歩行器", "手すり", "集音器"],
  energy: ["ソーラーパネル", "家庭用蓄電池", "EV充電器", "LED照明"],
  pet: ["ペットフード", "ペットケージ", "ペットシーツ", "犬用サークル"],
  shogaisha: ["車椅子", "介護用スロープ", "福祉用具", "歩行補助杖"],
  kyoiku: ["学習机", "文房具", "一人暮らし家電セット", "学習タブレット"],
  kekkon: ["結婚式アルバム", "引っ越しダンボール", "新生活家電セット", "食器セット"],
};

/** 未定義カテゴリは空配列（呼び出し側で「広告なし」として扱う） */
export function getAdKeywords(category: string): string[] {
  return subsidyCategoryAdMapping[category] ?? [];
}

export function getMappedCategoryCodes(): string[] {
  return CATEGORY_CODES;
}

/**
 * category frontmatter を持たない記事（/ranking 等）向け — タイトル等の自由文から
 * 既存 subsidy カテゴリを推測する（作業指示書 §4 拡張）。
 * 該当なしは null を返し、呼び出し側は「広告なし」として扱う（無理に一致させない）。
 */
const categoryInferenceKeywords: Record<string, string[]> = {
  shussan: ["出産", "育児", "子育て", "保育"],
  jutaku: ["住宅", "リフォーム", "移住", "空き家", "引っ越し"],
  sogyo: ["創業", "起業", "事業者", "持続化", "小規模事業者", "事業再構築"],
  kaigo: ["介護", "高齢者", "高齢"],
  energy: ["太陽光", "蓄電池", "EV", "断熱", "省エネ"],
  pet: ["ペット", "犬", "猫"],
  shogaisha: ["障害者", "障がい者", "補装具", "障害福祉"],
  kyoiku: ["奨学金", "就学", "高校生"],
  kekkon: ["結婚", "新婚"],
};

export function inferCategoryFromText(text: string): string | null {
  for (const code of CATEGORY_CODES) {
    const keywords = categoryInferenceKeywords[code] ?? [];
    if (keywords.some((k) => text.includes(k))) return code;
  }
  return null;
}
