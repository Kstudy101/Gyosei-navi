import type { VcAdvertiser } from "@/lib/ads/valuecommerce/advertisers";
import { advertisers } from "@/lib/ads/valuecommerce/advertisers";

/** 記事側から見た判定材料（frontmatter + 本文） */
export interface MatchTarget {
  title: string;
  description: string;
  tags: string[];
  targetKeywords: string[];
  category?: string;
  body: string;
}

const HEAD_HIT = 2; // タイトル・説明・タグ・狙いキーワードでの一致
const BODY_HIT = 1; // 本文のみでの一致
const CATEGORY_HIT = 2;
/** 本文の単語出現だけ（各1点）では足りず、見出し級の一致かカテゴリ一致が要る */
export const MIN_SCORE = 2;
export const MAX_ADVERTISERS = 2;

export function scoreAdvertiser(adv: VcAdvertiser, t: MatchTarget): number {
  const head = [t.title, t.description, ...t.tags, ...t.targetKeywords].join("\n");
  let score = 0;
  for (const kw of adv.keywords) {
    if (head.includes(kw)) score += HEAD_HIT;
    else if (t.body.includes(kw)) score += BODY_HIT;
  }
  if (t.category && adv.categories?.includes(t.category)) score += CATEGORY_HIT;
  return score;
}

/** 関連度が閾値以上の広告主を、スコア降順で最大 MAX_ADVERTISERS 件返す */
export function matchAdvertisers(t: MatchTarget, list: VcAdvertiser[] = advertisers): VcAdvertiser[] {
  return list
    .map((adv) => ({ adv, score: scoreAdvertiser(adv, t) }))
    .filter((x) => x.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ADVERTISERS)
    .map((x) => x.adv);
}
