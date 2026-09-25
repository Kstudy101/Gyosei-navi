/**
 * ValueCommerce 広告主の一覧と、published 記事への配分（ランダム選定）を出力する。
 * 使い方: npm run ads:vc:report
 */
import { getAllArticles } from "@/lib/content";
import { advertisers } from "@/lib/ads/valuecommerce/advertisers";
import { pickAdvertisers } from "@/lib/ads/valuecommerce/pick";

const published = getAllArticles().filter((a) => a.frontmatter.status === "published");
const counts = new Map<string, number>(advertisers.map((a) => [a.id, 0]));
const date = new Date().toISOString().slice(0, 10);

for (const a of published) {
  for (const adv of pickAdvertisers(`${a.frontmatter.slug}:${date}`)) {
    counts.set(adv.id, (counts.get(adv.id) ?? 0) + 1);
  }
}

console.log(`広告主: ${advertisers.length}件 / published 記事: ${published.length}件`);
for (const adv of advertisers) {
  const image = adv.image ? "画像あり" : "画像なし";
  console.log(`[${adv.id}] ${adv.name} — ${counts.get(adv.id)}記事 (${image}) ${adv.url}`);
}
