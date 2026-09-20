/**
 * 템플릿에서 신규 기사 생성 v2
 * 사용: npm run new:article -- --section subsidy --category shussan --slug my-article --type cluster
 *   - section: subsidy | compare | news (기본 subsidy)
 *   - subsidy는 --category 필수（docs/01 §3 카테고리 코드）
 */
import fs from "node:fs";
import path from "node:path";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const section = arg("section") ?? "subsidy";
const category = arg("category");
const slug = arg("slug");
const type = arg("type") ?? "cluster";

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("--slug 필수 (영소문자・숫자・하이픈만). 예: --slug shibuya-shussan-oiwaikin");
  process.exit(1);
}
if (section === "subsidy" && !category) {
  console.error("--category 필수 (section=subsidy)");
  process.exit(1);
}

const dir = section === "subsidy" ? path.join("content", section, category!) : path.join("content", section);
const target = path.join(dir, `${slug}.mdx`);

if (fs.existsSync(target)) {
  console.error(`이미 존재: ${target}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
let template = fs.readFileSync(path.join("content", "_TEMPLATE.mdx"), "utf-8");
template = template
  .replace('slug: "kebab-case-slug"', `slug: "${slug}"`)
  .replace('category: "shussan"', `category: "${category ?? "shussan"}"`)
  .replace('type: "cluster"', `type: "${type}"`)
  .replace(/publishedAt: "\d{4}-\d{2}-\d{2}"/, `publishedAt: "${today}"`)
  .replace(/updatedAt: "\d{4}-\d{2}-\d{2}"/, `updatedAt: "${today}"`)
  .replace(/accessedAt: "\d{4}-\d{2}-\d{2}"/, `accessedAt: "${today}"`)
  .replace(/verifiedAt: "\d{4}-\d{2}-\d{2}"/, `verifiedAt: "${today}"`);

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(target, template, "utf-8");
console.log(`생성 완료: ${target}`);
console.log("다음 단계: title/description/sourceLinks/subsidy 필드 작성 → 집필 → 검수 → status: published");
