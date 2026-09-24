"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS, TOKUSHU_CATEGORIES } from "@/config/taxonomy";
import { LOCALES, LOCALE_LABELS, JA_LABEL } from "@/i18n/locales";
import type { TranslationIndex } from "@/i18n/translation-index";
import { parsePathname, resolveAvailableLocales } from "@/components/layout/LocaleSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export interface NavItem {
  label: string;
  href: string;
}

interface Props {
  /** 「特集」より前に並ぶ項目 */
  before: readonly NavItem[];
  /** 「特集」より後に並ぶ項目 */
  after: readonly NavItem[];
  translationIndex: TranslationIndex;
}

const ROW = "flex min-h-12 items-center justify-between text-base text-gray-800 dark:text-gray-200";

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 text-gray-400 ${className}`}>
      <path d="m7.5 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * lg 未満のヘッダー右側 — 検索ボタンとハンバーガーメニュー。
 * メニューはヘッダー直下の全画面パネルで、項目の並びはデスクトップのナビと同じ（Header.tsx で共有）。
 */
export function MobileNav({ before, after, translationIndex }: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // ブラウザの戻る・進むでページが変わった場合も閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    // 端末の回転などで lg 以上になったら、見えないメニューとスクロールロックを解除する
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onChange);
    return () => {
      root.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onChange);
    };
  }, [open]);

  // デスクトップのドロップダウンと違い、未翻訳の言語は並べない（ほとんどのページで全言語が非活性になり場所を取るため）。
  // 切り替え先が1つも無ければ言語欄ごと出さない。
  const { locale: currentLocale, restPath } = parsePathname(pathname ?? "/");
  const available = resolveAvailableLocales(restPath, translationIndex);
  const languages = [
    { code: "ja", label: JA_LABEL, href: `/${restPath}` },
    ...LOCALES.filter((l) => l === currentLocale || available.includes(l)).map((l) => ({
      code: l,
      label: LOCALE_LABELS[l],
      href: `/${l}/${restPath}`,
    })),
  ];

  const renderItem = (item: NavItem) => (
    <li key={item.href} className="border-b border-gray-100 dark:border-gray-800">
      <Link href={item.href} className={ROW}>
        {item.label}
        <Chevron />
      </Link>
    </li>
  );

  return (
    <>
      <Link
        href="/search"
        aria-label="検索"
        className="flex h-11 w-11 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <circle cx="9" cy="9" r="5.5" />
          <path d="m13 13 4 4" strokeLinecap="round" />
        </svg>
      </Link>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
          {open ? (
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          ) : (
            <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {/* ヘッダーバーは h-14 固定なので、パネルは top-14 から画面下端まで */}
      <div
        id="mobile-menu"
        hidden={!open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className="fixed inset-x-0 bottom-0 top-14 overflow-y-auto overscroll-contain border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
      >
        <nav aria-label="メインナビゲーション" className="px-4">
          <ul>
            {before.map(renderItem)}
            <li className="border-b border-gray-100 dark:border-gray-800">
              <details className="group">
                <summary className={`${ROW} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                  {SECTIONS.tokushu.label}
                  <Chevron className="rotate-90 transition-transform group-open:-rotate-90" />
                </summary>
                <ul className="pb-2 pl-3">
                  <li>
                    <Link href={SECTIONS.tokushu.path} className="flex min-h-11 items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                      特集一覧
                    </Link>
                  </li>
                  {TOKUSHU_CATEGORIES.map((c) => (
                    <li key={c.code}>
                      <Link href={`/tokushu/${c.code}`} className="flex min-h-11 items-center text-sm text-gray-700 dark:text-gray-300">
                        {c.labelJa}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
            {after.map(renderItem)}
          </ul>
        </nav>

        <div className="px-4 pb-10 pt-6">
          {languages.length > 1 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">言語 / Language</p>
              <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {languages.map((l) => {
                  const isCurrent = currentLocale === l.code;
                  return (
                    <li key={l.code}>
                      <Link
                        href={l.href}
                        aria-current={isCurrent ? "true" : undefined}
                        className={`flex min-h-11 items-center rounded-md border px-3 ${
                          isCurrent
                            ? "border-brand-600 font-semibold text-brand-700 dark:border-brand-100 dark:text-brand-100"
                            : "border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">表示モード</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
