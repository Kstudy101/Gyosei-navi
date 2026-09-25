/**
 * ValueCommerce 広告主 × published 記事のマッチ状況を出力する。
 * 使い方: npm run ads:vc:report [-- --advertiser <id>]
 */
import { getAllArticles } from "@/lib/content";
import { advertisers } from "@/lib/ads/valuecommerce/advertisers";
import { matchAdvertisers } from "@/lib/ads/valuecommerce/match";

const idx = process.argv.indexOf("--advertiser");
const only = idx >= 0 ? process.argv[idx + 1] : undefined;

const published = getAllArticles().filter((a) => a.frontmatter.status === "published");
const hits = new Map<string, string[]>(advertisers.map((a) => [a.id, []]));

for (const a of published) {
  const fm = a.frontmatter;
  const matched = matchAdvertisers({
    title: fm.title,
    description: fm.description,
    tags: fm.tags,
    targetKeywords: fm.targetKeywords,
    category: fm.category,
    body: a.body,
  });
  for (const m of matched) hits.get(m.id)?.push(`${a.section}/${fm.slug}`);
}

console.log(`published 記事: ${published.length}件`);
for (const adv of advertisers) {
  if (only && adv.id !== only) continue;
  const list = hits.get(adv.id) ?? [];
  console.log(`\n[${adv.id}] ${adv.name} — ${list.length}件`);
  for (const s of list.slice(0, 20)) console.log(`  - ${s}`);
  if (list.length > 20) console.log(`  ... 他 ${list.length - 20}件`);
}
