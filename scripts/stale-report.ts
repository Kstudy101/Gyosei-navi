/**
 * 6개월(183일) 미갱신 기사 리포트 + 締切 마스터 점검 (콘텐츠 부패 방지 — docs/05 갱신 정책)
 * 사용: npm run stale
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { DEADLINES } from "../src/config/deadlines";
import { resolveDeadlineState } from "../src/lib/deadline";

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

for (const file of walk(CONTENT_DIR)) {
  const { data } = matter(fs.readFileSync(file, "utf-8"));
  if (data.status !== "published") continue;
  const updated = new Date(data.updatedAt).getTime();
  const days = Math.floor((now - updated) / 86_400_000);
  if (days >= STALE_DAYS) {
    stale.push({ file: path.relative(CONTENT_DIR, file), updatedAt: data.updatedAt, days });
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

/* ------------------------------------------------------------------ */
/* 締切 마스터 (src/config/deadlines.ts) 점검                            */
/* 화면 표시는 DeadlineCountdown이 자동으로 「受付終了」로 바뀌므로 오보는   */
/* 나지 않는다. 다만 「다음 회차로 갱신」은 사람이 해야 하므로 여기서 알린다. */
/* ------------------------------------------------------------------ */

const at = new Date(now);
const closedList: string[] = [];
const urgentList: string[] = [];

for (const [id, deadline] of Object.entries(DEADLINES)) {
  const state = resolveDeadlineState(deadline, at);
  if (state.phase === "closed") {
    closedList.push(`  ${id} — ${deadline.dueLabel} (${-state.daysLeft}일 경과)`);
  } else if (state.urgency === "urgent") {
    const left = state.phase === "today" ? "오늘 마감" : `D-${state.daysLeft}`;
    urgentList.push(`  ${id} — ${deadline.dueLabel} (${left})`);
  }
}

console.log("");
if (urgentList.length > 0) {
  console.log(`⏰ 마감 임박 (D-7 이내, ${urgentList.length}건):`);
  for (const line of urgentList) console.log(line);
}
if (closedList.length > 0) {
  console.log(`❗ 마감 경과 — 기사를 다음 회차/결과공시로 갱신할 것 (${closedList.length}건):`);
  for (const line of closedList) console.log(line);
}
if (urgentList.length === 0 && closedList.length === 0) {
  console.log("締切 마스터: 임박·경과 건 없음 ✔");
}
