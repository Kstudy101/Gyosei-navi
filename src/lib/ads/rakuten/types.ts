/** キャッシュ済み楽天商品の正規化データ（表示に必要な最小フィールドのみ） */
export interface RakutenProduct {
  itemCode: string;
  name: string;
  price: number;
  imageUrl: string | null;
  shopName: string;
  /** Rakuten Web Service API が返す affiliateUrl をそのまま使う（自前組み立て禁止） */
  affiliateUrl: string;
}
