import type { VcAdvertiser } from "@/lib/ads/valuecommerce/advertisers";
import { advertisers } from "@/lib/ads/valuecommerce/advertisers";

export const SLOT_COUNT = 2; // 記事の左右サイド

/** 文字列 → 32bit ハッシュ（xmur3 系の簡易版） */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: シードから決定的な 0〜1 の乱数列を作る */
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 広告主を記事と無関係にランダムで SLOT_COUNT 件選ぶ（Fisher-Yates）。
 * 静的書き出しでも記事ごとに違う広告が出るよう、seed（記事slug + 日付）から決定的に選ぶ。
 * 同じ seed なら同じ結果になるので、SSR/ハイドレーションのズレも起きない。
 * vcdal.js はページ読み込み時にHTML内の広告主リンクを変換するため、クライアント側で
 * 後から差し替える方式は使わない。
 */
export function pickAdvertisers(seed: string, list: VcAdvertiser[] = advertisers): VcAdvertiser[] {
  const random = rng(hashSeed(seed));
  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, SLOT_COUNT);
}
