# 리포지토리 구조 정의서 v2 — 전국 보조금 정보 사이트

> 상위 문서: `00_MASTER_PLAN.md` §6
> v1(행정서사 종합미디어) 구조에서 전환. 본 문서는 **목표 구조**를 기술한다 — 실제 코드 재작성(taxonomy・schema・라우트・content 이관)은 후속 세션에서 진행되며, 이 문서는 그 작업의 설계도 역할을 한다.

## 전체 트리 (목표)

```
gyosei-navi/
├── docs/                          기획・운영 문서 (한국어 — 내부용)
│   ├── 00_MASTER_PLAN.md          ★ 마스터 기획서 v2
│   ├── 01_IA_TAXONOMY.md          IA・분류체계 v2 (코드는 src/config/taxonomy.ts가 정본)
│   ├── 02_REPO_STRUCTURE.md       ← 본 문서
│   ├── 03_CONTENT_TEMPLATE.md     기사・보조금 레코드 작성 규격 v2
│   ├── 04_EDITORIAL_GUIDELINE.md  편집 규범・품질 게이트 v2
│   ├── 05_CONTENT_CALENDAR.md     콘텐츠 캘린더 (카테고리 확정 후 재수립)
│   └── 06_LEGAL_COMPLIANCE.md     법적 포지셔닝 v2 (완화판)
│
├── content/                       기사 본체 (MDX, 일본어)
│   ├── _TEMPLATE.mdx              ★ 신규 기사는 반드시 이걸 복사 (v2 스키마로 갱신 예정)
│   ├── subsidy/                   카테고리별 보조금 해설 기사
│   │   ├── shussan/                出産・育児
│   │   ├── jutaku/                 住宅・引越し
│   │   ├── sogyo/                  創業・事業
│   │   ├── kaigo/                  高齢・介護
│   │   ├── energy/                 エネルギー・環境
│   │   └── ...                     (docs/01 §3 카테고리 확정에 따라 증감)
│   ├── area/                      지역 허브 페이지 본문(있다면 — 자동 생성이 기본, 수동 보충 문구용)
│   ├── compare/                   지역 횡단 비교 기사
│   ├── news/                      신착・마감임박・개정 속보
│   └── pages/                     고정 페이지 본문 (about, disclaimer 등)
│
├── src/
│   ├── app/                       Next.js App Router
│   │   ├── layout.tsx             루트 레이아웃 (lang="ja", JSON-LD Organization)
│   │   ├── page.tsx               톱페이지 — 카테고리 진입 + 지역 선택 UI
│   │   ├── sitemap.ts             동적 사이트맵
│   │   ├── robots.ts
│   │   ├── subsidy/[category]/[slug]/     보조금 해설 기사
│   │   ├── area/[pref]/[city]/            지역 허브 (그 지자체의 전 카테고리 보조금)
│   │   ├── compare/[slug]/                지역 횡단 비교 페이지
│   │   ├── news/[slug]/
│   │   ├── tools/                 자가진단・시뮬레이터
│   │   ├── data/                  자료실
│   │   ├── about/                 運営者情報
│   │   ├── contact/
│   │   ├── policy/privacy/        プライバシーポリシー
│   │   ├── policy/disclaimer/     免責事項
│   │   └── api/lead/              리드 수집 엔드포인트
│   │
│   ├── components/
│   │   ├── article/               Callout, Checklist, FAQ, Disclaimer, SubsidyTable, CompareTable, TOC, UpdateLog
│   │   ├── layout/                Header, Footer, Breadcrumb, CategoryNav, RegionPicker(신규 — 지역 선택 UI)
│   │   ├── cta/                   광고 슬롯, LeadMagnet
│   │   ├── seo/                   JsonLd (Article/FAQPage/BreadcrumbList/Table)
│   │   └── ui/                    프리미티브
│   │
│   ├── lib/
│   │   ├── content.ts             MDX 로드・파싱・정렬
│   │   ├── content-schema.ts      ★ zod 스키마 v2 (빌드 시 전 기사 검증)
│   │   ├── seo.ts                 metadata 생성 헬퍼
│   │   ├── related.ts             관련기사 추천 로직
│   │   └── sources/               외부 데이터 연동 (v1에서 선별 계승 — 아래 「v1 자산 처리」 참조)
│   │       ├── http.ts             공통 fetch・rate-limit・캐시 — 계승
│   │       └── jgrants.ts          jGrants 국가 보조금 API 연동 — 계승, 이 사이트의 핵심 데이터 소스
│   │
│   ├── config/
│   │   ├── site.ts                ★ 사이트 기본 설정・면책 문안 (v2로 전면 재작성)
│   │   ├── taxonomy.ts            ★ 분류체계 정본 (v2로 전면 재작성 — docs/01 기준)
│   │   └── regions.ts             ★ 신설 — 전국地方公共団体코드 ↔ 로마자 슬러그 매핑
│   │
│   └── styles/globals.css
│
├── public/
│   ├── og/                        기사별 OG 이미지
│   ├── images/
│   └── downloads/                 리드 마그넷 PDF
│
├── prompts/                       AI 파이프라인 프롬프트 (v1 것은 삭제, 필요시 v2로 재설계)
│
├── scripts/
│   ├── validate-content.ts        전 기사 frontmatter 검증 (CI) — 계승, 스키마만 v2 대응
│   ├── check-links.ts             legalBasis/출처 URL 생존 확인 — 계승
│   ├── stale-report.ts            6개월 미갱신 기사 리포트 — 계승
│   ├── new-article.ts             템플릿에서 기사 생성 — 계승, 카테고리 목록만 v2 대응
│   └── (v1 전용 스크립트는 삭제 — 아래 표 참조)
│
└── .github/workflows/
    ├── ci.yml
    └── weekly-audit.yml
```

