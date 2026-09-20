import Link from "next/link";
import { siteConfig } from "@/config/site";
import { CATEGORIES } from "@/config/taxonomy";
import { getLatestArticles } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";

export default function HomePage() {
  const latest = getLatestArticles(6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-xl bg-brand-800 px-6 py-10 text-white sm:px-10">
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{siteConfig.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-100 sm:text-base">
          {siteConfig.description}
        </p>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-gray-900">新着記事</h2>
          <Link href="/news" className="text-sm text-brand-600 hover:underline">
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
          <p className="mt-4 text-sm text-gray-500">記事は現在準備中です。</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">目的から探す</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.code}
              href={`/subsidy/${c.code}`}
              className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-gray-900">{c.labelJa}</p>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray-600">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">地域から探す</h2>
        <p className="mt-2 text-sm text-gray-600">
          お住まいの都道府県を選ぶと、その地域で使える補助金をまとめて確認できます。
        </p>
        <Link
          href="/area"
          className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          地域から探す →
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">本サイトの編集方針</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="font-bold text-brand-800">一次情報主義</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              国・都道府県・市区町村の公式発表を原文で確認し、全記事に出典を明記します。
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="font-bold text-brand-800">募集状況の明示</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              「募集中」「締切」「通年」を明確に区別し、記事上部に表示します。
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="font-bold text-brand-800">訂正の公開</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              誤りは記事を修正のうえ、更新履歴に訂正内容を残します。
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm">
          <Link href="/about" className="text-brand-600 hover:underline">
            運営者情報・編集方針の詳細 →
          </Link>
        </p>
      </section>
    </div>
  );
}
