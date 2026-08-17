import type { Article } from "@/lib/content";

/**
 * 関連記事の選定:
 *   1. frontmatter.relatedSlugs で明示された記事（編集意図を最優先）
 *   2. 同カテゴリ + タグ重複数の多い順
 */
export function getRelatedArticles(
  article: Article,
  all: Article[],
  limit = 4
): Article[] {
  const others = all.filter((a) => a.frontmatter.slug !== article.frontmatter.slug);

  const explicit = article.frontmatter.relatedSlugs
    .map((slug) => others.find((a) => a.frontmatter.slug === slug))
    .filter((a): a is Article => a !== undefined);

  const tagSet = new Set(article.frontmatter.tags);
  const scored = others
    .filter((a) => !explicit.includes(a))
    .map((a) => {
      const tagOverlap = a.frontmatter.tags.filter((t) => tagSet.has(t)).length;
      const sameCategory =
        a.frontmatter.category === article.frontmatter.category ? 1 : 0;
      return { a, score: tagOverlap * 2 + sameCategory };
    })
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((s) => s.a);

  return [...explicit, ...scored].slice(0, limit);
}
