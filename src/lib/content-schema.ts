import { z } from "zod";
import { CATEGORY_CODES } from "@/config/taxonomy";

/**
 * MDX frontmatter のバリデーションスキーマ v2。
 * ビルド時に全記事を検証し、1件でも不正なら build を失敗させる（品質ゲート）。
 * 設計意図: docs/03_CONTENT_TEMPLATE.md
 */

export const sourceLinkSchema = z.object({
  /** 出典名（例: 渋谷区「出産応援ギフト」案内ページ） */
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

/** 補助金レコード本体（docs/03 §2.3） */
export const subsidySchema = z.object({
  /** 総務省 全国地方公共団体コード（5桁）。全国共通制度は regions.ts の NATIONAL_REGION_CODE */
  regionCode: z.string().regex(/^\d{5}$/),
  regionLabel: z.string().min(1),
  provider: z.enum(["national", "prefecture", "municipality"]),
  amount: z.string().optional(),
  periodStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  periodEnd: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: z.enum(["open", "closed", "ongoing", "unresearched"]),
  applyUrl: z.string().url(),
  eligibility: z.string().optional(),
  /** 金額・条件を最終確認した日（sourceLinks の accessedAt とは別管理） */
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const articleFrontmatterSchema = z
  .object({
    title: z.string().min(10).max(60),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slugは英小文字・数字・ハイフンのみ（日本語URL禁止）"),
    category: z.enum(CATEGORY_CODES as [string, ...string[]]).or(z.string()),
    type: z.enum(["pillar", "cluster", "compare", "news", "checklist", "tool"]),
    tags: z.array(z.string()).default([]),
    description: z.string().min(50).max(160), // meta description 最適長
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string().default("editorial"),
    status: z.enum(["draft", "review", "published", "archived"]),
    /** 一次情報。published 記事では最低1件を必須とする（下の refine 参照） */
    sourceLinks: z.array(sourceLinkSchema).default([]),
    relatedSlugs: z.array(z.string()).default([]),
    /** GEO/LLMO 対策。AI検索の引用を狙うため全記事に推奨 */
    faq: z.array(faqSchema).default([]),
    ogImage: z.string().optional(),
    /** 想定検索キーワード（内部管理用・出力しない） */
    targetKeywords: z.array(z.string()).default([]),
    /** 更新履歴 */
    changelog: z.array(z.object({ date: z.string(), note: z.string() })).default([]),
    /** type: cluster/pillar/news の記事が扱う補助金の構造化データ。compare 記事は不要 */
    subsidy: subsidySchema.optional(),
    /** type: compare 専用。比較対象の記事 slug（最低5件 — docs/03 §3） */
    compareTargets: z.array(z.string()).default([]),
  })
  .refine((d) => d.status !== "published" || d.sourceLinks.length > 0, {
    message: "公開記事には一次情報（sourceLinks）が最低1件必要です",
    path: ["sourceLinks"],
  })
  .refine((d) => d.updatedAt >= d.publishedAt, {
    message: "updatedAt は publishedAt 以降である必要があります",
    path: ["updatedAt"],
  })
  .refine((d) => d.type === "compare" || d.subsidy !== undefined, {
    message: "compare以外の記事には subsidy フィールドが必須です",
    path: ["subsidy"],
  })
  .refine((d) => d.type !== "compare" || d.compareTargets.length >= 5, {
    message: "compare記事は比較対象（compareTargets）が最低5件必要です",
    path: ["compareTargets"],
  });

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;
