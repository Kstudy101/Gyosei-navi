import { z } from "zod";

/**
 * ランキング（/ranking）記事 frontmatter スキーマ。
 * DataForSEO で拾った急上昇キーワードを起点に自動生成される記事専用 —
 * content/subsidy 等の一次情報記事とは完全に独立（articleFrontmatterSchema は使わない）。
 * 自動生成のため一次情報の裏取りをしない前提で、法的な断定表現を避ける disclaimer を必須化する。
 */

export const rankingItemSchema = z.object({
  rank: z.number().int().min(1).max(5),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const rankingFrontmatterSchema = z
  .object({
    title: z.string().min(10).max(60),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slugは英小文字・数字・ハイフンのみ"),
    description: z.string().min(50).max(160),
    keyword: z.string().min(1),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(["draft", "published"]),
    items: z.array(rankingItemSchema).length(5),
    source: z.literal("dataforseo-auto"),
  })
  .refine((d) => d.updatedAt >= d.publishedAt, {
    message: "updatedAt は publishedAt 以降である必要があります",
    path: ["updatedAt"],
  })
  .refine(
    (d) => {
      const ranks = d.items.map((i) => i.rank).sort((a, b) => a - b);
      return ranks.every((r, i) => r === i + 1);
    },
    { message: "items の rank は 1〜5 の連番でなければなりません", path: ["items"] }
  );

export type RankingFrontmatter = z.infer<typeof rankingFrontmatterSchema>;
export type RankingItem = z.infer<typeof rankingItemSchema>;
