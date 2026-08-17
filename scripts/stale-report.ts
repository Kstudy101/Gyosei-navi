/**
 * 6개월(183일) 미갱신 기사 리포트 (콘텐츠 부패 방지 — docs/05 갱신 정책)
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
