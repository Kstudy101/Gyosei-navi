/**
 * 官報 일일 아카이빙 CLI (TASK-09)
 *   npm run kanpo                        # 직근 7일분 중 미아카이브 号를 취득 (멱등)
 *   npm run kanpo -- --days 30           # 백필 범위 확장
 *   npm run kanpo -- --date 2026-08-17   # 특정일만
 *   npm run kanpo -- --all               # 색인에 있는 전 기간 (90일)
 *   npm run kanpo -- --manifest new.txt  # 신규 저장한 PDF 경로 목록을 파일로 (CI 업로드용)
 *   npm run kanpo -- --search 育成就労   # 아카이브 텍스트 키워드 검색
 *
 *   ⚠ 발행 후 90일 경과분은 사이트에서 사라진다. 취득 실패는 exit 1 (CI가 Issue 기표).
 */
import fs from "node:fs";
import {
  fetchIssueIndex,
  archiveIssue,
  searchKanpoText,
  type ArchiveResult,
} from "../src/lib/sources/kanpo";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && !process.argv[i + 1]?.startsWith("--") ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

async function main(): Promise<void> {
  const search = arg("search");
  if (search) {
    const hits = searchKanpoText(search);
    if (hits.length === 0) {
      console.log(`「${search}」: 一致なし（アーカイブ済みテキスト内）`);
      return;
    }
    console.log(`「${search}」: ${hits.length}件`);
    for (const h of hits.slice(0, 50)) console.log(`  [${h.file}] ${h.line}`);
    if (hits.length > 50) console.log(`  …他 ${hits.length - 50} 件`);
    return;
  }

  const onlyDate = arg("date");
  const days = flag("all") ? Number.POSITIVE_INFINITY : Number(arg("days") ?? "7");
  const manifestFile = arg("manifest");
  const forcePdf = flag("force-pdf");

  const index = await fetchIssueIndex();
  const dates = [...index.keys()].sort().reverse();
  const targets = onlyDate ? dates.filter((d) => d === onlyDate) : dates.slice(0, days === Number.POSITIVE_INFINITY ? undefined : days);
  if (onlyDate && targets.length === 0) {
    // 休日は発行なし。ただし 90일 창을 벗어난 날짜 지정은 명확히 실패시킨다
    console.error(`指定日 ${onlyDate} は索引にありません（休日で発行なし、または90日の公開期間外）`);
    process.exitCode = 1;
    return;
  }

  console.log(`官報索引: ${dates.length}日分（最新 ${dates[0]}） / 対象 ${targets.length}日分\n`);

  const results: ArchiveResult[] = [];
  for (const date of targets) {
    for (const issue of index.get(date) ?? []) {
      const r = await archiveIssue(issue, { forcePdf });
      results.push(r);
      const mark = { archived: "★取得", skipped: "既存", error: "✖ 失敗" }[r.status];
      console.log(`  ${issue.id} (${issue.typeLabel} ${issue.pageCount ?? "?"}p) … ${mark}${r.error ? `: ${r.error}` : ""}`);
    }
  }

  const archived = results.filter((r) => r.status === "archived");
  const errors = results.filter((r) => r.status === "error");
  console.log(`\n取得 ${archived.length} / 既存 ${results.length - archived.length - errors.length} / 失敗 ${errors.length}`);

  if (manifestFile) {
    // 말미 개행 필수: 없으면 shell 의 `while read` 가 마지막 줄을 버린다 (2026-08-17 실증)
    const list = archived.map((r) => r.pdfFile).filter(Boolean);
    fs.writeFileSync(manifestFile, list.length > 0 ? list.join("\n") + "\n" : "", "utf-8");
  }

  // 실패는 반드시 알림 (AC): 놓친 날은 90일 후 영구 복구 불가
  if (errors.length > 0) {
    console.error(`\n✖ 取得失敗 ${errors.length}件 — 90日以内に再取得しないと永久喪失`);
    process.exitCode = 1;
  }
}

main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
