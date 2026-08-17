import Link from "next/link";
import { siteConfig } from "@/config/site";
import { CATEGORIES, SECTIONS } from "@/config/taxonomy";
import { getLatestArticles, getArticleBySlug } from "@/lib/content";
import { ArticleCard } from "@/components/article/ArticleCard";

/** 特集バナーで押し出す柱記事（永住ガイドライン改定 — ローンチフック） */
const FEATURE_SLUG = "eiju-guideline-kaitei-2026";

export default function HomePage() {
  const latest = getLatestArticles(6);
  const feature = getArticleBySlug(FEATURE_SLUG);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* ヒーロー */}
      <section className="rounded-xl bg-brand-800 px-6 py-10 text-white sm:px-10">
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl">
          {siteConfig.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-100 sm:text-base">
          {siteConfig.description}
        </p>
      </section>

      {/* 特集: 永住ガイドライン改定 */}
      {feature && (
        <section className="mt-8">
          <Link
            href={feature.href}
            className="block rounded-lg border-2 border-accent-600 bg-amber-50 p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-xs font-bold text-accent-600">
              特集: 永住許可ガイドライン改定（2026年8月改定案公表）
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900">
              {feature.frontmatter.title}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {feature.frontmatter.description}
            </p>
          </Link>
        </section>
      )}

      {/* 最新記事 */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-gray-900">最新記事</h2>
          <Link href="/news" className="text-sm text-brand-600 hover:underline">
            速報・動向一覧 →
          </Link>
        </div>
        {latest.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <ArticleCard key={a.href} article={a} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">記事は現在準備中です。</p>
        )}
      </section>

      {/* 分野から探す */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">分野から探す</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.code}
              href={`/guide/${c.code}`}
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

      {/* その他セクション */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["practice", "exam", "tools", "data"] as const).map((key) => (
          <Link
            key={key}
            href={SECTIONS[key].path}
            className="rounded-lg bg-gray-50 p-4 text-center transition-colors hover:bg-brand-50"
          >
            <p className="font-semibold text-gray-900">{SECTIONS[key].label}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
