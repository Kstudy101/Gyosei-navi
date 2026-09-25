import type { VcAdvertiser } from "@/lib/ads/valuecommerce/advertisers";
import type { AffiliateEventPayload } from "@/lib/ads/analytics";
import { isValueCommerceEnabled } from "@/lib/ads/flags";
import { pickAdvertisers } from "@/lib/ads/valuecommerce/pick";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdImpressionTracker } from "@/components/ads/AdImpressionTracker";
import { AffiliateLink } from "@/components/ads/AffiliateLink";

function AdvertiserImage({ adv }: { adv: VcAdvertiser }) {
  if (!adv.image) return null;
  return (
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
  );
}

function AdvertiserCard({ adv, event }: { adv: VcAdvertiser; event: AffiliateEventPayload }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <AdvertiserImage adv={adv} />
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{adv.headline}</p>
      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{adv.description}</p>
      <AffiliateLink
        href={adv.url}
        event={{ ...event, advertiser_id: adv.id }}
        className="mt-auto inline-block rounded bg-brand-600 px-3 py-1.5 text-center text-xs font-bold text-white hover:bg-brand-700"
      >
        {adv.cta}
      </AffiliateLink>
    </div>
  );
}

/**
 * ValueCommerce 提携広告主の広告（記事の左右サイドバナー）。
 * 記事内容とは無関係に、登録済み広告主からランダムで選ぶ（pick.ts）。
 * リンクは素の広告主URLで、vcdal.js が変換する。
 *
 * 親（ArticleView / RankingView / TranslatedArticleView のルート）が `relative` であること。xl 以上では記事カラムの左右の余白に
 * スクロール追従（sticky）で表示し、左が1件目・右が2件目（1件のみなら右）。
 * サイドの余白がない xl 未満だけ、記事末尾にカード表示へフォールバックする。
 */
export function ValueCommerceAdvertisers({ slug, category }: { slug: string; category?: string }) {
  if (!isValueCommerceEnabled()) return null;
  // 記事と無関係にランダム。slug + 日付をシードにするので、ビルドごと（日ごと）に入れ替わる
  const matched = pickAdvertisers(`${slug}:${new Date().toISOString().slice(0, 10)}`);
  if (matched.length === 0) return null;

  const event: AffiliateEventPayload = {
    provider: "valuecommerce",
    ad_type: "contextual",
    placement: "sidebar",
    article_id: slug,
    article_category: category,
  };
  const [first, second] = matched;
  const left = second ? first : undefined;
  const right = second ?? first;

  const side = (adv: VcAdvertiser, pos: "left" | "right") => (
    <aside
      className={`absolute inset-y-0 hidden w-40 xl:block ${pos === "left" ? "right-full mr-6" : "left-full ml-6"}`}
      data-pagefind-ignore
      data-ad-provider="valuecommerce"
      data-ad-type="contextual"
      data-ad-placement="sidebar"
    >
      <div className="sticky top-24">
        <span className="mb-1 inline-block rounded border border-gray-400 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gray-600 dark:border-gray-600 dark:text-gray-400">
          PR
        </span>
        <AdImpressionTracker event={event} />
        <AdvertiserCard adv={adv} event={event} />
      </div>
    </aside>
  );

  return (
    <>
      {left && side(left, "left")}
      {side(right, "right")}
      <div className="xl:hidden">
        <AdSlot provider="valuecommerce" type="contextual" placement="article-bottom" heading="おすすめサービス">
          <AdImpressionTracker event={{ ...event, placement: "article_bottom" }} />
          <div className="grid gap-3 sm:grid-cols-2">
            {matched.map((adv) => (
              <AdvertiserCard key={adv.id} adv={adv} event={{ ...event, placement: "article_bottom" }} />
            ))}
          </div>
        </AdSlot>
      </div>
    </>
  );
}
