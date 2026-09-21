"use client";

import { useState } from "react";
import type { Article } from "@/lib/content";
import { NewsListItem } from "@/components/article/NewsListItem";

function deadlineMeta(article: Article): string {
  const s = article.frontmatter.subsidy;
  if (!s?.periodEnd) return "";
  const days = Math.floor((Date.parse(s.periodEnd) - Date.now()) / 86_400_000);
  return `締切: ${s.periodEnd}（残り${days}日）`;
}

function publishedMeta(article: Article): string {
  return `${article.frontmatter.publishedAt} 公開`;
}

export function NewsTabs({ newest, deadline }: { newest: Article[]; deadline: Article[] }) {
  const [tab, setTab] = useState<"newest" | "deadline">("newest");

  const tabs = [
    { key: "newest" as const, label: `新着 (${newest.length})` },
    { key: "deadline" as const, label: `締切間近 (${deadline.length})` },
  ];
  const list = tab === "newest" ? newest : deadline;
  const meta = tab === "newest" ? publishedMeta : deadlineMeta;

  return (
    <div>
      <div role="tablist" className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "border-brand-600 text-brand-600 dark:border-brand-100 dark:text-brand-100"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length > 0 ? (
        <ul className="mt-2">
          {list.map((a) => (
            <NewsListItem key={a.href} article={a} meta={meta(a)} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          {tab === "newest" ? "新着情報は現在ありません。" : "締切が1か月以内の制度は現在ありません。"}
        </p>
      )}
    </div>
  );
}
