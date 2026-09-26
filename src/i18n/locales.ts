/**
 * 翻訳対象言語マスター。在留外国人統計上位言語（2026-09-20時点方針）。
 * 日本語（原文）はこの配列に含めない — URLプレフィックスなしの既存ルートがそのまま原文。
 */

export const LOCALES = ["en", "zh-CN", "zh-TW", "vi", "ko", "fil", "ne", "id", "th"] as const;

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
