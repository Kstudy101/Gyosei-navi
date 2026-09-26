import Link from "next/link";
import type { CategoryIndexEntry } from "@/lib/home";
import { Leader, SectionHeading } from "./primitives";

/** 目的別の目次。便利帳の章立てのように、見出し・説明・件数を一行ずつ */
export function CategoryToc({ categories }: { categories: CategoryIndexEntry[] }) {
  return (
    <section aria-labelledby="home-category" className="mt-10 lg:mt-0">
      <SectionHeading id="home-category" title="目的から探す" more={{ href: "/subsidy", label: "すべての記事" }} />
      <ol className="mt-1">
        {categories.map((c) => (
          <li key={c.code} className="border-b border-gray-200 dark:border-gray-800">
            <Link href={`/subsidy/${c.code}`} className="group block py-2">
              <span className="flex items-baseline gap-2 text-sm">
                <span className="font-bold text-gray-900 group-hover:text-brand-600 group-focus-visible:text-brand-600 dark:text-gray-100 dark:group-hover:text-brand-100 dark:group-focus-visible:text-brand-100">
                  {c.labelJa}
                </span>
                <Leader />
                <span className="shrink-0 text-xs text-gray-600 tabular-nums dark:text-gray-400">{c.articleCount}件</span>
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-gray-600 dark:text-gray-400">{c.description}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
