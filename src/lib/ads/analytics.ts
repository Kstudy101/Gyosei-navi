/**
 * Affiliate 広告イベント計測（作業指示書 §14）。
 * 既存の GA4 導入（src/components/seo/Analytics.tsx が window.gtag を初期化）に相乗りする。
 * gtag 未導入（開発環境・GA4未設定）では何もしない no-op。
 * 個人情報・ユーザー識別情報は payload に含めない。
 */

export type AffiliateAdType = "contextual" | "motion";
export type AffiliatePlacement = "article_middle" | "article_bottom" | "sidebar" | "homepage";

export interface AffiliateEventPayload {
  provider: "rakuten" | "valuecommerce";
  ad_type: AffiliateAdType;
  placement: AffiliatePlacement;
  article_id?: string;
  article_category?: string;
  advertiser_id?: string;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sendEvent(name: "affiliate_impression" | "affiliate_click", payload: AffiliateEventPayload): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, payload);
}

export function trackAffiliateImpression(payload: AffiliateEventPayload): void {
  sendEvent("affiliate_impression", payload);
}

export function trackAffiliateClick(payload: AffiliateEventPayload): void {
  sendEvent("affiliate_click", payload);
}