## v1 자산 처리 방침 (재작성 착수 시 그대로 실행)

| 대상 | 처리 | 이유 |
|---|---|---|
| `content/` 전체(행정서사 기사 76건) | 삭제 | 주제 무관, git 이력으로 복원 가능 |
| `prompts/`, `docs/16_AUTO_PUBLISH_PIPELINE.md`, `src/app/tools/eiju-shindan`, `src/app/tools/visa-navi` | 삭제 | 행정서사 도메인 특화 로직 |
| `src/lib/sources/jgrants.ts`, `http.ts` | **보존・재활용** | 도메인 무관한 국가 보조금 API 인프라, 이 사이트의 핵심 자산 |
| `src/lib/sources/egov-law.ts`, `kanpo.ts` | 보존 후보 | 보조금 근거법령・관보 확인에 재활용 가능 — 재작성 세션에서 실사용 여부 재판단 |
| `src/lib/sources/pubcomment.ts` | 재검토 | 보조금 제도 개정 관련 퍼블릭코멘트 감시에 쓸 수 있으나 우선순위 낮음 |
| `src/lib/sources/jp-number.ts`(법인번호 API) | 보존 후보 | 사업자 대상 보조금(`sogyo` 카테고리) 검증에 재활용 가능 |
| `src/lib/sources/estat.ts`(e-Stat 통계) | 보존 후보 | 지역별 통계 근거 자료로 재활용 가능 |
| `taxonomy.ts`, `content-schema.ts`, `site.ts` | 전면 재작성 | `docs/01`・`docs/03` v2 기준 |
| `docs/07`~`16`(파이프라인・모니터링・배포 등) | 개별 재검토 | 코드 재작성 단계에서 v2 대응 여부 판단, 상당수는 v1 도메인 특화라 폐기 가능성 높음 |

## 설계 원칙 (v1 계승)

| # | 원칙 | 이유 |
|---|---|---|
| 1 | 콘텐츠와 코드를 같은 리포에 둔다 | Git 커밋 = 갱신 이력 = 신뢰 증거 |
| 2 | 분류체계는 `taxonomy.ts` 하나에만 정의 | 문서와 코드의 불일치 방지 |
| 3 | frontmatter 검증 실패 = 빌드 실패 | 출처 누락 기사의 공개 원천 차단 |
| 4 | 면책 문안은 `site.ts`에 1곳만 | 법적 문안 변경 시 전 페이지 동시 반영 |
| 5 | 지역 코드-슬러그 매핑은 `regions.ts` 하나에만 | ★신규 원칙 — 지역 표기 불일치 방지 |
| 6 | 슬러그는 로마자 케밥케이스 고정 | URL 인코딩 깨짐・SNS 공유 문제 방지 |

## 빌드 파이프라인 (v1과 동일)

```
git push
  ↓
GitHub Actions
  ├─ npm run lint
  ├─ npm run validate:content   ← zod 스키마 전수 검증
  ├─ npm run check:links        ← 출처 URL 200 확인
  └─ npm run build
  ↓
배포(Vercel 또는 Xserver — 결정 사항, docs/11 v1 참조 후 v2 재검토)
```
