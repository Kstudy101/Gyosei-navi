/**
 * 地自治体 一次情報 変更検知（新着キャッチ）CLI
 *   npm run watch:municipalities                     # 記事由来の対象(全件) + 市区町村トップページ(今日の曜日分)
 *   npm run watch:municipalities -- --dry-run         # 状態ファイルを更新せず確認のみ
 *   npm run watch:municipalities -- --github-issue    # 変更があれば Issue 起票（一括1件）
 *   npm run watch:municipalities -- --report out.md
 *   npm run watch:municipalities -- --skip-municipalities  # 記事由来の対象のみ（市区町村トップページを含めない）
 *   npm run watch:municipalities -- --filter-relevance     # 市区町村トップページの変更を TypeSafe で絞り込む
 *
 * 市区町村トップページ（1,718件、data/watch/README.md 参照）は全件を毎日回すと
 * 30分近くかかるため、曜日で7分割してその日の分だけをチェックする
 * （src/lib/sources/monitor.ts の partitionByWeekday）。
 */
import fs from "node:fs";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import {
  collectArticleWatchTargets,
  collectMunicipalityWatchTargets,
  partitionByWeekday,
  loadState,
  saveState,
  checkTarget,
  formatChangeReport,
  type CheckResult,
  type WatchTarget,
} from "../src/lib/sources/monitor";
import { createGithubIssue } from "../src/lib/sources/github-issue";
import { judgeRelevance, RELEVANCE_THRESHOLD } from "../src/lib/sources/relevance";

const flag = (name: string) => process.argv.includes(`--${name}`);
function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && !process.argv[i + 1]?.startsWith("--") ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const dryRun = flag("dry-run");
  const wantIssue = flag("github-issue");
  const reportFile = arg("report");
  const skipMunicipalities = flag("skip-municipalities");
  const filterRelevance = flag("filter-relevance");
  const weekdayOverride = arg("weekday");
  const weekday = weekdayOverride !== undefined ? Number(weekdayOverride) : new Date().getDay();

  const articleTargets = collectArticleWatchTargets();
  const municipalityTargets = skipMunicipalities
    ? []
    : partitionByWeekday(collectMunicipalityWatchTargets(), weekday);
  const targets: WatchTarget[] = [...articleTargets, ...municipalityTargets];

  if (targets.length === 0) {
    console.error("監視対象が0件です（published な subsidy 記事の sourceLinks を確認）");
    process.exitCode = 1;
    return;
  }

  const state = loadState();
  console.log(
    `監視 ${targets.length}件（記事由来 ${articleTargets.length} / 市区町村トップページ ${municipalityTargets.length}、曜日区分${weekday}）${dryRun ? " (dry-run)" : ""}\n`
  );

  const results: CheckResult[] = [];
  for (const t of targets) {
    process.stdout.write(`  ${t.label} … `);
    const r = await checkTarget(t, state, { dryRun });
    results.push(r);
    const mark = { initialized: "初期化", unchanged: "変更なし", changed: "★変更", error: "✖ エラー" }[r.status];
    console.log(mark + (r.error ? `: ${r.error.split("\n")[0]}` : ""));
  }

  if (!dryRun) saveState(state);

  const changed = results.filter((r) => r.status === "changed");
  const errors = results.filter((r) => r.status === "error");
  const initialized = results.filter((r) => r.status === "initialized");

  // 記事由来の対象は補助金ページと分かっているので判定しない。トップページのみ絞り込む。
  let reportable = changed;
  let filteredOut = 0;
  if (filterRelevance && changed.length > 0) {
    const client = new TypeSafeClient();
    reportable = [];
    console.log("\n補助金関連度の判定:");
    for (const r of changed) {
      if (r.target.articleHref) {
        reportable.push(r);
        continue;
      }
      const v = await judgeRelevance(client, r);
      const keep = v.probability >= RELEVANCE_THRESHOLD;
      console.log(
        `  ${keep ? "○" : "×"} ${r.target.label}: ${v.probability.toFixed(2)}${v.error ? ` (判定不可: ${v.error})` : ""}`
      );
      if (keep) reportable.push(r);
      else filteredOut++;
    }
  }

  const reportParts: string[] = [];
  if (reportable.length > 0) {
    reportParts.push(`# 一次情報の変更検知 ${reportable.length}件 (${new Date().toISOString().slice(0, 10)})`, "");
    for (const r of reportable) reportParts.push(formatChangeReport(r), "", "---", "");
  }
  const report = reportParts.join("\n");

  console.log("");
  if (initialized.length > 0) console.log(`初期化完了: ${initialized.length}件（ベースライン記録）`);
  if (errors.length > 0) {
    console.log(`\nエラー ${errors.length}件:`);
    for (const r of errors) console.log(`  ✖ ${r.target.label}: ${r.error}`);
  }
  console.log(`\n変更検知: ${changed.length}件` + (filteredOut > 0 ? `（補助金と無関係 ${filteredOut}件を除外）` : ""));
  if (report) console.log(`\n${report}`);
  if (reportFile) fs.writeFileSync(reportFile, report, "utf-8");

  if (wantIssue && reportable.length > 0) {
    const res = createGithubIssue({
      title: `[新着キャッチ] 一次情報の変更 ${reportable.length}件 (${new Date().toISOString().slice(0, 10)})`,
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
