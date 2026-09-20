/**
 * published 기사 메타데이터를 JSON으로 export — SEO Engine(Supabase) 동기화용
 *
 * gyosei-navi 콘텐츠 정본은 여전히 content/*.mdx (AGENTS.md 코드 정본 표).
 * 이 스크립트는 검색·매칭에 필요한 메타데이터만 뽑아내는 읽기 전용 도구이며,
 * MDX 파일이나 SEO Engine DB를 직접 쓰지 않는다 — 동기화는 SEO Engine 쪽
 * (gyosei-navi-seo-engine)의 CLI가 이 JSON을 표준입력/파일로 받아 처리한다.
 *
 * 사용: npm run export:articles-for-seo -- --out /tmp/articles.json
 */
import fs from "node:fs";
import path from "node:path";
import { getAllArticles } from "../src/lib/content";

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
}

const outPath = arg("out");

const articles = getAllArticles()
  .filter((a) => a.frontmatter.status === "published")
  .map(
    (a): ExportedArticle => ({
      slug: a.frontmatter.slug,
      section: a.section,
      category: a.category,
      title: a.frontmatter.title,
      description: a.frontmatter.description,
      targetKeywords: a.frontmatter.targetKeywords,
      sourceLinks: a.frontmatter.sourceLinks,
      publishedAt: a.frontmatter.publishedAt,
      updatedAt: a.frontmatter.updatedAt,
      href: a.href,
    })
  );

const json = JSON.stringify(articles, null, 2);

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, json, "utf-8");
  console.error(`${articles.length}건 export 완료: ${outPath}`);
} else {
  console.log(json);
}
