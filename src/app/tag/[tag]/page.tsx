import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTagIndex, getTagsWithArchivePage, orPlaceholder, EXPORT_PLACEHOLDER } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

/**
 * タグアーカイブ。「エネファーム 補助金」のような制度名クエリの受け皿。
 * 記事2件以上のタグのみ生成する（薄いページを作らない）。
 * writer が tags を必須化した（.claude/agents/writer.md）ため、記事が増えるほど自動拡張する。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return orPlaceholder(
    getTagsWithArchivePage().map((tag) => ({ tag })),
    { tag: EXPORT_PLACEHOLDER }
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  if (!getTagsWithArchivePage().includes(decoded)) return {};
  return {
    title: `「${decoded}」の補助金・助成金`,
    description: `${decoded}に関する補助金・助成金の記事一覧。金額・締切・申請条件を一次情報に基づいて解説します。`,
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const articles = getTagIndex().get(decoded) ?? [];
  if (articles.length < 2) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: `タグ「${decoded}」`, href: `/tag/${decoded}` },
        ]}
      />
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        「{decoded}」の補助金・助成金
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{articles.length}件の記事があります。</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.href} article={a} />
        ))}
      </div>
    </div>
  );
}
