/**
 * OG 이미지 생성 (1200×630 PNG) — published 기사 전건 + 사이트 기본 1장
 *   npm run og              # public/og/ 에 없는 것만 생성
 *   npm run og -- --force   # 전건 재생성 (타이틀 수정 후 등)
 *
 * 렌더링: satori(레이아웃→SVG) + @resvg/resvg-js(SVG→PNG).
 * 폰트를 파일로 임베드하므로 OS 폰트에 의존하지 않는다(로컬/CI 동일 결과).
 * 폰트(Noto Sans CJK JP, OFL)는 최초 실행 시 .cache/fonts/ 에 자동 다운로드(각 ~16MB, git 제외).
 * 생성된 PNG는 커밋한다 — CI는 폰트도 이 스크립트도 필요 없다.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { siteConfig } from "../src/config/site";
import { getCategory, TYPE_TAGS, SECTIONS } from "../src/config/taxonomy";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUT_DIR = path.join(process.cwd(), "public", "og");
const FONT_DIR = path.join(process.cwd(), ".cache", "fonts");

const FONTS = [
  {
    file: "NotoSansCJKjp-Bold.otf",
    url: "https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf",
    weight: 700 as const,
  },
  {
    file: "NotoSansCJKjp-Regular.otf",
    url: "https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf",
    weight: 400 as const,
  },
];

async function ensureFonts(): Promise<{ name: string; data: Buffer; weight: 400 | 700; style: "normal" }[]> {
  fs.mkdirSync(FONT_DIR, { recursive: true });
  const loaded = [];
  for (const f of FONTS) {
    const p = path.join(FONT_DIR, f.file);
    if (!fs.existsSync(p) || fs.statSync(p).size < 1_000_000) {
      console.log(`폰트 다운로드: ${f.file} …`);
      const res = await fetch(f.url, { redirect: "follow" });
      if (!res.ok) throw new Error(`폰트 다운로드 실패 (HTTP ${res.status}): ${f.url}`);
      fs.writeFileSync(p, Buffer.from(await res.arrayBuffer()));
    }
    loaded.push({ name: "Noto Sans CJK JP", data: fs.readFileSync(p), weight: f.weight, style: "normal" as const });
  }
  return loaded;
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

/** div/span 트리(satori 입력). JSX 대신 素のオブジェクト로 기술한다 */
const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({
  type,
  props: { style, ...(children !== undefined ? { children } : {}) },
});

const NAVY = "#123a63";
const BRAND = "#1e5a96";
const LIGHT = "#eef4fb";

function template(title: string, eyebrow: string, typeLabel: string | null) {
  const size = title.length <= 18 ? 66 : title.length <= 28 ? 58 : 50;
  return el(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: NAVY,
      padding: "36px 40px",
      fontFamily: "Noto Sans CJK JP",
    },
    [
      el(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          backgroundColor: "#ffffff",
          borderRadius: 24,
          padding: "48px 56px",
        },
        [
          // 상단: 카테고리·타입
          el("div", { display: "flex", alignItems: "center", gap: 14 }, [
            ...(typeLabel
              ? [
                  el(
                    "div",
                    {
                      display: "flex",
                      backgroundColor: LIGHT,
                      color: BRAND,
                      fontSize: 26,
                      fontWeight: 700,
                      padding: "6px 18px",
                      borderRadius: 8,
                    },
                    typeLabel
                  ),
                ]
              : []),
            el("div", { display: "flex", color: "#5b6b7c", fontSize: 26, fontWeight: 400 }, eyebrow),
          ]),
          // 타이틀
          el(
            "div",
            {
              display: "flex",
              flexGrow: 1,
              alignItems: "center",
              color: NAVY,
              fontSize: size,
              fontWeight: 700,
              lineHeight: 1.35,
              letterSpacing: "-0.01em",
            },
            title
          ),
          // 하단: 사이트명
          el("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
            el("div", { display: "flex", color: NAVY, fontSize: 30, fontWeight: 700 }, siteConfig.name),
            el("div", { display: "flex", color: "#8a97a5", fontSize: 24, fontWeight: 400 }, "gyosei-navi.jp"),
          ]),
        ]
      ),
    ]
  );
}

async function render(node: unknown, fonts: Awaited<ReturnType<typeof ensureFonts>>): Promise<Buffer> {
  const svg = await satori(node as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng());
}

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  const fonts = await ensureFonts();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let made = 0;
  let skipped = 0;

  // 사이트 기본 이미지 (기사 외 페이지용)
  const defaultPng = path.join(OUT_DIR, "default.png");
  if (force || !fs.existsSync(defaultPng)) {
    fs.writeFileSync(
      defaultPng,
      await render(template("行政書士業務の全分野を一次情報から解説する総合情報メディア", "公式サイト", null), fonts)
    );
    made++;
  } else skipped++;

  for (const file of walk(CONTENT_DIR)) {
    const { data } = matter(fs.readFileSync(file, "utf-8"));
    if (data.status !== "published") continue;
    const out = path.join(OUT_DIR, `${data.slug}.png`);
    if (!force && fs.existsSync(out)) {
      skipped++;
      continue;
    }
    const cat = getCategory(data.category)?.labelJa
      ?? SECTIONS[data.category as keyof typeof SECTIONS]?.label
      ?? String(data.category);
    const typeLabel = TYPE_TAGS[data.type as keyof typeof TYPE_TAGS] ?? null;
    fs.writeFileSync(out, await render(template(String(data.title), cat, typeLabel), fonts));
    made++;
    console.log(`  생성: og/${data.slug}.png`);
  }

  console.log(`\n완료: 생성 ${made}건 / 스킵(기존) ${skipped}건 → public/og/`);
}

main().catch((e: unknown) => {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
