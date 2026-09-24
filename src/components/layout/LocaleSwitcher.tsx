"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_LABELS, JA_LABEL, isLocale, type Locale } from "@/i18n/locales";
import type { TranslationIndex } from "@/i18n/translation-index";

interface Props {
  translationIndex: TranslationIndex;
}

/**
 * 現在のURLから { locale, restPath } を逆算する。
 * 例: /en/subsidy/shussan/foo → { locale: "en", restPath: "subsidy/shussan/foo" }
 *     /subsidy/shussan/foo    → { locale: "ja", restPath: "subsidy/shussan/foo" }
 */
export function parsePathname(pathname: string): { locale: Locale | "ja"; restPath: string } {
  const segments = pathname.split("/").filter(Boolean);
  const [first, ...rest] = segments;
  if (first && isLocale(first)) {
    return { locale: first, restPath: rest.join("/") };
  }
  return { locale: "ja", restPath: segments.join("/") };
}

/** Structural pages that always have locale versions: /, /subsidy, /subsidy/{cat}, /compare */
function isStructuralLocalePage(p: string): boolean {
  if (p === "" || p === "subsidy" || p === "compare") return true;
  const parts = p.split("/").filter(Boolean);
  return parts.length === 2 && parts[0] === "subsidy";
}

/** Per-article pages: subsidy/{cat}/{slug} or compare/{slug} */
function isArticlePage(p: string): boolean {
  const parts = p.split("/").filter(Boolean);
  if (parts.length === 3 && parts[0] === "subsidy") return true;
  if (parts.length === 2 && parts[0] === "compare") return true;
  return false;
}

function resolveAvailableLocales(restPath: string, index: TranslationIndex): Locale[] {
  if (isStructuralLocalePage(restPath)) return [...LOCALES];
  if (isArticlePage(restPath)) return index[restPath] ?? [];
  return [];
}

/**
 * TokushuNavDropdown と同じクリック式ドロップダウンパターン。
 * 現在の記事（section/category/slug）が各言語に翻訳済みならリンク、
 * 未翻訳なら非活性表示にする（AGENTS.md方針: 翻訳なしの日本語フォールバックはしない）。
 */
export function LocaleSwitcher({ translationIndex }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const { locale: currentLocale, restPath } = parsePathname(pathname ?? "/");
  const available = resolveAvailableLocales(restPath, translationIndex);

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-gray-700 transition-colors hover:text-brand-600"
      >
        {currentLocale === "ja" ? JA_LABEL : LOCALE_LABELS[currentLocale]}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white py-2 shadow-lg">
          <Link
            href={`/${restPath}`}
            onClick={() => setOpen(false)}
            className={`block px-4 py-1.5 text-sm hover:bg-brand-50 hover:text-brand-600 ${
              currentLocale === "ja" ? "font-semibold text-gray-900" : "text-gray-700"
            }`}
          >
            {JA_LABEL}
          </Link>
          <div className="my-1 border-t border-gray-100" />
          {LOCALES.map((l) => {
            const isAvailable = available.includes(l);
            const isCurrent = currentLocale === l;
            if (!isAvailable) {
              return (
                <span
                  key={l}
                  className="block cursor-not-allowed px-4 py-1.5 text-sm text-gray-300"
                  aria-disabled="true"
                >
                  {LOCALE_LABELS[l]}
                </span>
              );
            }
            return (
              <Link
                key={l}
                href={`/${l}/${restPath}`}
                onClick={() => setOpen(false)}
                className={`block px-4 py-1.5 text-sm hover:bg-brand-50 hover:text-brand-600 ${
                  isCurrent ? "font-semibold text-gray-900" : "text-gray-700"
                }`}
              >
                {LOCALE_LABELS[l]}
              </Link>
            );
          })}
        </div>
      )}
    </li>
  );
}
