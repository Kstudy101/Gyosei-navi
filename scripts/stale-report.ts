/**
 * 6개월(183일) 미갱신 기사 리포트 + 募集期限 경과 점검 v2 (콘텐츠 부패 방지 — docs/04 §6)
 *
 * v1은 별도 締切 마스터(src/config/deadlines.ts)를 뒀지만, v2는 마감일이
 * frontmatter의 subsidy.periodEnd 필드에 이미 있으므로 별도 마스터 없이
 * 기사 자체를 스캔해서 판정한다.
 *
 * 사용: npm run stale
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const STALE_DAYS = 183;

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".mdx") && !entry.name.startsWith("_")) out.push(full);
  }
  return out;
}

const now = Date.now();
const stale: { file: string; updatedAt: string; days: number }[] = [];
const expiredDeadline: { file: string; periodEnd: string; days: number }[] = [];

for (const file of walk(CONTENT_DIR)) {
  const { data } = matter(fs.readFileSync(file, "utf-8"));
  if (data.status !== "published") continue;
  const rel = path.relative(CONTENT_DIR, file);

  const updated = new Date(data.updatedAt).getTime();
  const days = Math.floor((now - updated) / 86_400_000);
  if (days >= STALE_DAYS) {
    stale.push({ file: rel, updatedAt: data.updatedAt, days });
  }

  const periodEnd: string | undefined = data.subsidy?.periodEnd;
  if (periodEnd && data.subsidy?.status === "open") {
    const end = new Date(periodEnd).getTime();
    const daysOver = Math.floor((now - end) / 86_400_000);
    if (daysOver > 0) {
      expiredDeadline.push({ file: rel, periodEnd, days: daysOver });
    }
  }
}

if (stale.length === 0) {
  console.log("6개월 미갱신 기사 없음 ✔");
} else {
  console.log(`리뷰 큐 (${stale.length}건):`);
  for (const s of stale.sort((a, b) => b.days - a.days)) {
    console.log(`  ${s.days}일 경과 — ${s.file} (최종 갱신 ${s.updatedAt})`);
  }
}

console.log("");
if (expiredDeadline.length === 0) {
  console.log("募集期限 경과 건 없음 ✔");
} else {
  console.log(`❗ subsidy.status가 "open"인데 periodEnd가 지난 기사 (${expiredDeadline.length}건) — status를 closed로 갱신할 것:`);
  for (const e of expiredDeadline.sort((a, b) => b.days - a.days)) {
    console.log(`  ${e.days}일 경과 — ${e.file} (期限 ${e.periodEnd})`);
  }
}
