# 리포지토리 구조 정의서

> 상위 문서: `00_MASTER_PLAN.md` §6

## 전체 트리

```
gyosei-portal/
├── docs/                          기획·운영 문서 (한국어 — 내부용)
│   ├── 00_MASTER_PLAN.md          ★ 마스터 기획서 (최상위 규범)
│   ├── 01_IA_TAXONOMY.md          IA·분류체계 (코드는 src/config/taxonomy.ts가 정본)
│   ├── 02_REPO_STRUCTURE.md       ← 본 문서
│   ├── 03_CONTENT_TEMPLATE.md     기사 작성 규격
│   ├── 04_EDITORIAL_GUIDELINE.md  편집 규범·품질 게이트
│   ├── 05_CONTENT_CALENDAR.md     90일 콘텐츠 캘린더
│   └── 06_LEGAL_COMPLIANCE.md     ★ 행정서사법 제19조 대응
│
├── content/                       기사 본체 (MDX, 일본어)
│   ├── _TEMPLATE.mdx              ★ 신규 기사는 반드시 이걸 복사
│   ├── news/                      속보·제도 동향
│   ├── guide/                     일반·기업 대상 가이드
│   │   ├── nyukan/                入管・国際     ← P0 초기 집중
│   │   ├── houjin/                法人設立
│   │   ├── kyoninka/              許認可
│   │   ├── souzoku/               相続・遺言
│   │   ├── hojokin/               補助金
│   │   ├── jidosha/               自動車・運輸
│   │   ├── keiyaku/               契約・民事
│   │   └── shinryoiki/            新領域
│   ├── practice/                  전문가용 실무
│   │   ├── jitsumu/               분야별 실무 논점
│   │   ├── dx/                    IT/DX·전자신청
│   │   └── keiei/                 사무소 경영·집객
│   ├── exam/                      시험·개업
│   └── pages/                     고정 페이지 본문 (about, disclaimer 등)
│
├── src/
│   ├── app/                       Next.js App Router
│   │   ├── layout.tsx             루트 레이아웃 (lang="ja", JSON-LD Organization)
│   │   ├── page.tsx               톱페이지
│   │   ├── sitemap.ts             동적 사이트맵
│   │   ├── robots.ts
│   │   ├── news/[slug]/
│   │   ├── guide/[category]/[slug]/
│   │   ├── practice/[category]/[slug]/
│   │   ├── exam/[slug]/
│   │   ├── tools/eiju-check/      永住要件セルフ診断 (전환 핵심)
│   │   ├── data/                  자료실
│   │   ├── about/                 運営者情報  ★E-E-A-T 필수
│   │   ├── contact/
│   │   ├── policy/privacy/        プライバシーポリシー
│   │   ├── policy/disclaimer/     免責事項      ★법적 필수
│   │   └── api/lead/              리드 수집 엔드포인트 (LINE 연동)
│   │
│   ├── components/
│   │   ├── article/               Callout, Checklist, FAQ, Disclaimer,
│   │   │                          NoticeBanner, LegalBasisList, TOC, UpdateLog
│   │   ├── layout/                Header, Footer, Breadcrumb, CategoryNav
│   │   ├── cta/                   LineCta, LeadMagnet, ConsultCta(Phase C에서 교체)
│   │   ├── seo/                   JsonLd (Article/FAQPage/BreadcrumbList/HowTo)
│   │   └── ui/                    shadcn/ui 기반 프리미티브
│   │
│   ├── lib/
│   │   ├── content.ts             MDX 로드·파싱·정렬
│   │   ├── content-schema.ts      ★ zod 스키마 (빌드 시 전 기사 검증)
│   │   ├── seo.ts                 metadata 생성 헬퍼
│   │   ├── related.ts             관련기사 추천 로직
│   │   └── line.ts                LINE Messaging API 래퍼
│   │
│   ├── config/
│   │   ├── site.ts                ★ 사이트 기본 설정·면책 문안
│   │   └── taxonomy.ts            ★ 분류체계 정본
│   │
│   └── styles/globals.css
│
├── public/
│   ├── og/                        기사별 OG 이미지
│   ├── images/
│   └── downloads/                 리드 마그넷 PDF/Excel
│
├── prompts/                       AI 파이프라인 프롬프트 (버전관리)
│   ├── monitor/                   일차정보 감시·변경 감지
│   ├── draft/                     초고 생성
│   └── verify/                    팩트체크·법적 표현 검수
│
├── scripts/
│   ├── validate-content.ts        전 기사 frontmatter 검증 (CI)
│   ├── check-links.ts             legalBasis URL 생존 확인
│   ├── stale-report.ts            6개월 미갱신 기사 리포트
│   └── new-article.ts             템플릿에서 기사 생성
│
└── .github/workflows/
    ├── ci.yml                     build + validate-content + lint
    └── weekly-audit.yml           매주 링크·노후 기사 점검 → Issue 자동 생성
```

## 설계 원칙

| # | 원칙 | 이유 |
|---|---|---|
| 1 | **콘텐츠와 코드를 같은 리포에 둔다** | Git 커밋 = 갱신 이력 = E-E-A-T 증거 |
| 2 | 분류체계는 `taxonomy.ts` 하나에만 정의 | 문서와 코드의 불일치 방지 |
| 3 | frontmatter 검증 실패 = **빌드 실패** | 一次情報 누락 기사의 공개 원천 차단 |
| 4 | 면책 문안은 `site.ts`에 1곳만 | 법적 문안 변경 시 전 페이지 동시 반영 |
| 5 | CTA 컴포넌트를 분리 | Phase C에서 `ConsultCta` 하나만 교체하면 수익화 전환 완료 |
| 6 | 슬러그는 로마자 케밥케이스 고정 | URL 인코딩 깨짐·SNS 공유 문제 방지 |

## 빌드 파이프라인

```
git push
  ↓
GitHub Actions
  ├─ pnpm lint
  ├─ pnpm validate:content   ← zod 스키마 전수 검증
  ├─ pnpm check:links        ← legalBasis URL 200 확인
  └─ pnpm build
  ↓
Vercel 자동 배포 (도쿄 리전)
```

## 초기 셋업 명령 (참고)

```bash
pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
pnpm add zod gray-matter next-mdx-remote rehype-slug rehype-autolink-headings remark-gfm
pnpm add -D @types/node tsx
pnpm dlx shadcn@latest init
```
