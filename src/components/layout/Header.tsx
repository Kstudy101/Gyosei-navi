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
            <li>
              <Link
                href="/search"
                className="inline-flex items-center gap-1 font-semibold text-brand-600 transition-colors hover:text-brand-800"
                aria-label="記事検索"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5"
                >
                  <circle cx="8.5" cy="8.5" r="5.5" />
                  <path d="m17 17-4.2-4.2" strokeLinecap="round" />
                </svg>
                検索
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
