/**
 * 一次情報ページの本文を「原文のまま」取得して data/sources/ に保存する
 *
 *   npm run source -- --url <URL> --out data/sources/<topic>/NN_<name>.txt
 *   npm run source -- --url <URL>                    # 標準出力に表示（保存しない）
 *   npm run source -- --url <URL> --selector "#main" # 本文セレクタを明示
 *
 * なぜ専用スクリプトが必要か
 * ---------------------------------------------------------------
 * AGENTS.md 絶対規則 7「法令原文を加工して『原文』として保存禁止」。
 * - 要約系ツール（WebFetch 等）の出力は要約であって原文ではないため保存不可。
 * - src/lib/sources/monitor.ts の extract() は差分検知用に normalizeText() で
 *   日付を <DATE> に置換するため、原文保存には使えない。
 * 本スクリプトは cheerio でタグを除去するだけで、文字そのものは一切書き換えない。
 * （空白の畳み込みと行頭末トリムのみ行う。これは HTML の整形由来のノイズ除去であり
 *   本文の改変ではない。）
 *
 * 関公署サーバへの配慮（AGENTS.md 絶対規則 5）: User-Agent 明示・複数URL時は1秒間隔。
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const USER_AGENT = "gyosei-navi-source-fetcher/1.0 (+https://gyosei-navi.jp)";
const TIMEOUT_MS = 30000;

/** 本文コンテナが分かっているホスト（monitor.ts の KNOWN_CONTENT_SELECTORS と同趣旨） */
const KNOWN_CONTENT_SELECTORS: { host: RegExp; selector: string }[] = [
  { host: /^www\.moj\.go\.jp$/, selector: "#contentsArea" },
  { host: /^houmukyoku\.moj\.go\.jp$/, selector: "#contentsArea" },
];

/** 本文ではない要素。monitor.ts の ALWAYS_IGNORE と同じ */
const ALWAYS_IGNORE = [
  "script", "style", "noscript", "template", "svg", "iframe",
  "nav", "header", "footer", "aside",
  "[role=navigation]", "[role=banner]", "[role=contentinfo]",
];

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && !process.argv[i + 1]?.startsWith("--") ? process.argv[i + 1] : undefined;
}

/**
 * HTML から本文テキストを原文のまま取り出す。
 * 文字の置換は行わない（日付・数値・条番号をそのまま残す）。
 */
export function extractVerbatim(html: string, selector?: string, host?: string): string {
  const $ = cheerio.load(html);
  for (const sel of ALWAYS_IGNORE) $(sel).remove();

  const auto = host ? KNOWN_CONTENT_SELECTORS.find((k) => k.host.test(host))?.selector : undefined;
  const wanted = selector ?? auto;
  let root = wanted ? $(wanted) : $("body");
  if (root.length === 0) {
    console.warn(`  ⚠ セレクタ「${wanted}」に該当なし → body で代替`);
    root = $("body");
  }

  // ブロック要素の境界を改行に（テキストが1行に潰れるのを防ぐ）
  root.find("br, p, div, li, h1, h2, h3, h4, h5, h6, tr, dt, dd, section, article, table")
    .each((_, el) => { $(el).append("\n"); });
  // 表のセル区切りは | にして列構造を残す
  root.find("td, th").each((_, el) => { $(el).append(" | "); });

  return $.text()
    .replace(/\r/g, "")
    .replace(/ /g, " ")     // NBSP → 半角空白（表示上の空白であり本文の改変ではない）
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, arr) => l !== "" || (i > 0 && arr[i - 1] !== ""))
    .join("\n")
    .trim();
}

async function main(): Promise<void> {
  const url = arg("url");
  const out = arg("out");
  const selector = arg("selector");

  if (!url) {
    console.error(
      "使い方:\n  npm run source -- --url <URL> [--out data/sources/<topic>/NN_<name>.txt] [--selector <CSS>]"
    );
    process.exitCode = 1;
    return;
  }

  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`取得失敗 HTTP ${res.status}: ${url}`);

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/pdf")) {
    throw new Error(
      `PDF は本スクリプトでは扱えません（HTML 専用）。PDF は直接ダウンロードして読むこと: ${url}`
    );
  }

  const html = await res.text();
  const text = extractVerbatim(html, selector, new URL(res.url).hostname);

  // パース失敗を「0件」で通さない（AGENTS.md 絶対規則 6）
  if (text.length < 200) {
    throw new Error(
      `本文が短すぎます（${text.length}字）。セレクタ指定または JS レンダリングの可能性: ${url}`
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const header = [
    `取得元: ${res.url}`,
    `取得日: ${today}`,
    `取得方法: npm run source（cheerio でタグ除去のみ。文字の置換なし＝原文）`,
    `本文長: ${text.length}字`,
    "",
    "=".repeat(68),
    "",
  ].join("\n");

  if (out) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, header + text + "\n", "utf-8");
    console.log(`✔ 保存: ${out} (${text.length}字)`);
  } else {
    console.log(header + text);
  }
}

main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
