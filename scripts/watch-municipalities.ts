/**
 * 地自治体 一次情報 変更検知（新着キャッチ）CLI
 *   npm run watch:municipalities                  # 全件チェック
 *   npm run watch:municipalities -- --dry-run      # 状態ファイルを更新せず確認のみ
 *   npm run watch:municipalities -- --github-issue # 変更があれば Issue 起票（一括1件）
 *   npm run watch:municipalities -- --report out.md
 */
import fs from "node:fs";
import {
  collectWatchTargets,
  loadState,
  saveState,
  checkTarget,
  formatChangeReport,
  type CheckResult,
} from "../src/lib/sources/monitor";
import { createGithubIssue } from "../src/lib/sources/github-issue";

const flag = (name: string) => process.argv.includes(`--${name}`);
function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && !process.argv[i + 1]?.startsWith("--") ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const dryRun = flag("dry-run");
  const wantIssue = flag("github-issue");
  const reportFile = arg("report");

  const targets = collectWatchTargets();
  if (targets.length === 0) {
    console.error("監視対象が0件です（published な subsidy 記事の sourceLinks を確認）");
    process.exitCode = 1;
    return;
  }

  const state = loadState();
  console.log(`監視 ${targets.length}件（published subsidy 記事の一次情報）${dryRun ? " (dry-run)" : ""}\n`);

  const results: CheckResult[] = [];
  for (const t of targets) {
    process.stdout.write(`  ${t.articleHref} … `);
    const r = await checkTarget(t, state, { dryRun });
    results.push(r);
    const mark = { initialized: "初期化", unchanged: "変更なし", changed: "★変更", error: "✖ エラー" }[r.status];
    console.log(mark + (r.error ? `: ${r.error.split("\n")[0]}` : ""));
  }

  if (!dryRun) saveState(state);

  const changed = results.filter((r) => r.status === "changed");
  const errors = results.filter((r) => r.status === "error");
  const initialized = results.filter((r) => r.status === "initialized");

  const reportParts: string[] = [];
  if (changed.length > 0) {
    reportParts.push(`# 一次情報の変更検知 ${changed.length}件 (${new Date().toISOString().slice(0, 10)})`, "");
    for (const r of changed) reportParts.push(formatChangeReport(r), "", "---", "");
  }
  const report = reportParts.join("\n");

  console.log("");
  if (initialized.length > 0) console.log(`初期化完了: ${initialized.length}件（ベースライン記録）`);
  if (errors.length > 0) {
    console.log(`\nエラー ${errors.length}件:`);
    for (const r of errors) console.log(`  ✖ ${r.target.articleHref}: ${r.error}`);
  }
  console.log(`\n変更検知: ${changed.length}件`);
  if (report) console.log(`\n${report}`);
  if (reportFile) fs.writeFileSync(reportFile, report, "utf-8");

  if (wantIssue && changed.length > 0) {
    const res = createGithubIssue({
      title: `[新着キャッチ] 一次情報の変更 ${changed.length}件 (${new Date().toISOString().slice(0, 10)})`,
      body: report,
      labels: ["content-opportunity", "priority:P1"],
    });
    console.log(res.ok ? `\nIssue 作成: ${res.url}` : `\n✖ Issue 作成失敗: ${res.error}`);
  }

  // エラーが対象の半数を超えたら異常（サイト構造の一斉変更・ネットワーク障害を疑う）
  if (errors.length > targets.length / 2) process.exitCode = 1;
}

main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
