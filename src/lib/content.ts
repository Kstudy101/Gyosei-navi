import type { ArticleFrontmatter } from "@/lib/content-schema";

/**
 * MDX コンテンツローディング — 暫定スタブ v2
 *
 * v1 の MDX パイプライン（gray-matter + 自前レンダラ）は content/ 全削除に伴い撤去した。
 * v2 で MDX を使うかどうか自体、まだ決定していない（docs/03_CONTENT_TEMPLATE.md 未確定事項 §8 と合わせて再検討）。
 * このファイルはビルドを通すための最小スタブであり、実装ではない。
 * 呼び出し側（sitemap.ts 等）が壊れないよう、常に空配列/undefinedを返す。
 */

export interface Article {
  href: string;
  frontmatter: ArticleFrontmatter;
}

export function getAllArticles(): Article[] {
  return [];
}

export function getLatestArticles(_limit: number): Article[] {
  return [];
}

export function getArticlesBySection(_section: string): Article[] {
  return [];
}

export function getArticleBySlug(_slug: string): Article | undefined {
  return undefined;
}

export function getArticle(_section: string, _slug: string): Article | undefined {
  return undefined;
}

export const EXPORT_PLACEHOLDER = "__placeholder__";

export function orPlaceholder<T>(items: T[], placeholder: T): T[] {
  return items.length > 0 ? items : [placeholder];
}
