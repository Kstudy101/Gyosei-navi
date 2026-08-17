import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SECTIONS } from "@/config/taxonomy";

const NAV_ORDER = ["news", "guide", "practice", "exam", "tools", "data"] as const;

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-brand-800">
            {siteConfig.name}
          </span>
          <span className="hidden text-xs text-gray-500 sm:inline">
            行政書士業務の総合情報メディア
          </span>
        </Link>
        <nav aria-label="メインナビゲーション">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {NAV_ORDER.map((key) => (
              <li key={key}>
                <Link
                  href={SECTIONS[key].path}
                  className="text-gray-700 transition-colors hover:text-brand-600"
                >
                  {SECTIONS[key].label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/about" className="text-gray-700 transition-colors hover:text-brand-600">
                運営者情報
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
