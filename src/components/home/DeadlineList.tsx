import { daysUntil, formatMonthDay, shortRegionLabel, type DeadlineGroup } from "@/lib/home";
import { DatedRow, SectionHeading } from "./primitives";

const SOON_DAYS = 14;

/**
 * 締切が近い制度。便利帳のカレンダーのように日付は日付ごとに一度だけ置き、14日以内の日付は朱にする。
 * 同じ日に締切が集中したときは日付ごとの上限までを載せ、残りは「ほかN件」で締切カレンダーへ送る。
 */
export function DeadlineList({ groups, today }: { groups: DeadlineGroup[]; today: string }) {
  return (
    <section aria-labelledby="home-deadline" className="mt-10">
      <SectionHeading id="home-deadline" title="締切が近い制度" more={{ href: "/calendar", label: "締切カレンダーへ" }} />
      {groups.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          現在、締切が3か月以内に確定している募集中の制度はありません。
        </p>
      ) : (
        <ol className="mt-1">
          {groups.map((g) => {
            const soon = daysUntil(g.date, today) <= SOON_DAYS;
            return g.articles.map((a, i) => (
              <DatedRow
                key={a.href}
                href={a.href}
                date={
                  i === 0 ? (
                    <>
                      {formatMonthDay(g.date)}
                      <span className="text-xs font-normal">まで</span>
                    </>
                  ) : (
                    <span className="sr-only">同日</span>
                  )
                }
                dateClass={soon ? "text-shu-600 dark:text-shu-300" : ""}
                label={shortRegionLabel(a.frontmatter.subsidy!.regionLabel)}
                title={a.frontmatter.title}
              >
                {i === g.articles.length - 1 && g.more > 0 && (
                  <span className="col-start-2 text-xs text-gray-600 sm:col-start-3 dark:text-gray-400">
                    同日締切がほか{g.more}件
                  </span>
                )}
              </DatedRow>
            ));
          })}
        </ol>
      )}
    </section>
  );
}
