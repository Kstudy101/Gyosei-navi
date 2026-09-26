import Link from "next/link";
import type { RegionIndexBlock } from "@/lib/home";
import { Leader, SectionHeading } from "./primitives";

/**
 * 地域索引。8地方 × 47都道府県を便利帳の索引のように並べ、各県に掲載件数をリーダー罫で付ける。
 * hover / フォーカスで罫が紺の実線になり、件数が「制度・市区町村」の内訳に開く（CSSのみ）。
 * 記事0件の県はリンクせず「準備中」。
 *
 * lg 以上は4段を手で組む（北海道・東北 / 関東・中部 / 近畿・中国 / 四国・九州沖縄 = 7/16/12/12行）。
 * それ未満は段組みで自動的に流す（ペアの枠は display: contents で消える）。
 */
const COLUMN_PAIRS: readonly (readonly string[])[] = [
  ["北海道", "東北"],
  ["関東", "中部"],
  ["近畿", "中国"],
  ["四国", "九州・沖縄"],
];

function PrefectureList({ block }: { block: RegionIndexBlock }) {
  return (
    <div className="mb-6 break-inside-avoid">
      <h3 className="border-b border-gray-300 pb-1 text-sm font-bold text-gray-900 dark:border-gray-700 dark:text-gray-100">
        {block.label}
      </h3>
      <ul className="mt-1">
        {block.prefectures.map((p) =>
          p.articleCount > 0 ? (
            <li key={p.slug}>
              <Link
                href={`/area/${p.slug}`}
                className="group flex items-baseline gap-2 py-1 text-sm text-gray-900 hover:text-brand-600 focus-visible:text-brand-600 dark:text-gray-100 dark:hover:text-brand-100 dark:focus-visible:text-brand-100"
              >
                <span>{p.labelJa}</span>
                <Leader />
                <span className="shrink-0 text-xs text-gray-600 tabular-nums group-hover:text-brand-600 group-focus-visible:text-brand-600 dark:text-gray-400 dark:group-hover:text-brand-100 dark:group-focus-visible:text-brand-100">
                  <span className="group-hover:hidden group-focus-visible:hidden">{p.articleCount}</span>
                  <span className="hidden group-hover:inline group-focus-visible:inline">
                    {p.articleCount}制度・{p.municipalityCount}市区町村
                  </span>
                </span>
              </Link>
            </li>
          ) : (
            <li key={p.slug} className="flex items-baseline gap-2 py-1 text-sm text-gray-400 dark:text-gray-600">
              <span>{p.labelJa}</span>
              <Leader muted />
              <span className="shrink-0 text-xs">準備中</span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export function RegionIndex({ blocks }: { blocks: RegionIndexBlock[] }) {
  const byLabel = new Map(blocks.map((b) => [b.label, b]));
  return (
    <section aria-labelledby="home-region" className="mt-6">
      <SectionHeading id="home-region" title="お住まいの地域から探す" more={{ href: "/area", label: "地域一覧へ" }} />
      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        都道府県を選ぶと、県と市区町村の制度をまとめて確認できます。数字は掲載している制度の件数です。
      </p>
      <div className="mt-4 columns-2 gap-x-6 sm:columns-3 lg:grid lg:grid-cols-4 lg:gap-x-0 lg:[&>*+*]:border-l lg:[&>*+*]:border-gray-300 lg:[&>*+*]:pl-6 lg:[&>*]:pr-6 lg:[&>*:last-child]:pr-0 lg:dark:[&>*+*]:border-gray-700">
        {COLUMN_PAIRS.map((pair) => (
          <div key={pair.join("/")} className="contents lg:block">
            {pair.map((label) => {
              const block = byLabel.get(label);
              return block ? <PrefectureList key={label} block={block} /> : null;
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
