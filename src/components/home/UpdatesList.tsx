import type { Article } from "@/lib/content";
import { formatMonthDay, shortRegionLabel } from "@/lib/home";
import { DatedRow, SectionHeading } from "./primitives";

export interface UpdateItem {
  date: string;
  /** 速報（news）か記事更新か */
  kind: "速報" | "更新";
  label: string;
  title: string;
  href: string;
}

/** news と更新済み subsidy 記事を日付順に混ぜる */
export function buildUpdateItems(news: Article[], updated: Article[], n: number): UpdateItem[] {
  const items: UpdateItem[] = [
    ...news.map((a) => ({
      date: a.frontmatter.updatedAt,
      kind: "速報" as const,
      label: shortRegionLabel(a.frontmatter.subsidy?.regionLabel ?? "速報"),
      title: a.frontmatter.title,
      href: a.href,
    })),
    ...updated.map((a) => ({
      date: a.frontmatter.updatedAt,
      kind: "更新" as const,
      label: shortRegionLabel(a.frontmatter.subsidy?.regionLabel ?? ""),
      title: a.frontmatter.title,
      href: a.href,
    })),
  ];
  return items.sort((x, y) => y.date.localeCompare(x.date)).slice(0, n);
}

export function UpdatesList({ items }: { items: UpdateItem[] }) {
  return (
    <section aria-labelledby="home-updates" className="mt-10">
      <SectionHeading id="home-updates" title="速報・更新" more={{ href: "/news", label: "新着・締切情報へ" }} />
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">最近の更新はありません。</p>
      ) : (
        <ol className="mt-1">
          {items.map((it) => (
            <DatedRow
              key={it.href}
              href={it.href}
              date={
                <>
                  {formatMonthDay(it.date)}
                  <span className={`ml-1 text-xs font-normal ${it.kind === "速報" ? "text-shu-600 dark:text-shu-300" : "text-gray-500 dark:text-gray-400"}`}>
                    {it.kind}
                  </span>
                </>
              }
              label={it.label}
              title={it.title}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
