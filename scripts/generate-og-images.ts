/**
 * OG 이미지 자동 생성 (빌드 전 실행 — deploy-xserver.yml)
 *   - 대상: content/ 전 섹션의 published 기사 중 frontmatter.ogImage가 빈 것
 *   - 출력: public/og/auto/<section>/<slug>.png (1200×630)
 *   - compare 기사는 텍스트 카드 대신 정보 이미지(타일맵+마감 목록)를 OG + -16x9/-4x3/-1x1로 출력
 *     (Discover・Article 구조화 데이터용, 본문 비교표 위에도 -16x9를 게재 — CompareTable.tsx)
 *   - src/lib/seo.ts가 ogImage 미지정 시 이 경로로 폴백한다
 *   - manifest.json에 입력 해시를 기록해 변경된 기사만 재생성(Actions 캐시와 병용)
 *
 * 사용: npm run og:generate
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import matter from "gray-matter";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

/** 템플릿을 바꾸면 올려서 전량 재생성시킨다 */
const TEMPLATE_VERSION = "1";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUT_DIR = path.join(process.cwd(), "public", "og", "auto");
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");
const FONT_DIR = path.join(process.cwd(), "node_modules", "@fontsource", "noto-sans-jp", "files");

const SECTION_LABELS: Record<string, string> = {
  subsidy: "補助金・助成金",
  compare: "地域比較",
  tokushu: "特集",
  news: "新着・締切",
  ranking: "ランキング",
};

const CATEGORY_LABELS: Record<string, string> = {
  shussan: "出産・育児",
  jutaku: "住宅・引っ越し",
  sogyo: "創業・事業",
  kaigo: "高齢・介護",
  energy: "エネルギー・環境",
  pet: "ペット",
  kyoiku: "教育・就学",
  kekkon: "結婚・新生活",
  shogaisha: "障害者支援",
};

interface OgInput {
  section: string;
  slug: string;
  title: string;
  badge: string;
  region: string;
  amount: string;
}

/**
 * compare 記事の情報画像（地図＋締切一覧）。Discover/構造化データ用に複数比率で出力する。
 * amount は自由文で比較不能なため使わない — 検証済みの構造化フィールドのみ描く（YMYL）。
 */
interface CompareRow {
  regionCode: string;
  regionLabel: string;
  status: "open" | "closed" | "ongoing" | "unresearched";
  periodEnd?: string;
  verifiedAt: string;
}
interface CompareInput {
  slug: string;
  title: string;
  rows: CompareRow[];
}

/** 出力サイズ。suffix 空は OG（src/lib/seo.ts の ogImagePath と同じパス） */
const COMPARE_SIZES = [
  { suffix: "", width: 1200, height: 630 },
  { suffix: "-16x9", width: 1200, height: 675 },
  { suffix: "-4x3", width: 1200, height: 900 },
  { suffix: "-1x1", width: 1200, height: 1200 },
] as const;

const STATUS_STYLE: Record<CompareRow["status"], { label: string; color: string; rank: number }> = {
  open: { label: "募集中", color: "#16a34a", rank: 0 },
  ongoing: { label: "通年", color: "#2563eb", rank: 1 },
  unresearched: { label: "調査中", color: "#d97706", rank: 2 },
  closed: { label: "締切", color: "#9ca3af", rank: 3 },
};

/** 47都道府県タイルマップ [都道府県コード, 表示名, 列, 行] */
const JAPAN_TILES: readonly [string, string, number, number][] = [
  ["01", "北海", 12, 0], ["02", "青森", 11, 2], ["05", "秋田", 10, 3], ["03", "岩手", 11, 3],
  ["06", "山形", 10, 4], ["04", "宮城", 11, 4], ["17", "石川", 7, 5], ["16", "富山", 8, 5],
  ["15", "新潟", 9, 5], ["07", "福島", 10, 5], ["32", "島根", 2, 6], ["31", "鳥取", 3, 6],
  ["28", "兵庫", 4, 6], ["26", "京都", 5, 6], ["18", "福井", 6, 6], ["21", "岐阜", 7, 6],
  ["20", "長野", 8, 6], ["10", "群馬", 9, 6], ["09", "栃木", 10, 6], ["08", "茨城", 11, 6],
  ["35", "山口", 1, 7], ["34", "広島", 2, 7], ["33", "岡山", 3, 7], ["27", "大阪", 4, 7],
  ["25", "滋賀", 5, 7], ["23", "愛知", 6, 7], ["19", "山梨", 8, 7], ["11", "埼玉", 9, 7],
  ["13", "東京", 10, 7], ["12", "千葉", 11, 7], ["41", "佐賀", 0, 8], ["40", "福岡", 1, 8],
  ["38", "愛媛", 3, 8], ["37", "香川", 4, 8], ["29", "奈良", 5, 8], ["24", "三重", 6, 8],
  ["22", "静岡", 7, 8], ["14", "神奈", 8, 8], ["42", "長崎", 0, 9], ["44", "大分", 1, 9],
  ["39", "高知", 3, 9], ["36", "徳島", 4, 9], ["30", "和歌", 5, 9], ["43", "熊本", 0, 10],
  ["45", "宮崎", 1, 10], ["46", "鹿児", 0, 11], ["47", "沖縄", 3, 11],
];

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

