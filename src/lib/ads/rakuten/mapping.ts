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
  kaigo: ["介護用品", "手すり", "歩行器", "介護ベッド"],
  energy: ["LED照明", "省エネ家電", "エアコン"],
};

/** 未定義カテゴリは空配列（呼び出し側で「広告なし」として扱う） */
export function getAdKeywords(category: string): string[] {
  return subsidyCategoryAdMapping[category] ?? [];
}

export function getMappedCategoryCodes(): string[] {
  return CATEGORY_CODES;
}
