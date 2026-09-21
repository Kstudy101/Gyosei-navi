/**
 * published 기사 메타데이터를 Supabase(gyosei_articles)에 업서트
 *
 * 콘텐츠 정본은 content/*.mdx다(AGENTS.md 코드 정본 표). 이 스크립트는
 * export-articles-for-seo.ts가 뽑은 메타데이터를 SEO Engine이 조회할 수 있도록
 * 복사해 넣을 뿐이며, MDX를 수정하지 않는다.
 *
 * 로컬에 없는 slug는 지우지 않는다(업서트 전용) — 파싱 실패 한 건이
 * 대량 삭제로 이어지는 사고를 막기 위함.
 *
 * 사용:
 *   npm run sync:supabase                        # 전체 published 기사 업서트
 *   npm run sync:supabase -- --dry-run           # 전송 없이 대상 건수만 출력
 *   npm run sync:supabase -- --slugs a,b         # 지정 slug만 업서트
 *
 * 사전: .env.local 에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";

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
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const dryRun = process.argv.includes("--dry-run");
const slugsArg = arg("slugs");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dryRun && (!SUPABASE_URL || !SERVICE_ROLE_KEY)) {
  console.error("에러: .env.local에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  process.exit(1);
}

interface ExportedArticle {
  slug: string;
  section: string;
  category: string | null;
  title: string;
  description: string;
  targetKeywords: string[];
  sourceLinks: { label: string; url: string; accessedAt: string }[];
  publishedAt: string;
  updatedAt: string;
  href: string;
  compareTargets?: string[];
}

/** export 스크립트를 그대로 재사용해 메타데이터를 얻는다(파싱 로직 이중화 방지) */
function loadArticles(): ExportedArticle[] {
  const tmp = path.join(os.tmpdir(), `gyosei-sync-${process.pid}.json`);
  try {
    execFileSync(
      process.execPath,
      ["--import", "tsx", path.join(process.cwd(), "scripts", "export-articles-for-seo.ts"), "--out", tmp],
      { stdio: ["ignore", "inherit", "inherit"] },
    );
    return JSON.parse(fs.readFileSync(tmp, "utf-8"));
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

function toRow(a: ExportedArticle) {
  return {
    slug: a.slug,
    section: a.section,
    category: a.category,
    title: a.title,
    description: a.description,
    target_keywords: a.targetKeywords,
    source_links: a.sourceLinks,
    published_at: a.publishedAt,
    updated_at: a.updatedAt,
    href: a.href,
    compare_targets: a.compareTargets ?? null,
    synced_at: new Date().toISOString(),
  };
}

async function upsert(rows: ReturnType<typeof toRow>[]): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/gyosei_articles?on_conflict=slug`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    throw new Error(`업서트 실패 (HTTP ${res.status}): ${await res.text()}`);
  }
}

async function main(): Promise<void> {
  let articles = loadArticles();

  if (slugsArg) {
    const filter = new Set(slugsArg.split(",").map((s) => s.trim()));
    articles = articles.filter((a) => filter.has(a.slug));
    const missing = [...filter].filter((s) => !articles.some((a) => a.slug === s));
    if (missing.length > 0) {
      console.error(`경고: 다음 slug는 published 기사에서 찾지 못했습니다: ${missing.join(", ")}`);
    }
  }

  if (articles.length === 0) {
    console.log("업서트할 published 기사가 없습니다.");
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] ${articles.length}건 업서트 예정`);
    for (const a of articles.slice(0, 10)) console.log(`  ${a.slug} — ${a.title}`);
    if (articles.length > 10) console.log(`  … 외 ${articles.length - 10}건`);
    return;
  }

  // PostgREST 페이로드 크기를 고려해 분할 전송
  const CHUNK = 100;
  for (let i = 0; i < articles.length; i += CHUNK) {
    const chunk = articles.slice(i, i + CHUNK).map(toRow);
    await upsert(chunk);
    console.error(`  ${Math.min(i + CHUNK, articles.length)}/${articles.length} 업서트 완료`);
  }
  console.log(`${articles.length}건 Supabase 동기화 완료`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
