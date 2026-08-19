"use client";

import type { DeadlineNotice } from "@/config/deadlines";
import type { DeadlineState } from "@/lib/deadline";
import { useDeadlineState } from "@/components/deadline/useDeadlineState";

const TONES: Record<DeadlineState["urgency"], string> = {
  normal: "border-brand-600 bg-brand-50",
  soon: "border-amber-500 bg-amber-50",
  urgent: "border-red-500 bg-red-50",
  closed: "border-gray-300 bg-gray-50",
};

const ACCENTS: Record<DeadlineState["urgency"], string> = {
  normal: "text-brand-800",
  soon: "text-amber-800",
  urgent: "text-red-700",
  closed: "text-gray-600",
};

/**
 * 記事本文に置く締切カウントダウン。
 * 締切を過ぎると「受付終了」表示へ自動で切り替わる（放置しても誤情報にならない）。
 */
export function DeadlineCountdown({
  deadline,
  initial,
}: {
  deadline: DeadlineNotice;
  initial: DeadlineState;
}) {
  const state = useDeadlineState(deadline, initial);
  const closed = state.phase === "closed";

  return (
    <aside
      role="note"
      className={`not-prose my-6 rounded-lg border-2 p-5 ${TONES[state.urgency]}`}
    >
      <p className={`text-xs font-bold ${ACCENTS[state.urgency]}`}>
        {closed ? "受付終了" : deadline.eyebrow}
      </p>

      {closed ? (
        <>
          <p className="mt-2 text-lg font-bold leading-snug text-gray-900">
            {deadline.closedTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            {deadline.closedLead}
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {state.phase === "today" ? (
              <span className={`text-3xl font-bold ${ACCENTS[state.urgency]}`}>
                本日締切
              </span>
            ) : (
              <span className={`text-3xl font-bold ${ACCENTS[state.urgency]}`}>
                あと{state.daysLeft}日
              </span>
            )}
            <time dateTime={deadline.dueDate} className="text-base font-bold text-gray-900">
              {deadline.dueLabel}
            </time>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{deadline.lead}</p>
          <p className="mt-1 text-xs text-gray-500">{deadline.closesLabel}</p>
        </>
      )}

      <p className="mt-4 text-sm">
        <a
          href={deadline.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-600 hover:underline"
        >
          {deadline.officialLabel} →
        </a>
      </p>
    </aside>
  );
}
