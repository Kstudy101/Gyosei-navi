"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SECTIONS, TOKUSHU_CATEGORIES } from "@/config/taxonomy";

/**
 * ヘッダーの「特集」メニュー — クリックでカテゴリ別ドロップダウンを開く。
 * 特集カテゴリは今後継続的に追加していく前提（docs/01_IA_TAXONOMY.md v2 §7.2）のため、
 * TOKUSHU_CATEGORIES を自動列挙するだけで新規カテゴリがそのままメニューに反映される。
 */
export function TokushuNavDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

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

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-100"
      >
        {SECTIONS.tokushu.label}
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
        <div className="absolute left-0 top-full z-10 mt-2 w-56 rounded-md border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <Link
            href={SECTIONS.tokushu.path}
            onClick={() => setOpen(false)}
            className="block px-4 py-1.5 text-sm font-semibold text-gray-900 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-brand-100"
          >
            特集一覧
          </Link>
          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
          {TOKUSHU_CATEGORIES.map((c) => (
            <Link
              key={c.code}
              href={`/tokushu/${c.code}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-100"
            >
              {c.labelJa}
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}
