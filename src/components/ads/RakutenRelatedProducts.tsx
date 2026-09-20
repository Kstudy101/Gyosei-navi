import { isRakutenApiAdEnabled } from "@/lib/ads/flags";
import { getCachedProducts } from "@/lib/ads/rakuten/cache";
import { getAdKeywords } from "@/lib/ads/rakuten/mapping";
import { AdSlot } from "@/components/ads/AdSlot";
import { ProductCard } from "@/components/ads/ProductCard";
import { AdImpressionTracker } from "@/components/ads/AdImpressionTracker";

const MAX_ITEMS = 4;

/**
 * コンテンツ連動型（楽天ウェブサービスAPI）の商品推薦（作業指示書 §3, §5 RakutenRelatedProducts）。
 * Server Component — ビルド時に事前取得済みの data/ads/rakuten/{category}.json のみを読む
 * （記事表示時に外部APIを呼ばない。障害・空データは自動的に「非表示」になる）。
 */
export function RakutenRelatedProducts({ category, articleId }: { category: string; articleId: string }) {
  if (!isRakutenApiAdEnabled()) return null;
  if (getAdKeywords(category).length === 0) return null;

  const products = getCachedProducts(category).slice(0, MAX_ITEMS);
  if (products.length === 0) return null;

  return (
    <AdSlot
      provider="rakuten"
      type="contextual"
      placement="article-middle"
      heading="この補助金に関連するおすすめ商品"
    >
      <AdImpressionTracker
        event={{
          provider: "rakuten",
          ad_type: "contextual",
          placement: "article_middle",
          article_id: articleId,
          article_category: category,
        }}
      />
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.itemCode}
            product={product}
            event={{
              provider: "rakuten",
              ad_type: "contextual",
              placement: "article_middle",
              article_id: articleId,
              article_category: category,
            }}
          />
        ))}
      </div>
    </AdSlot>
  );
}
