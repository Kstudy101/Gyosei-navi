import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MUNICIPALITIES, PREFECTURES, getPrefectureBySlug, getPrefectureByCode, getMunicipalityBySlug } from "@/config/regions";
import { CATEGORIES, CATEGORY_CODES, getCategory } from "@/config/taxonomy";
import {
  getArticlesByRegionCode,
  getArticlesByPrefectureAndCategory,
  orPlaceholder,
  EXPORT_PLACEHOLDER,
} from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

/**
 * このルートは2用途を兼ねる:
 *   /area/{pref}/{市区町村slug}   … 市区町村ページ
 *   /area/{pref}/{カテゴリcode}   … 都道府県×カテゴリのハブページ（「秋田県 住宅 補助金」系クエリの受け皿）
 * カテゴリ code（英字）と市区町村 slug の衝突は generateStaticParams でビルドを落として検知する。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  const collision = MUNICIPALITIES.find((m) => (CATEGORY_CODES as readonly string[]).includes(m.slug));
  if (collision) {
    throw new Error(
      `市区町村slug「${collision.slug}」がカテゴリcodeと衝突しています — /area/{pref}/{city} ルートを分離してください`
    );
  }

  const cityParams = MUNICIPALITIES.map((m) => {
    const pref = getPrefectureByCode(m.prefCode);
    return { pref: pref?.slug ?? "", city: m.slug };
  }).filter((p) => p.pref !== "");

  // 都道府県×カテゴリ: 記事が1件以上ある組み合わせのみ（薄いページを作らない）
  const prefCategoryParams = PREFECTURES.flatMap((p) =>
    CATEGORY_CODES.filter((code) => getArticlesByPrefectureAndCategory(p.code, code).length > 0).map(
      (code) => ({ pref: p.slug, city: code })
    )
  );

  return orPlaceholder(
    [...cityParams, ...prefCategoryParams],
    { pref: EXPORT_PLACEHOLDER, city: EXPORT_PLACEHOLDER }
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pref: string; city: string }>;
}): Promise<Metadata> {
  const { pref, city } = await params;
  const prefDef = getPrefectureBySlug(pref);
  const categoryDef = getCategory(city);
  if (prefDef && categoryDef) {
    return {
      title: `${prefDef.labelJa}の${categoryDef.labelJa}の補助金・助成金`,
      description: `${prefDef.labelJa}（市区町村を含む）で使える${categoryDef.labelJa}分野の補助金・助成金を一覧で確認できます。金額・締切・申請条件を一次情報に基づいて解説します。`,
    };
  }
  const m = getMunicipalityBySlug(pref, city);
  if (!m) return {};
  return {
    title: `${m.labelJa}の補助金・助成金`,
    description: `${m.labelJa}で使える国・都道府県・市区町村の補助金・助成金をまとめて確認できます。`,
  };
}

export default async function MunicipalityPage({
  params,
}: {
  params: Promise<{ pref: string; city: string }>;
}) {
  const { pref, city } = await params;
  const prefDef = getPrefectureBySlug(pref);
  if (!prefDef) notFound();

  // 都道府県×カテゴリのハブページ
  const categoryDef = getCategory(city);
  if (categoryDef) {
    const articles = getArticlesByPrefectureAndCategory(prefDef.code, city);
    if (articles.length === 0) notFound();
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "地域から探す", href: "/area" },
            { label: prefDef.labelJa, href: `/area/${pref}` },
            { label: categoryDef.labelJa, href: `/area/${pref}/${city}` },
          ]}
        />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {prefDef.labelJa}の{categoryDef.labelJa}の補助金・助成金
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{categoryDef.description}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.href} article={a} />
          ))}
        </div>
        <p className="mt-8 text-sm">
          <Link href={`/area/${pref}`} className="text-brand-600 hover:underline dark:text-brand-100">
            {prefDef.labelJa}のすべての補助金を見る →
          </Link>
        </p>
      </div>
    );
  }

  // 市区町村ページ
  const m = getMunicipalityBySlug(pref, city);
  if (!m) notFound();

  const articles = getArticlesByRegionCode(m.code);
  // 記事があるカテゴリのみ、市区町村×カテゴリのハブページへのリンクを出す
  const categoriesWithArticles = CATEGORIES.filter((c) =>
    articles.some((a) => a.section === "subsidy" && a.category === c.code)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "地域から探す", href: "/area" },
          { label: prefDef.labelJa, href: `/area/${pref}` },
          { label: m.labelJa, href: `/area/${pref}/${city}` },
        ]}
      />
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{m.labelJa}の補助金・助成金</h1>
      {categoriesWithArticles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {categoriesWithArticles.map((c) => (
            <Link
              key={c.code}
              href={`/area/${pref}/${city}/${c.code}`}
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
