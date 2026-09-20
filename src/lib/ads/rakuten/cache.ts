import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { RakutenProduct } from "@/lib/ads/rakuten/types";

/**
 * ビルド時参照用の楽天商品キャッシュ（作業指示書 §3, §10）。
 * output: "export" の静的サイトのため、記事ページ render 時に Rakuten API を叩くことはしない
 * （そもそもリクエスト時に動く Node サーバーが存在しない — docs/11_DEPLOY_XSERVER.md）。
 * 代わりに scripts/fetch-rakuten-products.ts がビルド前にこの JSON を生成・コミットし、
 * ここでは fs 同期読み込みのみ行う。ファイル欠損・壊れたJSON・スキーマ不一致は
 * 例外を投げず空配列を返す（記事は常に正常表示される）。
 */
export const RAKUTEN_CACHE_DIR = path.join(process.cwd(), "data", "ads", "rakuten");

const cachedProductSchema = z.object({
  itemCode: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  imageUrl: z.string().url().nullable(),
  shopName: z.string().min(1),
  affiliateUrl: z.string().url().min(1),
});

const cacheFileSchema = z.object({
  category: z.string(),
  fetchedAt: z.string(),
  keyword: z.string().optional(),
  items: z.array(cachedProductSchema),
});

const memo = new Map<string, RakutenProduct[]>();

export function getCachedProducts(category: string): RakutenProduct[] {
  if (memo.has(category) && process.env.NODE_ENV === "production") return memo.get(category)!;

  const file = path.join(RAKUTEN_CACHE_DIR, `${category}.json`);
  if (!fs.existsSync(file)) return [];

  try {
    const raw: unknown = JSON.parse(fs.readFileSync(file, "utf-8"));
    const parsed = cacheFileSchema.safeParse(raw);
    if (!parsed.success) return [];
    memo.set(category, parsed.data.items);
    return parsed.data.items;
  } catch {
    return [];
  }
}

/** scripts/fetch-rakuten-products.ts 専用の書き込み（ビルド実行時には呼ばない） */
export function writeCachedProducts(category: string, keyword: string, items: RakutenProduct[]): string {
  fs.mkdirSync(RAKUTEN_CACHE_DIR, { recursive: true });
  const file = path.join(RAKUTEN_CACHE_DIR, `${category}.json`);
  const payload = { category, fetchedAt: new Date().toISOString(), keyword, items };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n", "utf-8");
  return file;
}
