import { z } from "zod";

/**
 * ランキング（/ranking）記事 frontmatter スキーマ。
 * DataForSEO で拾った検索キーワードを起点に、Claude Code（headless）が Web 調査して
 * 作成する記事専用 — content/subsidy 等の一次情報記事とは完全に独立
 * （articleFrontmatterSchema は使わない・rank/compareTargets 等の重い共通 refine は持たない）。
 */

export const rankingItemSchema = z.object({
  rank: z.number().int().min(1).max(5),
  /** 順位の対象（例: 「渋谷区」「移住支援金 最大100万円」など） */
  label: z.string().min(1),
  body: z.string().min(1),
  /** 調査で確認した出典URL（複数可） */
  sourceUrls: z.array(z.string().url()).min(1),
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
    source: z.literal("dataforseo-researched"),
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
