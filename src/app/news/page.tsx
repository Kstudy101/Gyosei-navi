import type { Metadata } from "next";
import Link from "next/link";
import { getNewestSubsidyArticles, getUpcomingDeadlineArticles } from "@/lib/content";
import { NewsTabs } from "@/components/article/NewsTabs";

const DEADLINE_WINDOW_DAYS = 30;

export const metadata: Metadata = {
  title: "新着・締切情報",
  description: "補助金・助成金の新着公募、募集締切間近の制度を一次情報に基づいて解説します。",
};

export default function NewsIndexPage() {
  const newest = getNewestSubsidyArticles(30);
  const deadline = getUpcomingDeadlineArticles(DEADLINE_WINDOW_DAYS);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">新着・締切情報</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        新着の補助金情報と、募集締切が{DEADLINE_WINDOW_DAYS}日以内に迫っている制度をお届けします。
        月別の締切一覧は
        <Link href="/calendar" className="text-brand-600 hover:underline dark:text-brand-100">
          締切カレンダー
        </Link>
        へ。
      </p>
      <div className="mt-6">
        <NewsTabs newest={newest} deadline={deadline} />
      </div>
    </div>
  );
}
