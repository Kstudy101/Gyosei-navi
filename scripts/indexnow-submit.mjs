/**
 * IndexNow 제출 (배포 후 실행 — deploy-xserver.yml)
 *   - 인자로 받은 변경 파일 목록(content/, content-i18n/ 의 .mdx)을 기사 URL로 변환해
 *     api.indexnow.org 에 제출한다 (Bing 등 IndexNow 지원 검색엔진의 인덱싱 가속).
 *   - published 기사만 제출한다 (frontmatter status 검사).
 *   - 키 파일: public/<KEY>.txt (공개 파일 — 비밀 아님, IndexNow 프로토콜 사양)
 *
 * 사용: node scripts/indexnow-submit.mjs <changed-file>...
 *       (파일 목록이 비어 있으면 아무것도 하지 않고 정상 종료)
 */
import fs from "node:fs";

const HOST = "gyosei-navi.jp";
const KEY = "8715a12fe40fbffa38b3bacf8630dd60";
const MAX_URLS = 500;

function toUrl(file) {
  const p = file.replace(/\\/g, "/");
  let m;
  // content/subsidy/<cat>/<slug>.mdx, content/tokushu/<cat>/<slug>.mdx
  if ((m = p.match(/^content\/(subsidy|tokushu)\/([^/]+)\/([^/]+)\.mdx$/)))
    return `https://${HOST}/${m[1]}/${m[2]}/${m[3]}/`;
  // content/compare/<slug>.mdx, content/news/<slug>.mdx, content/ranking/<slug>.mdx
  if ((m = p.match(/^content\/(compare|news|ranking)\/([^/]+)\.mdx$/)))
    return `https://${HOST}/${m[1]}/${m[2]}/`;
  // content-i18n/<locale>/subsidy/<cat>/<slug>.mdx
  if ((m = p.match(/^content-i18n\/([^/]+)\/subsidy\/([^/]+)\/([^/]+)\.mdx$/)))
    return `https://${HOST}/${m[1]}/subsidy/${m[2]}/${m[3]}/`;
  // content-i18n/<locale>/compare/<slug>.mdx
  if ((m = p.match(/^content-i18n\/([^/]+)\/compare\/([^/]+)\.mdx$/)))
    return `https://${HOST}/${m[1]}/compare/${m[2]}/`;
  return null;
}

function isPublished(file) {
  try {
    const head = fs.readFileSync(file, "utf-8").slice(0, 2000);
    return /status:\s*["']?published["']?/.test(head);
  } catch {
    return false; // 삭제된 파일 등 — 제출하지 않는다
  }
}

const files = process.argv.slice(2).filter((f) => !f.startsWith("_") && f.endsWith(".mdx"));
const urlList = [...new Set(files.filter(isPublished).map(toUrl).filter(Boolean))].slice(0, MAX_URLS);

if (urlList.length === 0) {
  console.log("IndexNow: 제출할 변경 기사 없음 — 스킵");
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }),
});

console.log(`IndexNow: ${urlList.length}건 제출 → HTTP ${res.status}`);
// 4xx/5xx여도 배포 자체를 실패시키지 않는다 (인덱싱 가속은 부가 기능)
if (!res.ok) console.log(await res.text().catch(() => ""));
