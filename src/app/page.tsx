import Link from "next/link";
import { siteConfig } from "@/config/site";
import { CATEGORIES } from "@/config/taxonomy";
import { getLatestArticles } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";

export default function HomePage() {
  const latest = getLatestArticles(6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <section className="rounded-xl bg-brand-800 px-5 py-8 text-white sm:px-10 sm:py-10">
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{siteConfig.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-100 sm:text-base">
          {siteConfig.description}
        </p>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">新着記事</h2>
          <Link href="/news" className="-my-2 py-2 text-sm text-brand-600 hover:underline dark:text-brand-100">
            新着・締切情報一覧 →
          </Link>
        </div>
        {latest.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <ArticleCard key={a.href} article={a} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">記事は現在準備中です。</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">目的から探す</h2>
        {/* モバイルは名前だけの2列タイルで一覧性を優先し、説明文は sm 以上で表示 */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.code}
              href={`/subsidy/${c.code}`}
              className="flex min-h-14 items-center rounded-lg border border-gray-200 px-3 py-3 transition-shadow hover:shadow-md sm:block sm:p-4 dark:border-gray-800"
            >
              <p className="text-sm font-bold text-gray-900 sm:text-base dark:text-gray-100">{c.labelJa}</p>
              <p className="mt-1 hidden text-xs leading-relaxed text-gray-600 sm:line-clamp-3 dark:text-gray-400">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">地域から探す</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          お住まいの都道府県を選ぶと、その地域で使える補助金をまとめて確認できます。
        </p>
        <Link
          href="/area"
          className="mt-4 block rounded-md bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:inline-block sm:py-2"
        >
          地域から探す →
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">本サイトの編集方針</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
            <p className="font-bold text-brand-800 dark:text-brand-100">一次情報主義</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              国・都道府県・市区町村の公式発表を原文で確認し、全記事に出典を明記します。
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
            <p className="font-bold text-brand-800 dark:text-brand-100">募集状況の明示</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              「募集中」「締切」「通年」を明確に区別し、記事上部に表示します。
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
            <p className="font-bold text-brand-800 dark:text-brand-100">訂正の公開</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              誤りは記事を修正のうえ、更新履歴に訂正内容を残します。
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm">
          <Link href="/about" className="text-brand-600 hover:underline dark:text-brand-100">
            運営者情報・編集方針の詳細 →
          </Link>
        </p>
      </section>
    </div>
  );
}
