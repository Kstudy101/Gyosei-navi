import { isRakutenMotionWidgetEnabled } from "@/lib/ads/flags";
import type { AdPlacement } from "@/lib/ads/types";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdImpressionTracker } from "@/components/ads/AdImpressionTracker";
import { RakutenMotionWidgetClient } from "@/components/ads/RakutenMotionWidgetClient";

/**
 * ユーザー適応型（楽天モーションウィジェット）— 作業指示書 §6, §16-1。
 * <RakutenMotionWidget placement="article-bottom" /> の形で記事へ直接埋め込む。
 * Rakuten の生スクリプトは記事側に一切書かず、このコンポーネント内部だけで完結させる。
 * Server Component: RAKUTEN_AFFILIATE_ID / RAKUTEN_MOTION_WIDGET_ID をビルド時に解決し、
 * 値そのものは（ウィジェットの性質上ブラウザに出る前提で）Client Component へ props で渡す。
 */
export function RakutenMotionWidget({ placement = "article-bottom" }: { placement?: AdPlacement }) {
  if (!isRakutenMotionWidgetEnabled()) return null;

  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  const widgetTs = process.env.RAKUTEN_MOTION_WIDGET_ID;
  if (!affiliateId || !widgetTs) return null;

  return (
    <AdSlot provider="rakuten" type="personalized" placement={placement} heading="あなたへのおすすめ">
      <AdImpressionTracker
        event={{
          provider: "rakuten",
          ad_type: "motion",
          placement: placement === "article-bottom" ? "article_bottom" : "sidebar",
        }}
      />
      <RakutenMotionWidgetClient affiliateId={affiliateId} widgetTs={widgetTs} />
    </AdSlot>
  );
}
