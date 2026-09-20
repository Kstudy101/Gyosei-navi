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
  kyoiku: ["学習机", "文房具", "ランチグッズ", "学習タブレット"],
  kekkon: ["結婚式アルバム", "引っ越しダンボール", "新生活家電セット", "食器セット"],
};

/** 未定義カテゴリは空配列（呼び出し側で「広告なし」として扱う） */
export function getAdKeywords(category: string): string[] {
  return subsidyCategoryAdMapping[category] ?? [];
}

export function getMappedCategoryCodes(): string[] {
  return CATEGORY_CODES;
}
