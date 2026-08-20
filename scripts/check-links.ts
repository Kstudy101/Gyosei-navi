/**
 * legalBasis URL 생존 확인 (一次情報 링크 절단 감시)
 *   - published 기사에서 죽은 링크 발견 시 exit 1
 *   - draft/review 기사는 경고만
 *
 * 사용: npm run check:links
 *
 * 관공서 서버 부하 배려(AGENTS.md 절대규칙 5): 같은 호스트에는 1초에 1회만 요청한다.
 * 호스트가 다르면 병렬로 진행하고, 중복 URL은 1회만 확인한다.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const TIMEOUT_MS = 15000;
const PER_HOST_INTERVAL_MS = 1100;
const USER_AGENT = "gyosei-navi-link-checker/1.0 (+https://gyosei-navi.jp)";

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

interface Target {
  file: string;
  status: string;
  label: string;
  url: string;
}

interface Result {
  ok: boolean;
  detail: string;
}

function collectTargets(): Target[] {
  const targets: Target[] = [];
  for (const file of walk(CONTENT_DIR)) {
    const { data } = matter(fs.readFileSync(file, "utf-8"));
    const rel = path.relative(CONTENT_DIR, file);
    for (const basis of data.legalBasis ?? []) {
      targets.push({
        file: rel,
        status: data.status ?? "draft",
        label: basis.label,
        url: basis.url,
      });
    }
  }
  return targets;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function checkUrl(url: string): Promise<Result> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": USER_AGENT },
    });
    // 본문(PDF 등)은 쓰지 않으므로 즉시 폐기 — 관공서 서버의 전송량을 아낀다
    await res.body?.cancel();
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}

/** 호스트별로 직렬(1초 간격), 호스트끼리는 병렬로 확인한다 */
async function checkAll(urls: string[]): Promise<Map<string, Result>> {
  const byHost = new Map<string, string[]>();
  for (const url of urls) {
    let host: string;
    try {
      host = new URL(url).hostname;
    } catch {
      host = "(invalid)";
    }
    const list = byHost.get(host);
    if (list) list.push(url);
    else byHost.set(host, [url]);
  }

  const results = new Map<string, Result>();
  let done = 0;

  await Promise.all(
    [...byHost.values()].map(async (hostUrls) => {
      for (const [i, url] of hostUrls.entries()) {
        if (i > 0) await sleep(PER_HOST_INTERVAL_MS);
        const result = await checkUrl(url);
        results.set(url, result);
        done++;
        if (!result.ok) console.log(`  ✖ ${url} (${result.detail})`);
        else if (done % 20 === 0) console.log(`  … ${done}/${urls.length}건 확인`);
      }
    })
  );

  return results;
}

async function main(): Promise<void> {
  const targets = collectTargets();
  const uniqueUrls = [...new Set(targets.map((t) => t.url))];

  console.log(
    `legalBasis ${targets.length}건 / 고유 URL ${uniqueUrls.length}건을 확인합니다 (같은 호스트는 1초 간격)…\n`
  );

  const results = await checkAll(uniqueUrls);

  const dead = targets.filter((t) => !results.get(t.url)?.ok);
  const publishedDead = dead.filter((t) => t.status === "published");

  if (dead.length > 0) {
    console.log(`\n죽은 링크가 걸린 기사 ${dead.length}건:`);
    for (const t of dead) {
      console.log(`  ✖ [${t.status}] ${t.file}`);
      console.log(`      ${t.label}`);
      console.log(`      ${t.url} (${results.get(t.url)?.detail})`);
    }
  }

  console.log(
    `\n확인 완료: legalBasis ${targets.length}건 / 고유 URL ${uniqueUrls.length}건 / published 기사의 죽은 링크 ${publishedDead.length}건`
  );

  // process.exit() 은 Windows + Node 24 에서 fetch 핸들 정리와 충돌해 libuv 어서션을 내므로 exitCode 사용
  if (publishedDead.length > 0) process.exitCode = 1;
}

main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
