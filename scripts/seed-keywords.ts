/**
 * 키워드 리서치 대장 초기 생성/갱신 (TASK-07)
 *   npm run keywords:seed
 *   - taxonomy.ts の CATEGORIES[].seedKeywords + 全記事 frontmatter の targetKeywords を data/keywords.csv に追記
 *   - 既存行は上書きしない（volume_est 等の手入力を保護）
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATEGORIES } from "../src/config/taxonomy";

const CSV = path.join(process.cwd(), "data", "keywords.csv");
const HEADER = [
  "keyword", "category", "audience", "volume_est", "difficulty", "intent",
  "competitor_top3", "our_status", "target_slug", "memo", "updated_at",
];

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith(".mdx") && !e.name.startsWith("_")) out.push(full);
  }
  return out;
}

const existing = new Set<string>();
const rows: string[] = [];
if (fs.existsSync(CSV)) {
  const lines = fs.readFileSync(CSV, "utf-8").split(/\r?\n/).filter(Boolean);
  for (const line of lines.slice(1)) {
    rows.push(line);
    const kw = line.match(/^"((?:[^"]|"")*)"|^([^,]*)/);
    existing.add((kw?.[1]?.replace(/""/g, '"') ?? kw?.[2] ?? "").trim());
  }
}

const today = new Date().toISOString().slice(0, 10);
let added = 0;
const add = (kw: string, category: string, audience: string, status: string, slug: string, memo: string) => {
  if (!kw || existing.has(kw)) return;
  existing.add(kw);
  rows.push([kw, category, audience, "", "", "", "", status, slug, memo, today].map(csvEscape).join(","));
  added++;
};

for (const c of CATEGORIES) {
  for (const kw of c.seedKeywords) add(kw, c.code, "for-individual", "idea", "", `taxonomy seed (${c.priority})`);
}
for (const file of walk(path.join(process.cwd(), "content"))) {
  const { data } = matter(fs.readFileSync(file, "utf-8"));
  const kws: string[] = Array.isArray(data.targetKeywords) ? data.targetKeywords : [];
  const audience: string = Array.isArray(data.audience) ? data.audience.join("|") : "";
  for (const kw of kws) add(kw, String(data.category ?? ""), audience, data.status === "published" ? "published" : "drafted", String(data.slug ?? ""), "article targetKeywords");
}

fs.mkdirSync(path.dirname(CSV), { recursive: true });
fs.writeFileSync(CSV, "﻿" + [HEADER.join(","), ...rows].join("\n") + "\n", "utf-8");
console.log(`data/keywords.csv: ${rows.length}행 (신규 ${added})`);
