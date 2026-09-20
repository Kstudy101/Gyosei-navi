import { PROVIDER_LEVELS, SUBSIDY_STATUSES } from "@/config/taxonomy";
import type { ArticleFrontmatter } from "@/lib/content-schema";

const BADGE_TONE = {
  positive: "bg-emerald-100 text-emerald-800",
  neutral: "bg-gray-100 text-gray-700",
  info: "bg-blue-100 text-blue-800",
  warning: "bg-amber-100 text-amber-800",
} as const;

/**
 * 補助金レコード（subsidy フィールド）をカードで要約表示する（docs/03 §4 新設）。
 * 記事本文の冒頭に置き、金額・締切・申請先を一目で分かるようにする。
 */
export function SubsidyInfoCard({ subsidy }: { subsidy: NonNullable<ArticleFrontmatter["subsidy"]> }) {
  const status = SUBSIDY_STATUSES[subsidy.status];
  return (
    <aside className="not-prose my-6 rounded-lg border border-brand-100 bg-brand-50 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE_TONE[status.tone]}`}>
          {status.label}
        </span>
        <span className="text-xs text-gray-600">{PROVIDER_LEVELS[subsidy.provider]}制度</span>
        <span className="text-xs text-gray-600">{subsidy.regionLabel}</span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {subsidy.amount && (
          <div>
            <dt className="text-xs font-semibold text-gray-500">支給額</dt>
            <dd className="mt-1 text-lg font-bold text-gray-900">{subsidy.amount}</dd>
          </div>
        )}
        {(subsidy.periodStart || subsidy.periodEnd) && (
          <div>
            <dt className="text-xs font-semibold text-gray-500">募集期間</dt>
            <dd className="mt-1 text-sm text-gray-800">
              {subsidy.periodStart ?? "—"} 〜 {subsidy.periodEnd ?? "未定"}
            </dd>
          </div>
        )}
        {subsidy.eligibility && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold text-gray-500">対象</dt>
            <dd className="mt-1 text-sm text-gray-800">{subsidy.eligibility}</dd>
          </div>
        )}
      </dl>

      <a
        href={subsidy.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        公式ページで申請条件を確認する →
      </a>
      <p className="mt-2 text-xs text-gray-500">最終確認日: {subsidy.verifiedAt}</p>
    </aside>
  );
}
