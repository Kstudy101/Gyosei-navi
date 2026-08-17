import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { fetchText, CACHE_ROOT } from "@/lib/sources/http";

/**
 * jGrants 補助金監視 (TASK-08 — docs/10_MONITORING_REGISTRY.md §5)
 *   デジタル庁 jGrants 公開 API（認証不要）で「募集中」の補助金を取得し、
 *   新規公募だけを .cache/subsidies-seen.json と対照して報告する。
 *
 *   - v1 一覧: GET /exp/v1/public/subsidies?keyword=…&sort=…&order=…&acceptance=1
 *     ⚠ keyword は必須（2文字以上）。全件を返すパラメータは存在しない（2026-08-17 実測）
 *       → 広域キーワードの和集合で近似する（実測: 補助金212 / 事業229 / 和集合296件）
 *   - v2 詳細: GET /exp/v2/public/subsidies/id/{id}
 *     ⚠ application_guidelines[].data は base64 のファイル本体（巨大）→ 保存・出力しない
 *   - レートリミットは文書に記載なし → http.ts の全域 1秒間隔で保護
 */

const API_BASE = "https://api.jgrants-portal.go.jp/exp";
export const FRONT_URL = (id: string) => `https://www.jgrants-portal.go.jp/subsidy/${id}`;

/** 和集合カバレッジ用の広域キーワード（実測でこの7語の和集合が最大だった） */
export const LIST_KEYWORDS = ["事業", "補助金", "支援", "助成", "公募", "経営", "地域"] as const;

/* ---------------- v1 一覧 ---------------- */

export const subsidySummarySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().nullish(),
    title: z.string().min(1),
    acceptance_start_datetime: z.string().nullish(),
    acceptance_end_datetime: z.string().nullish(),
    institution_name: z.string().nullish(),
    subsidy_max_limit: z.number().nullish(),
    target_area_search: z.string().nullish(),
    target_number_of_employees: z.string().nullish(),
  })
  .passthrough();
export type SubsidySummary = z.infer<typeof subsidySummarySchema>;

const listResponseSchema = z.object({
  metadata: z.object({ resultset: z.object({ count: z.number() }).passthrough() }).passthrough(),
  result: z.array(subsidySummarySchema),
});

