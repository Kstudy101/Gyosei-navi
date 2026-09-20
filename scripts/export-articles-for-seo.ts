/**
 * published 기사 메타데이터를 JSON으로 export — SEO Engine(Supabase) 동기화 및
 * 2차 가공 기사 생성용
 *
 * gyosei-navi 콘텐츠 정본은 여전히 content/*.mdx (AGENTS.md 코드 정본 표).
 * 이 스크립트는 검색·매칭에 필요한 메타데이터만 뽑아내는 읽기 전용 도구이며,
 * MDX 파일이나 SEO Engine DB를 직접 쓰지 않는다.
 *
 * getAllArticles()(src/lib/content.ts)를 쓰지 않고 파일을 직접 순회한다 — 그쪽은
 * 전체 기사를 한 번에 zod 검증하므로, 다른 진행 중인 작업이 만든 미완성 기사
 * (예: subsidy 필드 누락) 하나 때문에 이 export 전체가 막히는 걸 피하기 위함.
 * 파싱 실패한 개별 파일은 경고만 남기고 건너뛴다.
 *
 * 사용:
 *   npm run export:articles-for-seo -- --out /tmp/articles.json
 *     → 전체 published 기사의 검색용 메타데이터(제목·설명·키워드) — Supabase 동기화용
 *   npm run export:articles-for-seo -- --slugs setagaya-shussan-kyufu,shibuya-happy-mother --out /tmp/detail.json
 *     → 지정한 slug만, subsidy 필드(amount/eligibility/applyUrl 등 구조화된 수치)까지 포함
 *       — 2차 가공 기사를 쓰는 마케팅 에이전트가 참조할 "원문 대조 완료" 재료
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { articleFrontmatterSchema } from "../src/lib/content-schema";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
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
  /** section === "compare" 기사만 값을 가짐. 2차가공 기사가 기존 compare와 소재 중복인지 판별하는 데 쓴다. */
  compareTargets?: string[];
  subsidy?: {
    regionCode: string;
    regionLabel: string;
    provider: string;
    amount?: string;
    periodStart?: string;
    periodEnd?: string;
    status: string;
    applyUrl: string;
    eligibility?: string;
    verifiedAt: string;
  };
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const SECTIONS = ["subsidy", "compare", "tokushu", "news"];

function walkMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMdxFiles(full));
    else if (entry.name.endsWith(".mdx") && !entry.name.startsWith("_")) out.push(full);
  }
  return out;
}

const outPath = arg("out");
const slugsArg = arg("slugs");
const slugFilter = slugsArg ? new Set(slugsArg.split(",").map((s) => s.trim())) : null;

const articles: ExportedArticle[] = [];
const foundSlugs = new Set<string>();

for (const filePath of walkMdxFiles(CONTENT_DIR)) {
  const rel = path.relative(CONTENT_DIR, filePath).split(path.sep);
  const section = rel[0];
  if (!SECTIONS.includes(section)) continue;
  const hasCategory = section === "subsidy" || section === "tokushu";
  const category = hasCategory && rel.length >= 3 ? rel[1] : null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const parsed = articleFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    console.error(`경고: frontmatter 검증 실패로 건너뜀 — ${filePath}`);
    continue;
  }
  const fm = parsed.data;
  if (fm.status !== "published") continue;
  if (slugFilter && !slugFilter.has(fm.slug)) continue;

  foundSlugs.add(fm.slug);
  const href = category !== null ? `/${section}/${category}/${fm.slug}` : `/${section}/${fm.slug}`;

  articles.push({
    slug: fm.slug,
    section,
    category,
    title: fm.title,
    description: fm.description,
    targetKeywords: fm.targetKeywords,
    sourceLinks: fm.sourceLinks,
    publishedAt: fm.publishedAt,
    updatedAt: fm.updatedAt,
    href,
    ...(section === "compare" ? { compareTargets: fm.compareTargets } : {}),
    ...(slugFilter && fm.subsidy ? { subsidy: fm.subsidy } : {}),
  });
}

if (slugFilter) {
  const missing = [...slugFilter].filter((s) => !foundSlugs.has(s));
  if (missing.length > 0) {
    console.error(`경고: 다음 slug는 published 기사에서 찾지 못했습니다: ${missing.join(", ")}`);
  }
}

const json = JSON.stringify(articles, null, 2);

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, json, "utf-8");
  console.error(`${articles.length}건 export 완료: ${outPath}`);
} else {
  console.log(json);
}
