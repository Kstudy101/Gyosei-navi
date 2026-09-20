/**
 * content/ranking/ frontmatter 検証（CI 用）
 * 사용: npm run validate:ranking
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { rankingFrontmatterSchema } from "../src/lib/ranking-schema";

const RANKING_DIR = path.join(process.cwd(), "content", "ranking");

let errors = 0;
const files = fs.existsSync(RANKING_DIR)
  ? fs.readdirSync(RANKING_DIR).filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
  : [];

for (const file of files) {
  const full = path.join(RANKING_DIR, file);
  const { data } = matter(fs.readFileSync(full, "utf-8"));
  const parsed = rankingFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    errors++;
    console.error(`✖ ranking/${file}`);
    for (const issue of parsed.error.issues) {
      console.error(`    ${issue.path.join(".")}: ${issue.message}`);
    }
    continue;
  }

  const fileSlug = path.basename(file, ".mdx");
  if (parsed.data.slug !== fileSlug) {
    errors++;
    console.error(`✖ ranking/${file}: slug「${parsed.data.slug}」≠ 파일명「${fileSlug}」`);
  }
}

console.log(`\n検証完了: ${files.length}件 / エラー ${errors}件`);
if (errors > 0) process.exit(1);
