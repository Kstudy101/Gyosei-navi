/**
 * 템플릿에서 신규 기사 생성
 * 사용: npm run new:article -- --section guide --category nyukan --slug my-article --type cluster
 *   - section: news | guide | practice | exam (기본 guide)
 *   - guide/practice는 --category 필수
 */
import fs from "node:fs";
import path from "node:path";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const section = arg("section") ?? "guide";
const category = arg("category");
const slug = arg("slug");
const type = arg("type") ?? "cluster";

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("--slug 필수 (영소문자·숫자·하이픈만). 예: --slug eiju-nenshu-yoken");
  process.exit(1);
}
if ((section === "guide" || section === "practice") && !category) {
  console.error(`--category 필수 (section=${section})`);
  process.exit(1);
}

const dir =
  category !== undefined
    ? path.join("content", section, category)
    : path.join("content", section);
const target = path.join(dir, `${slug}.mdx`);

if (fs.existsSync(target)) {
  console.error(`이미 존재: ${target}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
let template = fs.readFileSync(path.join("content", "_TEMPLATE.mdx"), "utf-8");
template = template
  .replace('slug: "kebab-case-romaji-slug"', `slug: "${slug}"`)
  .replace('category: "nyukan"', `category: "${category ?? "nyukan"}"`)
  .replace('type: "cluster"', `type: "${type}"`)
  .replace(/publishedAt: "\d{4}-\d{2}-\d{2}"/, `publishedAt: "${today}"`)
  .replace(/updatedAt: "\d{4}-\d{2}-\d{2}"/, `updatedAt: "${today}"`)
  .replace(/accessedAt: "\d{4}-\d{2}-\d{2}"/, `accessedAt: "${today}"`)
  .replace('ogImage: "/og/kebab-case-romaji-slug.png"', `ogImage: "/og/${slug}.png"`)
  .replace(/date: "\d{4}-\d{2}-\d{2}"\n    note: "初版公開"/, `date: "${today}"\n    note: "初版公開"`);

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(target, template, "utf-8");
console.log(`생성 완료: ${target}`);
console.log("다음 단계: title/description/legalBasis 작성 → 집필 → 검수 → status: published");
