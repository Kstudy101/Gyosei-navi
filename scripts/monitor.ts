/**
 * 一次情報 変更検知 CLI (TASK-02)
 *   npm run monitor                      # 전체 (enabled 소스, checkFrequency 무시)
 *   npm run monitor -- --priority P0     # P0만
 *   npm run monitor -- --id isa-eiju-guideline
 *   npm run monitor -- --dry-run         # 상태 파일 갱신 없이 확인
 *   npm run monitor -- --github-issue    # 변경 시 Issue 기표
 *   npm run monitor -- --report out.md   # 리포트를 파일로도 저장 (CI용)
 */
import fs from "node:fs";
import {
  loadSources,
  loadState,
  saveState,
  checkSource,
  formatChangeReport,
  type CheckResult,
} from "../src/lib/sources/monitor";
import { loadRssSeen, saveRssSeen, checkRssSource } from "../src/lib/sources/rss";
import { createGithubIssue } from "../src/lib/sources/github-issue";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && !process.argv[i + 1]?.startsWith("--") ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

async function main(): Promise<void> {
  const dryRun = flag("dry-run");
  const wantIssue = flag("github-issue");
  const onlyPriority = arg("priority");
  const onlyId = arg("id");
  const reportFile = arg("report");

  // diff + rss を対象にする（api は専用スクリプト）。TASK-10 で rss 分岐を追加
  let sources = loadSources(undefined, { includeNonDiff: true }).filter(
    (s) => s.enabled && (s.method === "diff" || s.method === "rss")
  );
  if (onlyPriority) sources = sources.filter((s) => s.priority === onlyPriority);
  if (onlyId) sources = sources.filter((s) => s.id === onlyId);
  if (sources.length === 0) {
    console.error("대상 소스가 없습니다 (필터 조건 확인)");
    process.exitCode = 1;
    return;
  }

  const state = loadState();
  const rssSeen = loadRssSeen();
  const nRss = sources.filter((s) => s.method === "rss").length;
  console.log(`監視 ${sources.length}件（diff ${sources.length - nRss} / rss ${nRss}）${dryRun ? " (dry-run)" : ""}\n`);

  const results: CheckResult[] = [];
  for (const s of sources) {
    process.stdout.write(`  ${s.id} … `);
    let r: CheckResult;
    if (s.method === "rss") {
      const rr = await checkRssSource(s, rssSeen, { dryRun });
      r = {
        source: s,
        status: rr.status,
        rssItems: rr.newItems?.map((i) => ({ title: i.title, link: i.link, date: i.date })),
        error: rr.error,
      };
    } else {
      r = await checkSource(s, state, { dryRun });
    }
    results.push(r);
    const mark = { initialized: "初期化", unchanged: "変更なし", changed: "★変更", error: "✖ エラー" }[r.status];
    console.log(mark + (r.error ? `: ${r.error.split("\n")[0]}` : ""));
  }

  if (!dryRun) {
    saveState(state);
    saveRssSeen(rssSeen);
  }

  const changed = results.filter((r) => r.status === "changed");
  const errors = results.filter((r) => r.status === "error");
  const initialized = results.filter((r) => r.status === "initialized");

  const reportParts: string[] = [];
  if (changed.length > 0) {
    reportParts.push(`# 変更検知 ${changed.length}件 (${new Date().toISOString().slice(0, 10)})`, "");
    for (const r of changed) reportParts.push(formatChangeReport(r), "", "---", "");
  }
  const report = reportParts.join("\n");

  console.log("");
  if (initialized.length > 0) console.log(`初期化完了: ${initialized.length}件（ベースライン記録）`);
  if (changed.length === 0 && errors.length === 0 && initialized.length === 0) console.log("変更なし");
  if (changed.length > 0) console.log("\n" + report);
  if (errors.length > 0) {
    console.log(`\nエラー ${errors.length}件:`);
    for (const r of errors) console.log(`  - ${r.source.id}: ${r.error}`);
  }

  if (reportFile) {
    fs.writeFileSync(reportFile, report, "utf-8");
  }

  if (wantIssue && changed.length > 0) {
    for (const r of changed) {
      const res = createGithubIssue({
        title: `[一次情報変更] ${r.source.name} (${r.source.priority})`,
        body: formatChangeReport(r),
        labels: ["content-opportunity", `priority:${r.source.priority}`],
      });
      console.log(res.ok ? `  Issue 作成: ${res.url}` : `  ✖ Issue 作成失敗 (${r.source.id}): ${res.error}`);
    }
  }

  // 全件エラーは失敗扱い（C6）。一部エラーは exit 0 だがログに残す
  if (errors.length === results.length) process.exitCode = 1;
}

main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
