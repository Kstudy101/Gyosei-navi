import type { RakutenProduct } from "@/lib/ads/rakuten/types";
import type { AffiliateEventPayload } from "@/lib/ads/analytics";
import { AffiliateLink } from "@/components/ads/AffiliateLink";

/** 楽天商品1件のカード。画像は正方形コンテナに固定してレイアウトシフトを防ぐ。 */
export function ProductCard({ product, event }: { product: RakutenProduct; event: AffiliateEventPayload }) {
  return (
    <div className="flex w-40 shrink-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white sm:w-auto">
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          // 静的 export + unoptimized 前提のサイトのため next/image は使わず素の img で統一
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            width={300}
            height={300}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-xs text-gray-400">画像なし</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2">
        <p className="line-clamp-2 text-xs leading-snug text-gray-800">{product.name}</p>
        <p className="text-sm font-bold text-gray-900">¥{product.price.toLocaleString("ja-JP")}</p>
        <p className="truncate text-[10px] text-gray-400">{product.shopName}</p>
        <AffiliateLink
          href={product.affiliateUrl}
          event={event}
          className="mt-auto rounded bg-brand-600 px-2 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-700"
        >
          楽天市場で見る
        </AffiliateLink>
      </div>
    </div>
  );
}
