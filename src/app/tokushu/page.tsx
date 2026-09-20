import type { Metadata } from "next";
import Link from "next/link";
import { TOKUSHU_CATEGORIES } from "@/config/taxonomy";

export const metadata: Metadata = {
  title: "特集",
  description: "子育てに手厚い市など、編集部が蓄積データをもとにテーマ別にランキング・比較する特集記事です。",
};

export default function TokushuIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">特集</h1>
      <p className="mt-2 text-sm text-gray-600">
        蓄積したデータをもとに、編集部がテーマ別にランキング・解説する特集記事です。
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TOKUSHU_CATEGORIES.map((c) => (
          <Link
            key={c.code}
            href={`/tokushu/${c.code}`}
            className="rounded-lg border border-gray-200 p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-lg font-bold text-gray-900">{c.labelJa}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
