import Link from "next/link";
import type { ReactNode } from "react";

/**
 * ホーム（くらしの便利帳型）の共通部品。
 * 区画はカードではなく罫線で分け、見出しは2pxの紺罫、目次は「リーダー罫 ……… 件数」で揃える。
 */

export function SectionHeading({
  id,
  title,
  more,
}: {
  id: string;
  title: string;
  more?: { href: string; label: string };
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b-2 border-brand-800 pb-1 dark:border-brand-100">
      <h2 id={id} className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {more && (
        <Link
          href={more.href}
          className="shrink-0 text-xs text-brand-600 hover:underline focus-visible:underline dark:text-brand-100"
        >
          {more.label}
        </Link>
      )}
    </div>
  );
}

/** 目次のリーダー罫。親が group のとき hover/focus で実線の紺に変わる */
export function Leader({ muted = false }: { muted?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mb-[0.35em] min-w-4 flex-1 self-end border-b border-dotted ${
        muted
          ? "border-gray-300 dark:border-gray-700"
          : "border-gray-400 group-hover:border-solid group-hover:border-brand-600 group-focus-visible:border-solid group-focus-visible:border-brand-600 dark:border-gray-600 dark:group-hover:border-brand-100 dark:group-focus-visible:border-brand-100"
      }`}
    />
  );
}

/** 日付 | 地域 | 見出し の一行。締切・速報・更新の各リストで共用 */
export function DatedRow({
  href,
  date,
  dateClass = "",
  label,
  title,
  children,
}: {
  href: string;
  date: ReactNode;
  dateClass?: string;
  label?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <li className="border-b border-gray-200 dark:border-gray-800">
      <Link
        href={href}
        className="group grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-3 py-2 text-sm sm:grid-cols-[6.5rem_8rem_minmax(0,1fr)]"
      >
        <span className={`tabular-nums font-bold text-gray-900 dark:text-gray-100 ${dateClass}`}>{date}</span>
        <span className="hidden truncate text-gray-600 sm:block dark:text-gray-400">{label ?? ""}</span>
        <span className="line-clamp-2 leading-snug text-gray-900 group-hover:text-brand-600 group-hover:underline group-focus-visible:underline sm:line-clamp-1 dark:text-gray-100 dark:group-hover:text-brand-100">
          {title}
        </span>
        {children}
      </Link>
    </li>
  );
}
