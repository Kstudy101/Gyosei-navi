/**
 * パブリックコメント 신착 감시 CLI (TASK-03)
 *   npm run pubcomment                       # RSS + 목록 3페이지, 키워드 필터, 신규만 출력
 *   npm run pubcomment -- --pages 8          # 목록 순회 페이지 수 (기본 3)
 *   npm run pubcomment -- --all              # 키워드 무시하고 전 안건
 *   npm run pubcomment -- --dry-run          # seen 갱신 없이
 *   npm run pubcomment -- --github-issue     # 신규 안건 있으면 Issue 기표 (건별)
 *   npm run pubcomment -- --report out.md
 */
import fs from "node:fs";
import {
  DEFAULT_KEYWORDS,
  fetchRss,
  fetchListPages,
  loadSeen,
  saveSeen,
  matchKeywords,
  daysUntil,
  formatItem,
  opportunity,
  type PubComment,
} from "../src/lib/sources/pubcomment";
import { createGithubIssue } from "../src/lib/sources/github-issue";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && !process.argv[i + 1]?.startsWith("--") ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

async function main(): Promise<void> {
  const dryRun = flag("dry-run");
  const all = flag("all");
  const pages = Number(arg("pages") ?? "3");
  const reportFile = arg("report");
  const wantIssue = flag("github-issue");

  const seen = loadSeen();
  const firstRun = Object.keys(seen).length === 0;

  // 1) RSS (실패 = 전체 실패. 사이트 구조 변경을 놓치지 않기 위해)
  const rss = await fetchRss();
  // 2) 목록 백필
  const list = await fetchListPages(pages);

  const merged = new Map<string, PubComment>();
  for (const c of [...rss, ...list]) if (!merged.has(c.id)) merged.set(c.id, c);
  const candidates = [...merged.values()];

  const matched = candidates
    .map((c) => ({ c, kws: all ? [] : matchKeywords(c, DEFAULT_KEYWORDS) }))
    .filter(({ kws }) => all || kws.length > 0);

  const fresh = matched.filter(({ c }) => !seen[c.id]);
  fresh.sort((a, b) => daysUntil(a.c.deadline) - daysUntil(b.c.deadline));

  const now = new Date().toISOString();
  if (!dryRun) {
    for (const { c } of matched) {
      if (!seen[c.id]) seen[c.id] = { title: c.title, deadline: c.deadline, firstSeenAt: now };
    }
    saveSeen(seen);
  }

  const lines: string[] = [];
  lines.push(`取得: RSS ${rss.length}件 + 一覧 ${list.length}件 → 重複除去 ${candidates.length}件 / キーワード一致 ${matched.length}件`);
  if (firstRun) lines.push(`（初回実行: 既知案件として ${matched.length}件を記録${dryRun ? "予定 (dry-run)" : ""}）`);
  lines.push("");

  if (fresh.length === 0) {
    lines.push("🆕 新規案件なし");
  } else {
    lines.push(`🆕 新規パブリックコメント ${fresh.length}件`, "");
    const urgent = fresh.filter(({ c }) => daysUntil(c.deadline) <= 7);
    const normal = fresh.filter(({ c }) => daysUntil(c.deadline) > 7);
    if (urgent.length > 0) {
      lines.push(`★ 緊急 (締切 D-7 以内) ${urgent.length}件`);
      for (const { c, kws } of urgent) lines.push(formatItem(c, kws), "");
    }
    for (const { c, kws } of normal) lines.push(formatItem(c, kws), "");
  }
  const report = lines.join("\n");
  console.log(report);
  if (reportFile) fs.writeFileSync(reportFile, report, "utf-8");

  if (wantIssue && fresh.length > 0 && !firstRun) {
    for (const { c, kws } of fresh) {
      const d = daysUntil(c.deadline);
      const res = createGithubIssue({
        title: `[パブコメ${d <= 7 ? "★緊急" : ""}] ${c.title.slice(0, 80)} (締切 ${c.deadline.slice(0, 10)})`,
        body: formatItem(c, kws),
        labels: ["content-opportunity", `priority:${opportunity(kws) === "高" ? "P0" : "P1"}`],
      });
      console.log(res.ok ? `  Issue 作成: ${res.url}` : `  ✖ Issue 作成失敗: ${res.error}`);
    }
  }
}

main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
