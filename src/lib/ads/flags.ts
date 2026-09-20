/**
 * 広告 Feature Flag（作業指示書 §8）。
 * 環境変数が未設定なら true（有効）扱い — 未設定=無効ではない点に注意。
 * 明示的に "false" / "0" を指定した場合のみ無効化する。
 * RAKUTEN_AFFILIATE_ENABLED=false は他の全 Rakuten 広告フラグより優先する（マスタースイッチ）。
 */
function envFlag(name: string): boolean {
  const v = process.env[name];
  if (v === undefined || v === "") return true;
  return v !== "false" && v !== "0";
}

export function isRakutenAffiliateEnabled(): boolean {
  return envFlag("RAKUTEN_AFFILIATE_ENABLED");
}

export function isRakutenApiAdEnabled(): boolean {
  return isRakutenAffiliateEnabled() && envFlag("RAKUTEN_API_AD_ENABLED");
}

export function isRakutenMotionWidgetEnabled(): boolean {
  return isRakutenAffiliateEnabled() && envFlag("RAKUTEN_MOTION_WIDGET_ENABLED");
}
