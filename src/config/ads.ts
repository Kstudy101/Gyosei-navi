/**
 * 自社販売広告（行政書士・士業事務所向け掲載枠）の設定マスター。
 *
 * 法的設計（docs/06 §2 — 2026-08-19 決定）:
 *   - 月額固定の掲載料のみ。紹介件数・成約報酬・クリック課金は扱わない
 *     （有償あっせんと評価されるリスクを構造的に排除する）。
 *   - 全スロットに「広告」ラベルを常時表示（景品表示法・ステマ規制）。
 *   - 編集権は独立 — 広告掲載は記事内容に一切影響しない。
 *
 * 運用: 広告主が決まったら該当スロットの advertiser を記入し、
 * バナー画像を public/ad-banners/ に置く。null のスロットは
 * 「広告主募集中」プレースホルダー（/ads へのリンク）が表示される。
 */

/** 広告掲載の問い合わせ先（Xserver のドメインメール — 2026-08-19 作成済み） */
export const ADS_CONTACT_EMAIL = "info@gyosei-navi.jp";

export type Advertiser = {
  /** 表示名（例: 行政書士◯◯事務所） */
  name: string;
  /** 行政書士登録番号（掲載基準 — 実在確認済みであること） */
  registrationNo: string;
  /** リンク先（事務所サイト） */
  url: string;
  /** バナー画像（public/ 配下の絶対パス。レール: 縦長 320×800 相当 / カード: 横長 1200×300 相当） */
  imgSrc: string;
  alt: string;
};

export type AdSlotPosition = "rail-left" | "rail-right" | "article-bottom";

export type AdSlot = {
  id: string;
  position: AdSlotPosition;
  /** null = 募集中プレースホルダーを表示 */
  advertiser: Advertiser | null;
};

export const AD_SLOTS: readonly AdSlot[] = [
  { id: "rail-left-1", position: "rail-left", advertiser: null },
  { id: "rail-right-1", position: "rail-right", advertiser: null },
  { id: "article-bottom-1", position: "article-bottom", advertiser: null },
];

export const getAdSlot = (position: AdSlotPosition): AdSlot | undefined =>
  AD_SLOTS.find((s) => s.position === position);
