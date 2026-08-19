import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { SearchBox } from "@/components/search/SearchBox";

export const metadata: Metadata = {
  title: "記事検索",
  description: `${siteConfig.name}のサイト内検索。在留資格・許認可・法人設立・相続・補助金など、全記事から探せます。`,
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">記事検索</h1>
      <p className="mt-2 text-sm text-gray-600">
        公開中の全記事を対象に、本文まで含めて検索できます。
      </p>
      <div className="mt-6">
        <SearchBox />
      </div>
    </div>
  );
}
