import type { Metadata } from "next";
import Link from "next/link";
import { getArticlesBySection } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

/**
 * 補助金締切カレンダー。募集中（subsidy.status: open）かつ締切（periodEnd）が
 * 未来の記事を月別にまとめる。毎デプロイ（記事発行時）で再生成される。
 */
export const metadata: Metadata = {
  title: "補助金締切カレンダー",
  description:
    "全国の補助金・助成金の申請締切を月別にまとめたカレンダー。締切が近い制度から順に、金額・対象地域を一覧で確認できます。",
};

const MONTHS_AHEAD = 6;

export default function CalendarPage() {
  const today = new Date().toISOString().slice(0, 10);
  const open = getArticlesBySection("subsidy")
    .filter((a) => {
      const s = a.frontmatter.subsidy;
      return s?.status === "open" && s.periodEnd !== undefined && s.periodEnd >= today;
    })
    .sort((a, b) => a.frontmatter.subsidy!.periodEnd!.localeCompare(b.frontmatter.subsidy!.periodEnd!));

  // "YYYY-MM" → 記事リスト（直近 MONTHS_AHEAD ヶ月 + それ以降）
  const byMonth = new Map<string, typeof open>();
  for (const a of open) {
    const month = a.frontmatter.subsidy!.periodEnd!.slice(0, 7);
    const list = byMonth.get(month) ?? [];
    list.push(a);
    byMonth.set(month, list);
  }
  const months = [...byMonth.keys()].sort();
  const near = months.slice(0, MONTHS_AHEAD);
  const later = months.slice(MONTHS_AHEAD).flatMap((m) => byMonth.get(m)!);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "締切カレンダー", href: "/calendar" },
        ]}
      />
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">補助金締切カレンダー</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        募集中の制度を申請締切の月別にまとめています。通年・随時受付の制度は各
        <Link href="/subsidy" className="text-brand-600 hover:underline dark:text-brand-100">
          カテゴリページ
        </Link>
        をご覧ください。
      </p>

      {near.length === 0 && (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">現在、締切が確定している募集中の制度はありません。</p>
      )}

      {near.map((month) => {
        const [y, m] = month.split("-");
        return (
          <section key={month} className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {y}年{Number(m)}月締切
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                {byMonth.get(month)!.length}件
              </span>
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {byMonth.get(month)!.map((a) => (
                <ArticleCard key={a.href} article={a} />
              ))}
            </div>
          </section>
        );
      })}

      {later.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            それ以降の締切
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">{later.length}件</span>
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {later.map((a) => (
              <ArticleCard key={a.href} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
