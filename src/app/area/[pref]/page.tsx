import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PREFECTURES, MUNICIPALITIES, getPrefectureBySlug } from "@/config/regions";
import { CATEGORIES } from "@/config/taxonomy";
import { getArticlesByPrefecture, orPlaceholder, EXPORT_PLACEHOLDER } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import Link from "next/link";

export const dynamicParams = false;

export function generateStaticParams() {
  return orPlaceholder(
    PREFECTURES.map((p) => ({ pref: p.slug })),
    { pref: EXPORT_PLACEHOLDER }
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pref: string }>;
}): Promise<Metadata> {
  const { pref } = await params;
  const def = getPrefectureBySlug(pref);
  if (!def) return {};
  return {
    title: `${def.labelJa}の補助金・助成金`,
    description: `${def.labelJa}で使える国・都道府県・市区町村の補助金・助成金をまとめて確認できます。`,
  };
}

export default async function PrefecturePage({ params }: { params: Promise<{ pref: string }> }) {
  const { pref } = await params;
  const def = getPrefectureBySlug(pref);
  if (!def) notFound();

  const articles = getArticlesByPrefecture(def.code);
  const cities = MUNICIPALITIES.filter((m) => m.prefCode === def.code);
  // 記事があるカテゴリのみ、都道府県×カテゴリのハブページへのリンクを出す
  const categoriesWithArticles = CATEGORIES.filter((c) =>
    articles.some((a) => a.section === "subsidy" && a.category === c.code)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "地域から探す", href: "/area" },
          { label: def.labelJa, href: `/area/${pref}` },
        ]}
      />
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{def.labelJa}の補助金・助成金</h1>

      {categoriesWithArticles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {categoriesWithArticles.map((c) => (
            <Link
              key={c.code}
              href={`/area/${pref}/${c.code}`}
              className="rounded-md bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-100 dark:hover:bg-brand-900/50"
            >
              {c.labelShort}の補助金
            </Link>
          ))}
        </div>
      )}

      {cities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {cities.map((c) => (
            <Link
              key={c.code}
              href={`/area/${pref}/${c.slug}`}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:border-brand-300 hover:bg-brand-50 dark:border-gray-800 dark:hover:border-brand-700 dark:hover:bg-brand-900/30"
            >
              {c.labelJa}
            </Link>
          ))}
        </div>
      )}

      {articles.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.href} article={a} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">この地域の記事は現在準備中です。</p>
      )}
    </div>
  );
}
