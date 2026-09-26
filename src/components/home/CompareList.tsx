import Link from "next/link";
import { SectionHeading } from "./primitives";

export interface TitledLink {
  href: string;
  title: string;
}

/** 横並びで比べる: 自治体比較・特集ランキング・TOP5 を全幅で3列に並べる（lg 以上）。罫で区切り、カードにしない */
export function CompareList({
  groups,
}: {
  groups: { label: string; href: string; items: TitledLink[] }[];
}) {
  return (
    <section aria-labelledby="home-compare" className="mt-10">
      <SectionHeading id="home-compare" title="横並びで比べる" />
      <div className="mt-3 grid gap-x-8 gap-y-6 sm:grid-cols-3">
        {groups.map((g) => (
          <div key={g.label}>
            <h3 className="flex items-baseline justify-between border-b border-gray-300 pb-1 text-sm font-bold text-gray-900 dark:border-gray-700 dark:text-gray-100">
              <span>{g.label}</span>
              <Link href={g.href} className="text-xs font-normal text-brand-600 hover:underline focus-visible:underline dark:text-brand-100">
                一覧へ
              </Link>
            </h3>
            <ul className="mt-1">
              {g.items.map((it) => (
                <li key={it.href} className="border-b border-dotted border-gray-300 dark:border-gray-700">
                  <Link
                    href={it.href}
                    className="line-clamp-2 py-1.5 text-sm leading-snug text-gray-900 hover:text-brand-600 hover:underline focus-visible:underline dark:text-gray-100 dark:hover:text-brand-100"
                  >
                    {it.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
