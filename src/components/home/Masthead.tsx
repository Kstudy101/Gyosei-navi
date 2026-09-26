import { siteConfig } from "@/config/site";
import { formatJaDate, type SiteStats } from "@/lib/home";

/**
 * 題字と発行情報の一行。便利帳の表紙にあたる。数値はすべてビルド時に記事データから算出。
 * サイト説明文はフッターが持つので、ここでは繰り返さず索引を直下に置く。
 */
export function Masthead({ stats }: { stats: SiteStats }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b-2 border-brand-800 pb-3 dark:border-brand-100">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
        {siteConfig.name}
      </h1>
      <p className="text-xs text-gray-600 tabular-nums sm:text-sm dark:text-gray-400">
        {formatJaDate(stats.updatedAt)}更新｜掲載 {stats.subsidyCount}制度・{stats.prefectureCount}都道府県・
        {stats.municipalityCount}市区町村
      </p>
    </header>
  );
}
