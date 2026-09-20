"use client";

import type { ReactNode } from "react";
import { trackAffiliateClick, type AffiliateEventPayload } from "@/lib/ads/analytics";

/**
 * Affiliate リンクの共通 CTA（作業指示書 §13, §18）。
 * rel="sponsored" で広告リンクであることを検索エンジンに明示し、
 * nofollow を併記して古いクローラーにも同じ意図を伝える。noopener は target="_blank" の定石。
 */
export function AffiliateLink({
  href,
  event,
  className,
  children,
}: {
  href: string;
  event: AffiliateEventPayload;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={className}
      onClick={() => trackAffiliateClick(event)}
    >
      {children}
    </a>
  );
}
