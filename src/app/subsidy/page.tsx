import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/config/taxonomy";

export const metadata: Metadata = {
  title: "補助金を探す",
  description: "出産・育児、住宅、創業、介護、エネルギーなど目的別に、全国の補助金・助成金を一次情報に基づいて解説します。",
};

export default function SubsidyIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">補助金を探す</h1>
      <p className="mt-2 text-sm text-gray-600">目的別に、全国の補助金・助成金をわかりやすく解説します。</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.code}
            href={`/subsidy/${c.code}`}
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
