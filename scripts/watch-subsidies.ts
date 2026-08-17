/**
 * jGrants 補助金 신착 감시 CLI (TASK-08)
 *   npm run subsidies                     # 募集中 목록 취득, 신규만 출력
 *   npm run subsidies -- --dry-run        # seen 갱신 없이
 *   npm run subsidies -- --details 3      # 신규 상위 N건은 v2 상세도 취득 (기본 0)
 *   npm run subsidies -- --github-issue   # 신규 있으면 Issue 기표 (일괄 1건)
 *   npm run subsidies -- --report out.md
 */
import fs from "node:fs";
import {
  fetchOpenSubsidies,
  fetchSubsidyDetail,
  loadSubsidySeen,
  saveSubsidySeen,
  daysUntil,
  formatSubsidy,
  type SubsidySummary,
} from "../src/lib/sources/jgrants";
import { createGithubIssue } from "../src/lib/sources/github-issue";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && !process.argv[i + 1]?.startsWith("--") ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

async function main(): Promise<void> {
  const dryRun = flag("dry-run");
  const wantIssue = flag("github-issue");
  const reportFile = arg("report");
  const detailsN = Number(arg("details") ?? "0");

  const seen = loadSubsidySeen();
  const firstRun = Object.keys(seen).length === 0;

  const { items, warnings } = await fetchOpenSubsidies();
  const knownCount = items.filter((s) => seen[s.id]).length;
  const fresh = items.filter((s) => !seen[s.id]);
  fresh.sort((a, b) => daysUntil(a.acceptance_end_datetime) - daysUntil(b.acceptance_end_datetime));

  const now = new Date().toISOString();
  if (!dryRun) {
    for (const s of items) {
      if (!seen[s.id]) {
        seen[s.id] = { title: s.title, deadline: s.acceptance_end_datetime ?? null, firstSeenAt: now };
      }
    }
    saveSubsidySeen(seen);
  }

  const lines: string[] = [];
  lines.push(`取得: 募集中 ${items.length}件（広域キーワード和集合） / うち既知 ${knownCount}件`);
  for (const w of warnings) lines.push(`⚠ ${w}`);
  if (firstRun) lines.push(`（初回実行: 既知案件として ${items.length}件を記録${dryRun ? "予定 (dry-run)" : ""}）`);
  lines.push("");

  if (fresh.length === 0) {
    lines.push("🆕 新規公募なし");
  } else if (firstRun) {
    // 初回はベースライン記録のみ。「新規」見出しを出さず CI の Issue 条件に掛けない
    lines.push(`（初回実行）既知として記録した ${fresh.length}件（通知対象外・上位のみ表示）`, "");
    for (const s of fresh.slice(0, 5)) lines.push(formatSubsidy(s), "");
  } else {
    lines.push(`🆕 新規補助金公募 ${fresh.length}件`, "");
    const urgent = fresh.filter((s) => daysUntil(s.acceptance_end_datetime) <= 7);
    const normal = fresh.filter((s) => daysUntil(s.acceptance_end_datetime) > 7);
    if (urgent.length > 0) {
      lines.push(`★ 緊急 (締切 D-7 以内) ${urgent.length}件`, "");
      for (const s of urgent) lines.push(formatSubsidy(s), "");
    }
    for (const s of normal) lines.push(formatSubsidy(s), "");

    // 신규 상위 N건은 v2 상세 (개요 문구·보조율)를 병기 — 요청 간격은 http.ts 가 1초 보장
    if (detailsN > 0) {
      lines.push("", `## 詳細（新規上位 ${Math.min(detailsN, fresh.length)}件）`, "");
      for (const s of fresh.slice(0, detailsN)) {
        try {
          const d = await fetchSubsidyDetail(s.id);
          lines.push(
            `### ${d.title}`,
            d.subsidy_catch_phrase ? `> ${d.subsidy_catch_phrase}` : "",
            `- 補助率: ${d.subsidy_rate ?? "不明"} / 上限: ${d.subsidy_max_limit ?? "不明"}`,
            `- 公募資料: ${(d.application_guidelines ?? []).map((f) => f.name).join(", ") || "なし"}`,
            ""
          );
        } catch (e) {
          lines.push(`（詳細取得失敗 ${s.id}: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}）`, "");
        }
      }
    }
  }

  const report = lines.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
  console.log(report);
  if (reportFile) fs.writeFileSync(reportFile, report, "utf-8");

  if (wantIssue && fresh.length > 0 && !firstRun) {
    const urgentCount = fresh.filter((s) => daysUntil(s.acceptance_end_datetime) <= 7).length;
    const res = createGithubIssue({
      title: `[補助金] 新規公募 ${fresh.length}件${urgentCount > 0 ? `（★D-7以内 ${urgentCount}件）` : ""} (${now.slice(0, 10)})`,
      body: report,
      labels: ["content-opportunity", "priority:P2"],
    });
    console.log(res.ok ? `  Issue 作成: ${res.url}` : `  ✖ Issue 作成失敗: ${res.error}`);
  }
}

main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