async function fetchListByKeyword(keyword: string): Promise<SubsidySummary[]> {
  const url =
    `${API_BASE}/v1/public/subsidies?keyword=${encodeURIComponent(keyword)}` +
    `&sort=created_date&order=DESC&acceptance=1`;
  const body = await fetchText(url, { timeoutMs: 45_000 });
  const parsed = listResponseSchema.safeParse(JSON.parse(body));
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`).join(" / ");
    throw new Error(`v1 一覧のスキーマ不一致 (keyword=${keyword}): ${issues}`);
  }
  return parsed.data.result;
}

/**
 * 募集中の補助金を広域キーワードの和集合で取得する。
 * 一部キーワードの失敗は警告に留める（seen 対照により次回で回収できる）が、
 * 全キーワード失敗または 0 件は明確に失敗させる（「変更なし」と誤認しないため）。
 */
export async function fetchOpenSubsidies(): Promise<{ items: SubsidySummary[]; warnings: string[] }> {
  const byId = new Map<string, SubsidySummary>();
  const warnings: string[] = [];
  let succeeded = 0;
  for (const kw of LIST_KEYWORDS) {
    try {
      const items = await fetchListByKeyword(kw); // fetchText 側で 1秒間隔が保証される
      succeeded++;
      for (const it of items) if (!byId.has(it.id)) byId.set(it.id, it);
    } catch (e) {
      warnings.push(`keyword「${kw}」取得失敗: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}`);
    }
  }
  if (succeeded === 0) throw new Error(`jGrants 一覧の取得に全キーワードで失敗:\n${warnings.join("\n")}`);
  if (byId.size === 0) throw new Error("jGrants 一覧が 0 件 — API 仕様変更の疑い（募集中 0 件は考えにくい）");
  return { items: [...byId.values()], warnings };
}

/* ---------------- v2 詳細 ---------------- */

export const subsidyDetailSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    subsidy_catch_phrase: z.string().nullish(),
    detail: z.string().nullish(),
    use_purpose: z.string().nullish(),
    industry: z.string().nullish(),
    subsidy_rate: z.string().nullish(),
    subsidy_max_limit: z.number().nullish(),
    front_subsidy_detail_page_url: z.string().nullish(),
    institution_name: z.string().nullish(),
    /** null または文字列（実測では null が多い） */
    granttype: z.string().nullish(),
    /** 募集回ごとの配列。中身はワークフロー単位の受付情報 */
    workflow: z.array(z.object({ id: z.string() }).passthrough()).nullish(),
    /** data は base64 ファイル本体なので名前だけ残す */
    application_guidelines: z
      .array(z.object({ name: z.string() }).passthrough().transform(({ name }) => ({ name })))
      .nullish(),
    outline_of_grant: z
      .array(z.object({ name: z.string() }).passthrough().transform(({ name }) => ({ name })))
      .nullish(),
    application_form: z
      .array(z.object({ name: z.string() }).passthrough().transform(({ name }) => ({ name })))
      .nullish(),
  })
  .passthrough();
export type SubsidyDetail = z.infer<typeof subsidyDetailSchema>;

const detailResponseSchema = z.object({
  metadata: z.record(z.unknown()),
  result: z.array(subsidyDetailSchema).min(1),
});

export async function fetchSubsidyDetail(id: string): Promise<SubsidyDetail> {
  const body = await fetchText(`${API_BASE}/v2/public/subsidies/id/${encodeURIComponent(id)}`, {
    timeoutMs: 45_000,
  });
  const parsed = detailResponseSchema.safeParse(JSON.parse(body));
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`).join(" / ");
    throw new Error(`v2 詳細のスキーマ不一致 (id=${id}): ${issues}`);
  }
  return parsed.data.result[0];
}

/* ---------------- seen 状態 ---------------- */

const seenSchema = z.record(
  z.object({
    title: z.string(),
    deadline: z.string().nullable(),
    firstSeenAt: z.string(),
  })
);
export type SubsidySeen = z.infer<typeof seenSchema>;

export const SEEN_FILE = path.join(CACHE_ROOT, "subsidies-seen.json");

export function loadSubsidySeen(file = SEEN_FILE): SubsidySeen {
  if (!fs.existsSync(file)) return {};
  const parsed = seenSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf-8")));
  if (!parsed.success) throw new Error(`subsidies-seen.json 이 손상되었습니다: ${file}`);
  return parsed.data;
}

export function saveSubsidySeen(state: SubsidySeen, file = SEEN_FILE): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2), "utf-8");
}

/* ---------------- 表示 ---------------- */

export function daysUntil(iso: string | null | undefined): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return Math.floor((t - Date.now()) / 86_400_000);
}

export function formatAmount(n: number | null | undefined): string {
  if (n == null) return "不明";
  if (n >= 100_000_000) return `${(n / 100_000_000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}億円`;
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString("ja-JP")}万円`;
  return `${n.toLocaleString("ja-JP")}円`;
}

export function formatSubsidy(s: SubsidySummary): string {
  const d = daysUntil(s.acceptance_end_datetime);
  const deadline = s.acceptance_end_datetime
    ? `${s.acceptance_end_datetime.slice(0, 10)}（D-${Number.isFinite(d) ? d : "?"}）${d <= 7 ? " ★緊急" : ""}`
    : "不明";
  return [
    `### ${s.title}`,
    `- 実施機関: ${s.institution_name ?? "不明"}`,
    `- 締切: ${deadline}`,
    `- 対象地域: ${s.target_area_search ?? "不明"} / 従業員: ${s.target_number_of_employees ?? "指定なし"}`,
    `- 上限額: ${formatAmount(s.subsidy_max_limit)}`,
    `- ${FRONT_URL(s.id)}`,
  ].join("\n");
}
