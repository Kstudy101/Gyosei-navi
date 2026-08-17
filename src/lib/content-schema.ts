import { z } from "zod";
import { CATEGORY_CODES } from "@/config/taxonomy";

/**
 * MDX frontmatter のバリデーションスキーマ。
 * ビルド時に全記事を検証し、1件でも不正なら build を失敗させる（品質ゲート）。
 */

export const legalBasisSchema = z.object({
  /** 出典名（例: 出入国在留管理庁「永住許可に関するガイドライン(案)」） */
  label: z.string().min(1),
  /** 一次情報のURL */
  url: z.string().url(),
  /** 参照日（リンク切れ検証用） */
  accessedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const faqSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export const articleFrontmatterSchema = z
  .object({
    title: z.string().min(10).max(60),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slugは英小文字・数字・ハイフンのみ（日本語URL禁止）"),
    category: z.enum(CATEGORY_CODES as [string, ...string[]]).or(z.string()),
    subcategory: z.string().optional(),
    type: z.enum(["pillar", "cluster", "news", "checklist", "interview", "tool"]),
    audience: z
      .array(z.enum(["for-individual", "for-business", "for-pro", "for-exam"]))
      .min(1),
    tags: z.array(z.string()).default([]),
    description: z.string().min(50).max(160), // meta description 最適長
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string().default("editorial"),
    /** 有資格者による監修者（資格取得後に活用） */
    reviewedBy: z.string().nullable().default(null),
    status: z.enum(["draft", "review", "published", "archived"]),
    noticeLevel: z
      .enum(["enforced", "scheduled", "draft-proposal", "outdated"])
      .default("enforced"),
    /** 一次情報。published 記事では最低1件を必須とする（下の refine 参照） */
    legalBasis: z.array(legalBasisSchema).default([]),
    relatedSlugs: z.array(z.string()).default([]),
    /** GEO/LLMO 対策。AI検索の引用を狙うため全記事に推奨 */
    faq: z.array(faqSchema).default([]),
    ogImage: z.string().optional(),
    /** 想定検索キーワード（内部管理用・出力しない） */
    targetKeywords: z.array(z.string()).default([]),
    /** 更新履歴 */
    changelog: z
      .array(z.object({ date: z.string(), note: z.string() }))
      .default([]),
  })
  .refine(
    (d) => d.status !== "published" || d.legalBasis.length > 0,
    { message: "公開記事には一次情報（legalBasis）が最低1件必要です", path: ["legalBasis"] }
  )
  .refine((d) => d.updatedAt >= d.publishedAt, {
    message: "updatedAt は publishedAt 以降である必要があります",
    path: ["updatedAt"],
  });

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;