function truncate(s: string, max: number): string {
  const chars = [...s];
  return chars.length <= max ? s : chars.slice(0, max - 1).join("") + "…";
}

function collectInputs(): { inputs: OgInput[]; compareInputs: CompareInput[] } {
  const inputs: OgInput[] = [];
  const compareInputs: CompareInput[] = [];
  const parsed = walk(CONTENT_DIR).map((file) => ({
    section: path.relative(CONTENT_DIR, file).split(path.sep)[0],
    slug: path.basename(file, ".mdx"),
    data: matter(fs.readFileSync(file, "utf-8")).data,
  }));
  // compareTargets 解決用（CompareTable と同じく slug で全セクションから引く）
  const subsidyBySlug = new Map<string, CompareRow>();
  for (const p of parsed) if (p.data.subsidy) subsidyBySlug.set(String(p.data.slug ?? p.slug), p.data.subsidy);

  for (const { section, slug, data } of parsed) {
    if (!SECTION_LABELS[section]) continue;
    if (data.status && data.status !== "published") continue;
    if (typeof data.ogImage === "string" && data.ogImage !== "") continue; // 수동 지정 우선
    if (section === "compare" && Array.isArray(data.compareTargets)) {
      const rows = data.compareTargets
        .map((s: string) => subsidyBySlug.get(s))
        .filter((r: CompareRow | undefined): r is CompareRow => r !== undefined);
      if (rows.length > 0) {
        compareInputs.push({ slug, title: String(data.title ?? ""), rows });
        continue;
      }
    }
    const category = typeof data.category === "string" ? data.category : "";
    inputs.push({
      section,
      slug,
      title: String(data.title ?? ""),
      badge: CATEGORY_LABELS[category] ?? SECTION_LABELS[section],
      region: String(data.subsidy?.regionLabel ?? ""),
      // "※…" 주석은 이미지에서는 생략(폰트 서브셋에 ※ 글리프가 없어 두부로 렌더링됨)
      amount: String(data.subsidy?.amount ?? "").split("※")[0].trim(),
    });
  }
  return { inputs, compareInputs };
}

/** satori용 요소 트리(JSX 미사용) */
function el(type: string, style: Record<string, unknown>, children?: unknown) {
  return { type, props: { style, ...(children !== undefined ? { children } : {}) } };
}

function template(input: OgInput) {
  const footer =
    input.region || input.amount
      ? el(
          "div",
          { display: "flex", flexDirection: "column", gap: 14 },
          [
            input.region
              ? el(
                  "div",
                  {
                    display: "flex",
                    alignSelf: "flex-start",
                    backgroundColor: "rgba(255,255,255,0.14)",
                    color: "#d8e5f5",
                    fontSize: 30,
                    fontWeight: 700,
                    padding: "8px 22px",
                    borderRadius: 10,
                  },
                  truncate(input.region, 20)
                )
              : null,
            input.amount
              ? el(
                  "div",
                  { display: "flex", color: "#ffffff", fontSize: 38, fontWeight: 700 },
                  truncate(input.amount, 28)
                )
              : null,
          ].filter(Boolean)
        )
      : null;

  return el(
    "div",
    {
      width: 1200,
      height: 630,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "56px 64px",
      background: "linear-gradient(135deg, #0d2b4a 0%, #174a7d 100%)",
      fontFamily: "Noto Sans JP",
    },
    [
      el("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
        el("div", { display: "flex", color: "#ffffff", fontSize: 34, fontWeight: 700 }, "全国補助金ナビ"),
        el(
          "div",
          {
            display: "flex",
            backgroundColor: "#1e5a96",
            color: "#ffffff",
            fontSize: 26,
            fontWeight: 700,
            padding: "8px 20px",
            borderRadius: 999,
          },
          input.badge
        ),
      ]),
      // lineClamp는 satori가 display:block 요소에서 지원한다
      el(
        "div",
        {
          display: "block",
          lineClamp: 3,
          color: "#ffffff",
          fontSize: 60,
          fontWeight: 700,
          lineHeight: 1.35,
        },
        input.title
      ),
      footer ?? el("div", { display: "flex" }),
    ].filter(Boolean)
  );
}

