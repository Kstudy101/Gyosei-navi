/**
 * 広告アーキテクチャ共通型（作業指示書 §7）。
 * Rakuten 以外（Amazon/ASP/Direct）を将来追加する際もこの型を再利用する。
 * 今回実装するのは provider: "rakuten" の2種のみ（type: contextual / personalized）。
 */

export type AdProvider = "rakuten" | "amazon" | "asp" | "direct";
export type AdType = "contextual" | "personalized" | "banner";
export type AdPlacement = "article-middle" | "article-bottom" | "sidebar" | "homepage";
