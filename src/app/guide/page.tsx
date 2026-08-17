import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/config/taxonomy";

export const metadata: Metadata = {
  title: "手続きガイド",
  description:
    "在留資格・法人設立・許認可・相続など、行政書士が扱う8分野の手続きを一次情報に基づいてわかりやすく解説します。",
};

export default function GuideIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">手続きガイド</h1>
      <p className="mt-2 text-sm text-gray-600">
        行政書士業務の8分野を、一般の方・企業担当者向けにわかりやすく解説します。
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.code}
            href={`/guide/${c.code}`}
            className="rounded-lg border border-gray-200 p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-lg font-bold text-gray-900">{c.labelJa}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {c.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