function compareTemplate(input: CompareInput, width: number, height: number) {
  const rows = [...input.rows].sort(
    (a, b) =>
      STATUS_STYLE[a.status].rank - STATUS_STYLE[b.status].rank ||
      (a.periodEnd ?? "9999").localeCompare(b.periodEnd ?? "9999")
  );
  // 「時点」は最も古い確認日（一番古い情報に合わせて正直に表示する）
  const asOf = rows.map((r) => r.verifiedAt).sort()[0];
  const asOfYear = asOf.slice(0, 4);
  const prefStatus = new Map<string, CompareRow["status"]>();
  for (const r of rows) {
    const p = r.regionCode.slice(0, 2);
    const cur = prefStatus.get(p);
    if (!cur || STATUS_STYLE[r.status].rank < STATUS_STYLE[cur].rank) prefStatus.set(p, r.status);
  }

  const stacked = height / width >= 0.9; // 1:1 は地図の下に一覧
  const bodyH = height - 292; // padding・ヘッダ・タイトル2行・フッタを除いた高さ
  const cell = stacked ? 40 : Math.min(40, Math.floor(bodyH / 12));
  const tile = cell - 4;
  const ROW_H = 44;
  const listH = stacked ? bodyH - 12 * cell - 20 : bodyH;
  const maxRows = Math.max(1, Math.floor((listH - 30) / ROW_H));

  const map = el(
    "div",
    { display: "flex", position: "relative", width: 13 * cell, height: 12 * cell, flexShrink: 0 },
    JAPAN_TILES.map(([code, name, x, y]) => {
      const st = prefStatus.get(code);
      return el(
        "div",
        {
          position: "absolute",
          left: x * cell,
          top: y * cell,
          width: tile,
          height: tile,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(10, Math.floor(tile * 0.34)),
          fontWeight: 700,
          backgroundColor: st ? STATUS_STYLE[st].color : "#e5e7eb",
          color: st ? "#ffffff" : "#9ca3af",
        },
        name
      );
    })
  );

  const deadline = (r: CompareRow) => {
    if (r.status === "closed") return "";
    if (!r.periodEnd) return r.status === "ongoing" ? "" : "期限は公式参照";
    const [y, m, d] = r.periodEnd.split("-");
    return `${y === asOfYear ? "" : `${y}/`}${+m}/${+d}締切`;
  };
  const list = el(
    "div",
    { display: "flex", flexDirection: "column", gap: 8, ...(stacked ? { width: width - 104 } : { flex: 1 }) },
    [
      ...rows.slice(0, maxRows).map((r) => {
        const due = deadline(r);
        // 空文字のテキスト要素は satori の縦積みレイアウトで無限ループするため、無いときは要素ごと省く
        return el("div", { display: "flex", alignItems: "center", gap: 12, height: ROW_H - 8 }, [
          el(
            "div",
            {
              display: "flex",
              width: 76,
              flexShrink: 0,
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 700,
              padding: "3px 0",
              borderRadius: 999,
              backgroundColor: STATUS_STYLE[r.status].color,
            },
            STATUS_STYLE[r.status].label
          ),
          el(
            "div",
            { display: "flex", flex: 1, color: "#111827", fontSize: 24, fontWeight: 700 },
            truncate(r.regionLabel.replace(/（[^）]*）/g, ""), 13)
          ),
          ...(due ? [el("div", { display: "flex", color: "#4b5563", fontSize: 20 }, due)] : []),
        ]);
      }),
      ...(rows.length > maxRows
        ? [el("div", { display: "flex", color: "#6b7280", fontSize: 20 }, `ほか${rows.length - maxRows}件は記事内の比較表へ`)]
        : []),
    ]
  );

  const openCount = rows.filter((r) => r.status === "open" || r.status === "ongoing").length;
  const legend = (["open", "ongoing", "closed"] as const).map((s) =>
    el("div", { display: "flex", alignItems: "center", gap: 6 }, [
      el("div", { display: "flex", width: 16, height: 16, borderRadius: 4, backgroundColor: STATUS_STYLE[s].color }),
      el("div", { display: "flex", fontSize: 18, color: "#4b5563" }, STATUS_STYLE[s].label),
    ])
  );

  return el(
    "div",
    {
      width,
      height,
      display: "flex",
      flexDirection: "column",
      padding: "40px 52px",
      backgroundColor: "#f8fafc",
      fontFamily: "Noto Sans JP",
    },
    [
      el("div", { display: "flex", justifyContent: "space-between", alignItems: "center", height: 34 }, [
        el("div", { display: "flex", fontSize: 24, fontWeight: 700, color: "#174a7d" }, "全国補助金ナビ｜地域比較"),
        el(
          "div",
          { display: "flex", fontSize: 20, color: "#6b7280" },
          `${+asOf.slice(0, 4)}年${+asOf.slice(5, 7)}月${+asOf.slice(8, 10)}日時点`
        ),
      ]),
      el(
        "div",
        { display: "block", lineClamp: 2, fontSize: 40, fontWeight: 700, color: "#0d2b4a", marginTop: 14, lineHeight: 1.3 },
        input.title
      ),
      el(
        "div",
        {
          display: "flex",
          flexDirection: stacked ? "column" : "row",
          alignItems: "flex-start",
          gap: stacked ? 20 : 44,
          marginTop: 20,
          flex: 1,
          overflow: "hidden",
        },
        [map, list]
      ),
      el("div", { display: "flex", justifyContent: "space-between", alignItems: "center", height: 40 }, [
        el(
          "div",
          { display: "flex", fontSize: 22, color: "#374151", fontWeight: 700 },
          `${rows.length}件を比較 ／ 受付中 ${openCount}件`
        ),
        el("div", { display: "flex", gap: 18 }, legend),
      ]),
    ]
  );
}

