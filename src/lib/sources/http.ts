import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * 관공서 서버 대상 공통 HTTP 클라이언트 (docs/07 §2 C5/C6/C7)
 *   - User-Agent 명시
 *   - 요청 간 최소 1초 간격 (프로세스 전역 직렬화)
 *   - 실패는 삼키지 않고 throw
 *   - 선택적 파일 캐시 (.cache/ 아래, TTL)
 */

export const USER_AGENT =
  "gyosei-portal-pipeline/0.1 (+https://github.com/; content research bot; contact: editorial)";

const MIN_INTERVAL_MS = 1000;
let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 전역 직렬화 + 1초 간격 보장 */
function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    try {
      return await fn();
    } finally {
      lastRequestAt = Date.now();
    }
  });
  queue = run.catch(() => undefined);
  return run;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    public readonly bodySnippet: string
  ) {
    super(`HTTP ${status} ${url}\n${bodySnippet}`);
    this.name = "HttpError";
  }
}

export interface FetchTextOptions {
  method?: "GET" | "POST";
  body?: URLSearchParams | string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  /** 지정 시 .cache/{cacheDir}/ 에 캐시. TTL 밀리초 */
  cache?: { dir: string; ttlMs: number };
}

export const CACHE_ROOT = path.join(process.cwd(), ".cache");

function cacheFileFor(dir: string, key: string): string {
  const hash = crypto.createHash("sha256").update(key).digest("hex").slice(0, 32);
  return path.join(CACHE_ROOT, dir, `${hash}.json`);
}

interface CacheEntry {
  key: string;
  fetchedAt: number;
  status: number;
  body: string;
}

function readCache(file: string, ttlMs: number): CacheEntry | null {
  if (!fs.existsSync(file)) return null;
  try {
    const entry = JSON.parse(fs.readFileSync(file, "utf-8")) as CacheEntry;
    if (Date.now() - entry.fetchedAt > ttlMs) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeCache(file: string, entry: CacheEntry): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(entry), "utf-8");
}

/** 텍스트 응답 취득. 2xx 외는 HttpError throw */
export async function fetchText(url: string, opts: FetchTextOptions = {}): Promise<string> {
  const method = opts.method ?? "GET";
  const bodyStr = opts.body === undefined ? "" : opts.body.toString();
  const cacheKey = `${method} ${url} ${bodyStr}`;

  if (opts.cache) {
    const hit = readCache(cacheFileFor(opts.cache.dir, cacheKey), opts.cache.ttlMs);
    if (hit) return hit.body;
  }

  const body = await throttled(async () => {
    const res = await fetch(url, {
      method,
      body: opts.body,
      redirect: "follow",
      signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000),
      headers: {
        "user-agent": USER_AGENT,
        ...(opts.body instanceof URLSearchParams
          ? { "content-type": "application/x-www-form-urlencoded" }
          : {}),
        ...opts.headers,
      },
    });
    const text = await res.text();
    if (!res.ok) throw new HttpError(res.status, url, text.slice(0, 500));
    return text;
  });

  if (opts.cache) {
    writeCache(cacheFileFor(opts.cache.dir, cacheKey), {
      key: cacheKey,
      fetchedAt: Date.now(),
      status: 200,
      body,
    });
  }
  return body;
}

/** JSON 응답 취득 (파싱은 호출측에서 zod로) */
export async function fetchJson(url: string, opts: FetchTextOptions = {}): Promise<unknown> {
  const text = await fetchText(url, {
    ...opts,
    headers: { accept: "application/json", ...opts.headers },
  });
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`JSON 파싱 실패: ${url}\n${text.slice(0, 300)}`);
  }
}
