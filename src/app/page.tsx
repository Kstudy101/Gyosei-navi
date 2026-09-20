import Link from "next/link";
import { siteConfig } from "@/config/site";
import { CATEGORIES } from "@/config/taxonomy";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-xl bg-brand-800 px-6 py-10 text-white sm:px-10">
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{siteConfig.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-100 sm:text-base">
          {siteConfig.description}
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">目的から探す</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.code}
              href={`/subsidy/${c.code}`}
              className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-gray-900">{c.labelJa}</p>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray-600">
                {c.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
        コンテンツは準備中です。
      </section>
    </div>
  );
}