interface Job {
  key: string;
  hash: string;
  outs: { path: string; width: number; height: number; tree: () => unknown }[];
}

function buildJobs(): Job[] {
  const { inputs, compareInputs } = collectInputs();
  const jobs: Job[] = inputs.map((input) => ({
    key: `${input.section}/${input.slug}`,
    hash: crypto
      .createHash("sha1")
      .update(TEMPLATE_VERSION + JSON.stringify([input.title, input.badge, input.region, input.amount]))
      .digest("hex"),
    outs: [{ path: path.join(OUT_DIR, input.section, `${input.slug}.png`), width: 1200, height: 630, tree: () => template(input) }],
  }));
  for (const input of compareInputs) {
    jobs.push({
      key: `compare/${input.slug}`,
      hash: crypto
        .createHash("sha1")
        .update(TEMPLATE_VERSION + "compare-info" + JSON.stringify(input))
        .digest("hex"),
      outs: COMPARE_SIZES.map((s) => ({
        path: path.join(OUT_DIR, "compare", `${input.slug}${s.suffix}.png`),
        width: s.width,
        height: s.height,
        tree: () => compareTemplate(input, s.width, s.height),
      })),
    });
  }
  return jobs;
}

/** 子プロセス側: 渡された key の画像だけを描画して終了する */
async function renderJobs(jobs: Job[]) {
  const fonts = [
    { name: "Noto Sans JP", data: fs.readFileSync(path.join(FONT_DIR, "noto-sans-jp-japanese-400-normal.woff")), weight: 400 as const, style: "normal" as const },
    { name: "Noto Sans JP", data: fs.readFileSync(path.join(FONT_DIR, "noto-sans-jp-japanese-700-normal.woff")), weight: 700 as const, style: "normal" as const },
  ];
  for (const job of jobs) {
    for (const out of job.outs) {
      const svg = await satori(out.tree() as never, { width: out.width, height: out.height, fonts });
      const png = new Resvg(svg, { fitTo: { mode: "width", value: out.width } }).render().asPng();
      fs.mkdirSync(path.dirname(out.path), { recursive: true });
      fs.writeFileSync(out.path, png);
    }
  }
}

/**
 * resvg-js 2.6.2 の render() はピクセルバッファ（1枚約3MB）を GC でも解放しないため、
 * 100件ずつ子プロセスで描画し、プロセス終了で OS に回収させる。
 */
const CHUNK = 100;

async function main() {
  const jobs = buildJobs();
  if (process.env.OG_KEYS) {
    const keys = new Set<string>(JSON.parse(process.env.OG_KEYS));
    await renderJobs(jobs.filter((j) => keys.has(j.key)));
    return;
  }

  const manifest: Record<string, string> = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"))
    : {};
  const pending = jobs.filter((j) => manifest[j.key] !== j.hash || !j.outs.every((o) => fs.existsSync(o.path)));

  for (let i = 0; i < pending.length; i += CHUNK) {
    const keys = pending.slice(i, i + CHUNK).map((j) => j.key);
    const r = spawnSync(process.execPath, [...process.execArgv, process.argv[1]], {
      env: { ...process.env, OG_KEYS: JSON.stringify(keys) },
      stdio: "inherit",
    });
    if (r.status !== 0) throw new Error(`OG 생성 자식 프로세스 실패 (status ${r.status}, signal ${r.signal})`);
    console.log(`  ...${Math.min(i + CHUNK, pending.length)}/${pending.length}건 생성`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(Object.fromEntries(jobs.map((j) => [j.key, j.hash])), null, 2));
  const compareCount = jobs.filter((j) => j.outs.length > 1).length;
  console.log(
    `OG 생성 완료: 대상 ${jobs.length}건(compare 정보 이미지 ${compareCount}건) / 생성 ${pending.length}건 / 스킵(변경 없음) ${jobs.length - pending.length}건`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
