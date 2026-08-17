/**
 * e-Stat 통계 취득 CLI (TASK-05)
 *   npm run stats -- --search "在留外国人"          # 통계표 검색
 *   npm run stats -- --id 0003449073                # 데이터 취득 → data/stats/ 저장
 *   npm run stats -- --id 0003449073 --cdTime 2024000000   # 추가 필터 (e-Stat 파라미터 그대로)
 * 사전: .env.local 에 ESTAT_APP_ID
 */
import fs from "node:fs";
import path from "node:path";
import { searchStats, getStatsData, saveStats } from "../src/lib/sources/estat";

// .env.local 로드 (dotenv 미사용 — 의존 최소화)
const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && !process.argv[i + 1]?.startsWith("--") ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const search = arg("search");
  const id = arg("id");

  if (search) {
    const list = await searchStats({ searchWord: search });
    if (list.length === 0) {
      console.log(`「${search}」에 해당하는 통계표가 없습니다.`);
      return;
    }
    console.log(`「${search}」 ${list.length}건\n`);
    for (const t of list) {
      console.log(`${t.statsDataId}  ${t.statName} / ${t.title}`);
      console.log(`    ${t.govOrg} / 調査 ${t.surveyDate} / 公開 ${t.openDate}`);
    }
    return;
  }

  if (id) {
    const extra: Record<string, string> = {};
    for (const k of ["cdTime", "cdArea", "cdCat01", "cdCat02", "cdTab", "lvTime", "lvArea", "limit"]) {
      const v = arg(k);
      if (v) extra[k] = v;
    }
    const result = await getStatsData(id, extra);
    const { dataFile, metaFile } = saveStats(result);
    console.log(`${result.meta.statName} / ${result.meta.title}`);
    console.log(`  ${result.values.length}건 → ${path.relative(process.cwd(), dataFile)}`);
    console.log(`  출처 메타 → ${path.relative(process.cwd(), metaFile)}`);
    return;
  }

  console.error("사용법: npm run stats -- --search <語> | --id <statsDataId> [--cdTime …]");
  process.exitCode = 1;
}

main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
