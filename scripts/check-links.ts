/**
 * legalBasis URL 생존 확인 (一次情報 링크 절단 감시)
 *   - published 기사에서 죽은 링크 발견 시 exit 1
 *   - draft/review 기사는 경고만
 *
 * 사용: npm run check:links
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

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

interface Target {
  file: string;
  status: string;
  label: string;
  url: string;
}

const targets: Target[] = [];
for (const file of walk(CONTENT_DIR)) {
  const { data } = matter(fs.readFileSync(file, "utf-8"));
  const rel = path.relative(CONTENT_DIR, file);
  for (const basis of data.legalBasis ?? []) {
    targets.push({
      file: rel,
      status: data.status ?? "draft",
      label: basis.label,
      url: basis.url,
    });
  }
}

async function checkUrl(url: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "user-agent": "gyosei-times-link-checker/1.0" },
    });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}

let publishedDead = 0;
for (const t of targets) {
  const result = await checkUrl(t.url);
  const mark = result.ok ? "✔" : "✖";
  console.log(`${mark} [${t.status}] ${t.file} — ${t.label} (${result.detail})`);
  if (!result.ok && t.status === "published") publishedDead++;
}

console.log(`\n확인 완료: ${targets.length}건 / published 기사의 죽은 링크 ${publishedDead}건`);
if (publishedDead > 0) process.exit(1);
