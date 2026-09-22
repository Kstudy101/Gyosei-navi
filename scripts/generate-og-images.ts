/**
 * OG 이미지 자동 생성 (빌드 전 실행 — deploy-xserver.yml)
 *   - 대상: content/ 전 섹션의 published 기사 중 frontmatter.ogImage가 빈 것
 *   - 출력: public/og/auto/<section>/<slug>.png (1200×630)
 *   - src/lib/seo.ts가 ogImage 미지정 시 이 경로로 폴백한다
 *   - manifest.json에 입력 해시를 기록해 변경된 기사만 재생성(Actions 캐시와 병용)
 *
 * 사용: npm run og:generate
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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

function collectInputs(): OgInput[] {
  const inputs: OgInput[] = [];
  for (const file of walk(CONTENT_DIR)) {
    const rel = path.relative(CONTENT_DIR, file).split(path.sep);
    const section = rel[0];
    if (!SECTION_LABELS[section]) continue;
    const { data } = matter(fs.readFileSync(file, "utf-8"));
    if (data.status && data.status !== "published") continue;
    if (typeof data.ogImage === "string" && data.ogImage !== "") continue; // 수동 지정 우선
    const category = typeof data.category === "string" ? data.category : "";
    inputs.push({
      section,
      slug: path.basename(file, ".mdx"),
      title: String(data.title ?? ""),
      badge: CATEGORY_LABELS[category] ?? SECTION_LABELS[section],
      region: String(data.subsidy?.regionLabel ?? ""),
      // "※…" 주석은 이미지에서는 생략(폰트 서브셋에 ※ 글리프가 없어 두부로 렌더링됨)
      amount: String(data.subsidy?.amount ?? "").split("※")[0].trim(),
    });
  }
  return inputs;
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

async function main() {
  const font400 = fs.readFileSync(path.join(FONT_DIR, "noto-sans-jp-japanese-400-normal.woff"));
  const font700 = fs.readFileSync(path.join(FONT_DIR, "noto-sans-jp-japanese-700-normal.woff"));

  const inputs = collectInputs();
  const manifest: Record<string, string> = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"))
    : {};
  const nextManifest: Record<string, string> = {};

  let generated = 0;
  let skipped = 0;
  for (const input of inputs) {
    const key = `${input.section}/${input.slug}`;
    const hash = crypto
      .createHash("sha1")
      .update(TEMPLATE_VERSION + JSON.stringify([input.title, input.badge, input.region, input.amount]))
      .digest("hex");
    nextManifest[key] = hash;

    const outPath = path.join(OUT_DIR, input.section, `${input.slug}.png`);
    if (manifest[key] === hash && fs.existsSync(outPath)) {
      skipped++;
      continue;
    }

    const svg = await satori(template(input) as never, {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Noto Sans JP", data: font400, weight: 400, style: "normal" },
        { name: "Noto Sans JP", data: font700, weight: 700, style: "normal" },
      ],
    });
    const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, png);
    generated++;
    if (generated % 50 === 0) console.log(`  ...${generated}건 생성`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(nextManifest, null, 2));
  console.log(`OG 생성 완료: 대상 ${inputs.length}건 / 생성 ${generated}건 / 스킵(변경 없음) ${skipped}건`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
