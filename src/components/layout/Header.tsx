import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SECTIONS } from "@/config/taxonomy";
import { TokushuNavDropdown } from "@/components/layout/TokushuNavDropdown";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { buildTranslationIndex } from "@/i18n/translation-index";

/**
 * "tokushu" はドロップダウン（TokushuNavDropdown）として別枠で描画するため除外。
 * NAV_BEFORE_TOKUSHU の直後に <TokushuNavDropdown /> を挟み、NAV_AFTER_TOKUSHU を続ける。
 */
const NAV_BEFORE_TOKUSHU = ["subsidy", "area", "compare"] as const;
const NAV_AFTER_TOKUSHU = ["news"] as const;
const RANKING_NAV = { label: "ランキング", path: "/ranking" } as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-brand-800 dark:text-brand-100">
            {siteConfig.name}
          </span>
          <span className="hidden text-xs text-gray-500 sm:inline dark:text-gray-400">
            全国の補助金・助成金を地域で比較
          </span>
        </Link>
        <nav aria-label="メインナビゲーション">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {NAV_BEFORE_TOKUSHU.map((key) => (
              <li key={key}>
                <Link
                  href={SECTIONS[key].path}
                  className="text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-100"
                >
                  {SECTIONS[key].label}
                </Link>
              </li>
            ))}
            <TokushuNavDropdown />
            {NAV_AFTER_TOKUSHU.map((key) => (
              <li key={key}>
                <Link
                  href={SECTIONS[key].path}
                  className="text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-100"
                >
                  {SECTIONS[key].label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={RANKING_NAV.path}
                className="text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-100"
              >
                {RANKING_NAV.label}
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className="text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-100"
              >
                検索
              </Link>
            </li>
            <LocaleSwitcher translationIndex={buildTranslationIndex()} />
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
