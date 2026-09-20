import type { Metadata } from "next";
import Link from "next/link";
import { PREFECTURES } from "@/config/regions";

export const metadata: Metadata = {
  title: "地域から探す",
  description: "都道府県・市区町村ごとに、その地域で使える補助金・助成金をまとめて確認できます。",
};

export default function AreaIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">地域から探す</h1>
      <p className="mt-2 text-sm text-gray-600">
        都道府県を選ぶと、その地域で使える補助金・助成金をまとめて確認できます。
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {PREFECTURES.map((p) => (
          <Link
            key={p.code}
            href={`/area/${p.slug}`}
            className="rounded-md border border-gray-200 px-3 py-2 text-center text-sm transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            {p.labelJa}
          </Link>
        ))}
      </div>
    </div>
  );
}
