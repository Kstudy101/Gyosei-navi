import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SECTIONS } from "@/config/taxonomy";
import { TokushuNavDropdown } from "@/components/layout/TokushuNavDropdown";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MobileNav, type NavItem } from "@/components/layout/MobileNav";

/**
 * "tokushu" はドロップダウン（TokushuNavDropdown）として別枠で描画するため除外。
 * NAV_BEFORE_TOKUSHU の直後に <TokushuNavDropdown /> を挟み、NAV_AFTER_TOKUSHU を続ける。
 * モバイルメニュー（MobileNav）も同じ並びを使う。
 */
const NAV_BEFORE_TOKUSHU: NavItem[] = (["subsidy", "area", "compare"] as const).map((key) => ({
  label: SECTIONS[key].label,
  href: SECTIONS[key].path,
}));
const NAV_AFTER_TOKUSHU: NavItem[] = [
  { label: SECTIONS.news.label, href: SECTIONS.news.path },
  { label: "ランキング", href: "/ranking" },
  { label: "検索", href: "/search" },
];

function DesktopNavLink({ item }: { item: NavItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className="text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-100"
      >
        {item.label}
      </Link>
    </li>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-950">
      {/* h-14 固定: モバイルメニューのパネルがこの高さの直下（top-14）から始まる */}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-x-6 px-4">
        {/* キャッチコピーは出さない — ホームの題字・各ページの title と重複するため（2026-09-26） */}
        <Link href="/" className="text-xl font-bold tracking-tight text-brand-800 dark:text-brand-100">
          {siteConfig.name}
        </Link>
        <nav aria-label="メインナビゲーション" className="hidden lg:block">
          <ul className="flex items-center gap-x-4 text-sm">
            {NAV_BEFORE_TOKUSHU.map((item) => (
              <DesktopNavLink key={item.href} item={item} />
            ))}
            <TokushuNavDropdown />
            {NAV_AFTER_TOKUSHU.map((item) => (
              <DesktopNavLink key={item.href} item={item} />
            ))}
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
        <div className="-mr-2 flex items-center lg:hidden">
          <MobileNav before={NAV_BEFORE_TOKUSHU} after={NAV_AFTER_TOKUSHU} />
        </div>
      </div>
    </header>
  );
}
