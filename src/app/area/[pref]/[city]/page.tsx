import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MUNICIPALITIES, getPrefectureBySlug, getPrefectureByCode, getMunicipalityBySlug } from "@/config/regions";
import { getArticlesByRegionCode, orPlaceholder, EXPORT_PLACEHOLDER } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const dynamicParams = false;

export function generateStaticParams() {
  const params = MUNICIPALITIES.map((m) => {
    const pref = getPrefectureByCode(m.prefCode);
    return { pref: pref?.slug ?? "", city: m.slug };
  }).filter((p) => p.pref !== "");
  return orPlaceholder(params, { pref: EXPORT_PLACEHOLDER, city: EXPORT_PLACEHOLDER });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pref: string; city: string }>;
}): Promise<Metadata> {
  const { pref, city } = await params;
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
  const m = getMunicipalityBySlug(pref, city);
  if (!prefDef || !m) notFound();

  const articles = getArticlesByRegionCode(m.code);

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
