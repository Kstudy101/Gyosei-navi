"use client";

import { useEffect, useRef } from "react";
import { trackAffiliateImpression, type AffiliateEventPayload } from "@/lib/ads/analytics";

/**
 * 広告枠が実際に画面内へ入ったタイミングで affiliate_impression を1回だけ発火する。
 * 見た目を持たない計測専用要素（高さ1pxで IntersectionObserver の対象にする）。
 */
export function AdImpressionTracker({ event }: { event: AffiliateEventPayload }) {
  const ref = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (firedRef.current || !entries.some((e) => e.isIntersecting)) return;
        firedRef.current = true;
        trackAffiliateImpression(event);
        observer.disconnect();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [event]);

  return <div ref={ref} aria-hidden="true" className="h-px w-full" />;
}
