/**
 * UI文字列辞書の型。ja.ts のキー構造が基準（全ロケールがこの形を満たす必要がある）。
 * 範囲は最小限: ヘッダーナビ・カテゴリ短縮ラベル・パンくずの文言のみ。
 */

export interface Dictionary {
  sections: {
    subsidy: string;
    area: string;
    compare: string;
    tokushu: string;
    news: string;
  };
  categories: {
    shussan: string;
    jutaku: string;
    sogyo: string;
    kaigo: string;
    energy: string;
  };
  common: {
    home: string;
    language: string;
    viewOriginal: string;
  };
}
