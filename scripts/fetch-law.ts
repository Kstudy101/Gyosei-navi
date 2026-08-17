/**
 * 법령 조문 취득 CLI (TASK-01)
 *   npm run law -- --law "行政書士法" --article 19
 *   npm run law -- --law "出入国管理及び難民認定法" --article 22 --paragraph 2
 *   npm run law -- --law "行政書士法" --article 19-3        # 第十九条の三
 *   npm run law -- --keyword "行政書士" --json              # 법령명 검색
 *   추가 옵션: --asof 2025-04-01 / --json (구조화 출력) / --legal-basis (frontmatter용 YAML)
 */
import {
  getArticle,
  searchLaws,
  toLegalBasis,
  toMdxQuote,
} from "../src/lib/sources/egov-law";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && !process.argv[i + 1]?.startsWith("--") ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

async function main(): Promise<void> {
  const law = arg("law");
  const article = arg("article");
  const paragraph = arg("paragraph");
  const keyword = arg("keyword");
  const asOf = arg("asof");

  if (keyword && !law) {
    const list = await searchLaws({ keyword, asOf });
    if (flag("json")) {
      console.log(JSON.stringify(list, null, 2));
      return;
    }
    if (list.length === 0) {
      console.error(`「${keyword}」에 해당하는 법령이 없습니다.`);
      process.exitCode = 1;
      return;
    }
    console.log(`「${keyword}」 검색 결과 ${list.length}건\n`);
    for (const l of list) {
      console.log(`${l.lawTitle}`);
      console.log(`  法令ID: ${l.lawId} / ${l.lawNumber} / ${l.lawType} / ${l.status ?? "-"}`);
    }
    return;
  }

  if (!law || !article) {
    console.error(
      "사용법:\n  npm run law -- --law <法令名|法令ID> --article <条番号> [--paragraph <項>] [--asof YYYY-MM-DD] [--json|--legal-basis]\n  npm run law -- --keyword <法令名の一部> [--json]"
    );
    process.exitCode = 1;
    return;
  }

  const a = await getArticle(law, article, { paragraph, asOf });

  if (flag("json")) {
    console.log(JSON.stringify(a, null, 2));
    return;
  }
  if (flag("legal-basis")) {
    const lb = toLegalBasis(a);
    console.log(`  - label: "${lb.label}"\n    url: "${lb.url}"\n    accessedAt: "${lb.accessedAt}"`);
    return;
  }
  console.log(toMdxQuote(a));
}

// process.exit() 은 Windows + Node 24 에서 fetch 핸들 정리와 충돌해 libuv 어서션을 내므로 exitCode 사용
main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
