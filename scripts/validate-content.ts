/**
 * 전 기사 frontmatter 검증 (품질 게이트 — CI에서 실행)
 *   - zod 스키마 검증 (draft 포함 전수)
 *   - slug ↔ 파일명 일치
 *   - category ↔ 디렉토리 일치 (guide/practice)
 *   - 경고: 타이틀 32자 초과 / FAQ 3건 미만 (docs/04 §4)
 *   - 경고: published 기사의 OG 이미지 파일 부재 (`npm run og` 실행 누락 검출)
 *
 * 사용: npm run validate:content
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { articleFrontmatterSchema } from "../src/lib/content-schema";

const CONTENT_DIR = path.join(process.cwd(), "content");
const SECTIONS = ["news", "guide", "practice", "exam"];

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

let errors = 0;
let warnings = 0;
const files = walk(CONTENT_DIR).filter((f) => {
  const rel = path.relative(CONTENT_DIR, f).split(path.sep);
  return SECTIONS.includes(rel[0]);
});

for (const file of files) {
  const rel = path.relative(CONTENT_DIR, file);
  const relParts = rel.split(path.sep);
  const { data } = matter(fs.readFileSync(file, "utf-8"));
  const parsed = articleFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    errors++;
    console.error(`✖ ${rel}`);
    for (const issue of parsed.error.issues) {
      console.error(`    ${issue.path.join(".")}: ${issue.message}`);
    }
    continue;
  }

  const fm = parsed.data;
  const fileSlug = path.basename(file, ".mdx");
  if (fm.slug !== fileSlug) {
    errors++;
    console.error(`✖ ${rel}: slug「${fm.slug}」≠ 파일명「${fileSlug}」`);
  }
  if (relParts.length >= 3 && fm.category !== relParts[1]) {
    errors++;
    console.error(`✖ ${rel}: category「${fm.category}」≠ 디렉토리「${relParts[1]}」`);
  }
  if (fm.title.length > 32) {
    warnings++;
    console.warn(`⚠ ${rel}: 타이틀 ${fm.title.length}자 (권장 32자 이내 — 검색결과 절단)`);
  }
  if (fm.faq.length < 3) {
    warnings++;
    console.warn(`⚠ ${rel}: FAQ ${fm.faq.length}건 (GEO 대응으로 3건 이상 권장)`);
  }
  // published 기사의 OG 이미지 실재 확인 (frontmatter 지정분 또는 생성분 /og/{slug}.png)
  if (fm.status === "published") {
    const ogPath = fm.ogImage ?? `/og/${fm.slug}.png`;
    if (!fs.existsSync(path.join(process.cwd(), "public", ogPath))) {
      warnings++;
      console.warn(`⚠ ${rel}: OG 이미지 없음 (${ogPath}) — \`npm run og\` 실행 필요`);
    }
  }
}

console.log(
  `\n검증 완료: ${files.length}건 / 오류 ${errors}건 / 경고 ${warnings}건`
);
if (errors > 0) process.exit(1);
