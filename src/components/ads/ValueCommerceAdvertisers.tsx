import type { Article } from "@/lib/content";
import { isValueCommerceEnabled } from "@/lib/ads/flags";
import { matchAdvertisers } from "@/lib/ads/valuecommerce/match";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdImpressionTracker } from "@/components/ads/AdImpressionTracker";
import { AffiliateLink } from "@/components/ads/AffiliateLink";

/**
 * ValueCommerce 提携広告主のカード（記事下）。
 * 記事の title/description/tags/本文/カテゴリから関連する広告主だけを自動選定し、
 * 該当なしなら何も出さない。リンクは素の広告主URLで、vcdal.js が変換する。
 */
export function ValueCommerceAdvertisers({ article }: { article: Article }) {
  if (!isValueCommerceEnabled()) return null;
  const fm = article.frontmatter;
  const matched = matchAdvertisers({
    title: fm.title,
    description: fm.description,
    tags: fm.tags,
    targetKeywords: fm.targetKeywords,
    category: fm.category,
    body: article.body,
  });
  if (matched.length === 0) return null;

  return (
    <AdSlot provider="valuecommerce" type="contextual" placement="article-bottom" heading="この記事に関連するサービス">
      <AdImpressionTracker
        event={{
          provider: "valuecommerce",
          ad_type: "contextual",
          placement: "article_bottom",
          article_id: fm.slug,
          article_category: fm.category,
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {matched.map((adv) => (
          <div
            key={adv.id}
            className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
          >
            {adv.image && (
              <div className="flex items-center justify-center overflow-hidden rounded bg-gray-50 dark:bg-gray-800">
                {/* 静的 export + unoptimized 前提のサイトのため next/image は使わない（ProductCard と同じ） */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={adv.image.src}
                  alt={adv.image.alt}
                  width={adv.image.width}
                  height={adv.image.height}
                  loading="lazy"
                  className="h-auto max-w-full object-contain"
                />
              </div>
            )}
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{adv.headline}</p>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{adv.description}</p>
            <AffiliateLink
              href={adv.url}
              event={{
                provider: "valuecommerce",
                ad_type: "contextual",
                placement: "article_bottom",
                article_id: fm.slug,
                article_category: fm.category,
                advertiser_id: adv.id,
              }}
              className="mt-auto inline-block rounded bg-brand-600 px-3 py-1.5 text-center text-xs font-bold text-white hover:bg-brand-700"
            >
              {adv.cta}
            </AffiliateLink>
          </div>
        ))}
      </div>
    </AdSlot>
  );
}
