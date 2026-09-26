import { getArticlesBySection, getUpcomingDeadlineArticles } from "@/lib/content";
import { getAllRankingArticles } from "@/lib/ranking";
import {
  buildRegionIndex,
  getCategoryIndex,
  getRecentlyUpdatedArticles,
  getSiteStats,
  groupDeadlines,
} from "@/lib/home";
import { Masthead } from "@/components/home/Masthead";
import { RegionIndex } from "@/components/home/RegionIndex";
import { DeadlineList } from "@/components/home/DeadlineList";
import { UpdatesList, buildUpdateItems } from "@/components/home/UpdatesList";
import { CategoryToc } from "@/components/home/CategoryToc";
import { CompareList } from "@/components/home/CompareList";
import { Colophon } from "@/components/home/Colophon";

const DEADLINE_WINDOW_DAYS = 90;
const DEADLINE_ROWS = { perDate: 4, total: 10 };
const ROWS = 8;
const COMPARE_ROWS = 6;

/**
 * ホーム = くらしの便利帳の目次・索引ページ（2026-09-26 再構成）。
 * 最初の行動は「地域を選ぶ」。その下に締切・速報、目的別目次、比較・特集、奥付の順。
 * デスクトップは本文列（締切・速報）と補助列（目次・奥付）の2列、比較・特集は全幅3列。
 */
export default function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  const stats = getSiteStats();
  const regionBlocks = buildRegionIndex();
  const deadlines = groupDeadlines(getUpcomingDeadlineArticles(DEADLINE_WINDOW_DAYS), DEADLINE_ROWS);
  const updates = buildUpdateItems(getArticlesBySection("news"), getRecentlyUpdatedArticles(ROWS), ROWS);
  const categories = getCategoryIndex();
  const toLinks = (list: { href: string; frontmatter: { title: string } }[]) =>
    list.slice(0, COMPARE_ROWS).map((a) => ({ href: a.href, title: a.frontmatter.title }));
  const compareGroups = [
    { label: "自治体比較", href: "/compare", items: toLinks(getArticlesBySection("compare")) },
    { label: "特集ランキング", href: "/tokushu", items: toLinks(getArticlesBySection("tokushu")) },
    { label: "TOP5", href: "/ranking", items: toLinks(getAllRankingArticles()) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Masthead stats={stats} />
      <RegionIndex blocks={regionBlocks} />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-x-12">
        <div>
          <DeadlineList groups={deadlines} today={today} />
          <UpdatesList items={updates} />
        </div>
        <aside className="lg:mt-10">
          <CategoryToc categories={categories} />
          <Colophon updatedAt={stats.updatedAt} />
        </aside>
      </div>
      <CompareList groups={compareGroups} />
    </div>
  );
}
