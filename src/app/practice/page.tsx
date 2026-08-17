import type { Metadata } from "next";
import Link from "next/link";
import { PRACTICE_CATEGORIES } from "@/config/taxonomy";

export const metadata: Metadata = {
  title: "実務インテリジェンス",
  description:
    "現役行政書士向けの実務論点・IT/DX活用・事務所経営情報。制度改正の実務インパクトを深掘りします。",
};

export default function PracticeIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">実務インテリジェンス</h1>
      <p className="mt-2 text-sm text-gray-600">
        現役の行政書士・士業関係者向けに、実務論点と IT/DX 活用を解説します。
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {Object.entries(PRACTICE_CATEGORIES).map(([code, def]) => (
          <Link
            key={code}
            href={`/practice/${code}`}
            className="rounded-lg border border-gray-200 p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-lg font-bold text-gray-900">{def.labelJa}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {def.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
