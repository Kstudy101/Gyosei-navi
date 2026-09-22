import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MUNICIPALITIES, getPrefectureByCode, getPrefectureBySlug, getMunicipalityBySlug } from "@/config/regions";
import { CATEGORY_CODES, getCategory } from "@/config/taxonomy";
import { getArticlesByRegionAndCategory, orPlaceholder, EXPORT_PLACEHOLDER } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

/**
 * 市区町村×カテゴリのハブページ。
 * 「世田谷区 住宅 補助金」のような実際の検索クエリに対応するロングテール受け皿。
 * 記事が1件以上ある組み合わせのみ生成する（薄いページを作らない）。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  const params: { pref: string; city: string; category: string }[] = [];
  for (const m of MUNICIPALITIES) {
    const pref = getPrefectureByCode(m.prefCode);
    if (!pref) continue;
    for (const category of CATEGORY_CODES) {
      if (getArticlesByRegionAndCategory(m.code, category).length > 0) {
        params.push({ pref: pref.slug, city: m.slug, category });
      }
    }
  }
  return orPlaceholder(params, {
    pref: EXPORT_PLACEHOLDER,
    city: EXPORT_PLACEHOLDER,
    category: EXPORT_PLACEHOLDER,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pref: string; city: string; category: string }>;
}): Promise<Metadata> {
  const { pref, city, category } = await params;
  const m = getMunicipalityBySlug(pref, city);
  const def = getCategory(category);
  if (!m || !def) return {};
  return {
    title: `${m.labelJa}の${def.labelJa}の補助金・助成金`,
    description: `${m.labelJa}で使える${def.labelJa}分野の補助金・助成金を一覧で確認できます。金額・締切・申請条件を一次情報に基づいて解説します。`,
  };
}

export default async function MunicipalityCategoryPage({
  params,
}: {
  params: Promise<{ pref: string; city: string; category: string }>;
}) {
  const { pref, city, category } = await params;
  const prefDef = getPrefectureBySlug(pref);
  const m = getMunicipalityBySlug(pref, city);
  const def = getCategory(category);
  if (!prefDef || !m || !def) notFound();

  const articles = getArticlesByRegionAndCategory(m.code, category);
  if (articles.length === 0) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "地域から探す", href: "/area" },
          { label: prefDef.labelJa, href: `/area/${pref}` },
          { label: m.labelJa, href: `/area/${pref}/${city}` },
          { label: def.labelJa, href: `/area/${pref}/${city}/${category}` },
        ]}
      />
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {m.labelJa}の{def.labelJa}の補助金・助成金
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{def.description}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.href} article={a} />
        ))}
      </div>
      <p className="mt-8 text-sm">
        <Link href={`/area/${pref}/${city}`} className="text-brand-600 hover:underline dark:text-brand-100">
          {m.labelJa}のすべての補助金を見る →
        </Link>
      </p>
    </div>
  );
}
