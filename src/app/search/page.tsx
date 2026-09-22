import type { Metadata } from "next";
import { PagefindSearch } from "@/components/search/PagefindSearch";

export const metadata: Metadata = {
  title: "サイト内検索",
  description: "全国補助金ナビの記事を制度名・地域名・キーワードで検索できます。",
  // サイト内検索結果ページはインデックスさせない（SEO ベストプラクティス）
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">サイト内検索</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        制度名（例: エネファーム、耐震改修）や地域名で記事を検索できます。
      </p>
      <div className="mt-6">
        <PagefindSearch />
      </div>
    </div>
  );
}
