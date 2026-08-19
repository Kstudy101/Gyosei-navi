# 시스템 총정리 — 行政書士ナビ・ジャーナル (2026-08-17 시점)

> 목적: 지금 리포에서 **실제로 돌아가는 로직·기능**을 한 장에. 기획은 `00_MASTER_PLAN.md`, 구조 의도는 `02_REPO_STRUCTURE.md`, 이 문서는 "구현된 것"만 다룬다.
> 커밋 5건 (ca450d2 → c71d6d6). 스택: Next.js 15 App Router / React 19 / Tailwind v4 / zod / tsx / npm.

---

## 0. 한눈에 — 두 개의 시스템

```
┌─ A. 사이트 (Next.js) ──────────────────────────────┐   ┌─ B. 자료수집 파이프라인 (tsx 스크립트) ─────────┐
│ content/*.mdx ─▶ zod 검증 ─▶ 정적 페이지 생성       │   │ e-Gov 法令API ─▶ 조문 원문 ─▶ MDX 인용/legalBasis │
│ 27 라우트 / JSON-LD / 면책 고정 / 改定案 배너       │◀──│ 관공서 페이지 해싱 ─▶ 변경 감지 ─▶ Issue         │
│ 미공개(draft/review)는 dev 서버에서만 표시           │   │ パブコメ RSS+목록 ─▶ 키워드 필터 ─▶ 신착·D-day    │
└────────────────────────────────────────────────────┘   └───────────────────────────────────────────────┘
                     ▲                                                     │
                     └──────────── 사람이 원문 대조 후 status: published ────┘
```

---

## A. 사이트 — 콘텐츠가 화면이 되기까지

### A-1. 설정 정본 (변경 시 승인 필요)
| 파일 | 내용 |
|---|---|
| `src/config/site.ts` | 사이트명 `行政書士ナビ・ジャーナル`, URL(placeholder `https://example.jp`), 설명, **전 페이지 면책문**, 자격상태 문구(`行政書士試験受験中`), SNS(빈값), 계측 ID(`NEXT_PUBLIC_GA4_ID`/`NEXT_PUBLIC_CLARITY_ID` env에서 읽음) |
| `src/config/taxonomy.ts` | 섹션 6종(news/guide/practice/exam/tools/data), **8대 분야**(nyukan P0 … shinryoiki P3, seedKeywords 포함), practice 3분류, 독자축·제도축·형식축 태그, **noticeLevel 4종**(enforced/scheduled/draft-proposal/outdated + 배너 문구) |
| `src/lib/content-schema.ts` | frontmatter zod 스키마. **published인데 legalBasis 0건이면 실패**, updatedAt ≥ publishedAt, slug는 로마자 케밥, description 50–160자, title 10–60자 |

### A-2. 콘텐츠 로딩 `src/lib/content.ts`
1. `content/{news,guide,practice,exam}/**/*.mdx` 재귀 수집 (`_`로 시작하는 파일 = 템플릿 제외)
2. gray-matter로 frontmatter 분리 → zod 검증. **실패 시 throw → 빌드 실패** (품질 게이트)
3. 추가 검증: `slug` = 파일명, `category` = 디렉토리명(guide/practice)
4. **표시 규칙**: production은 `status: published`만 / dev 또는 `SHOW_DRAFTS=1`은 draft·review도 표시 / archived는 항상 숨김
5. `href` 자동 산출: `/guide/{category}/{slug}`, `/news/{slug}` 등. publishedAt 내림차순 정렬, production에서 캐시

### A-3. MDX 렌더링 `src/lib/mdx.tsx` + `components/article/mdx-components.tsx`
- `@mdx-js/mdx`로 서버(RSC)에서 컴파일·실행 (next-mdx-remote 미사용 — React 19 충돌 회피)
- remark-gfm(표), rehype-slug + autolink-headings(H2/H3 앵커)
- 본문에서 쓸 수 있는 컴포넌트: `Callout(info|warning|danger)`, `Checklist`, `CompareTable`, `FAQ`(frontmatter faq 자동 전개), `LegalBasisList`, `UpdateLog`, `NoticeBanner`, `Disclaimer`, `PrNotice`(PR 고지), `LineCta`, `ConsultCta`

### A-4. 기사 페이지 `components/article/ArticleView.tsx` — 한 기사가 렌더링될 때 자동으로 붙는 것
| 순서 | 요소 | 로직 |
|---|---|---|
| 1 | JSON-LD 3종 | `Article`(항상) + `BreadcrumbList` + `FAQPage`(faq 있을 때) — GEO/AI검색 인용 대응 |
| 2 | 빵부스러기 | 섹션 → 카테고리 → 기사 |
| 3 | **미공개 초안 경고** | `status !== published`면 한국어 빨간 점선 박스 (dev 전용, 사람 검수 알림) |
| 4 | **NoticeBanner** | `noticeLevel`에 따라 「改定案」「施行予定」「旧制度」 배너 자동. enforced는 없음 |
| 5 | 헤더 | 타입 배지·분야명·公開/最終更新일·執筆 |
| 6 | 본문 | MDX |
| 7 | **자동 보완** | 본문에 `<FAQ/>`가 없으면 FAQ 섹션 자동 삽입 / `<LegalBasisList/>` 없으면 出典 자동 / `<UpdateLog/>` 없으면 更新履歴 자동 / **`<Disclaimer/>` 없으면 면책 자동 삽입** (docs/03 고정 구조 보장) |
| 8 | 관련 기사 | `lib/related.ts`: relatedSlugs 명시분 우선 → 태그 겹침×2 + 같은 카테고리 점수순, 최대 4 |

### A-4b. 자체 판매 광고 (2026-08-19 도입 — 행정서사 사무소 대상 지면 판매)
- **정본: `src/config/ads.ts`** — 슬롯 3개(rail-left / rail-right / article-bottom)와 광고주 정보. `advertiser: null`이면 「広告主募集中」 플레이스홀더(→ `/ads`)가 렌더. 광고주 확정 시 이 파일 기입 + `public/ad-banners/`에 배너.
- 컴포넌트: `components/ads/AdRail.tsx`(xl 이상 양옆 sticky 레일)·`AdCard.tsx`(xl 미만 기사 말미 카드). 전 슬롯 「広告」 라벨 상시(景表法), 광고주 링크는 `rel="sponsored"`.
- 레이아웃: ArticleView가 xl 이상에서 `max-w-6xl` 3컬럼 그리드(11rem+본문 max-w-3xl+11rem). xl 미만은 종전과 동일 단일 컬럼.
- 법적 설계: **월액 고정 게재료만, 알선·성과보수 배제** (docs/06 §2). 안내 페이지 `/ads`, 문의 `info@gyosei-navi.jp`(Xserver 도메인 메일, 2026-08-19 생성 완료).

### A-5. 라우트 (27 페이지, 전부 SSG)
| 경로 | 내용 |
|---|---|
| `/` | 히어로 → 特集 배너(永住 기둥기사 slug 고정) → 最新記事 6 → 分野から探す(8분야 그리드) → **診断ツール 예고** → practice/exam/tools/data 링크 → **編集方針 3원칙 스트립** |
| `/news`, `/news/[slug]` | 속보 목록·기사 |
| `/guide`, `/guide/[category]`, `/guide/[category]/[slug]` | 8분야 인덱스·분야별 목록·기사. category는 taxonomy로 `generateStaticParams` |
| `/practice`, `/practice/[category]`, `/practice/[category]/[slug]` | 전문가용 3분류 |
| `/exam`, `/exam/[slug]` | 시험·개업 |
| `/tools` | 診断ツール 3종 「準備中」 카드 + 참고정보 면책 |
| `/data` | 관공서 一次情報 링크 8건 (sources.yaml과 동기) |
| `/about` | 運営者情報 — **자격상태 정직 기재**, 編集方針 3원칙, 사이트 개요 표 |
| `/contact` | 「個別のご相談にはお答えできません」 고정 + 폼 준비중 |
| `/policy/disclaimer`, `/policy/privacy` | 5개 조항씩, 制定日 2026-08-17 |
| `/sitemap.xml`, `/robots.txt` | 정적 경로 + **published 기사만** 사이트맵 수록 |
| 404 | not-found.tsx |

### A-6. 레이아웃 공통 (`layout.tsx`, `Header`, `Footer`)
- `<html lang="ja">`, Organization + WebSite JSON-LD, 메타 타이틀 템플릿 `%s｜行政書士ナビ・ジャーナル`
- Header: 6섹션 내비 + 運営者情報
- **Footer: 면책문 + 자격상태 문구 전 페이지 고정** (법19조 대응) + 섹션·8분야 링크 + 정책 링크

### A-7. 현재 콘텐츠
- `content/guide/nyukan/eiju-guideline-kaitei-2026.mdx` — 기둥 기사 (改定案 全体像, 対照表 14행, FAQ 5) **status: review, 원문 대조 완료**
- `content/news/eiju-pubcomme-2026.mdx` — パブコメ 제출법 (3종 방법, 9/3 必着) **status: review, 원문 대조 완료**
- `content/_TEMPLATE.mdx` — 신규 기사 원본

---

## B. 자료수집 파이프라인 — `npm run …`

### B-0. 공통 기반 `src/lib/sources/http.ts`
- User-Agent 명시, **프로세스 전역 직렬화로 요청 간 1초 보장**, 실패는 `HttpError` throw(삼키지 않음)
- 선택적 파일 캐시 `.cache/{dir}/{sha256}.json` (TTL)

### B-1. `npm run law` — e-Gov 法令API v2 (`egov-law.ts`, `scripts/fetch-law.ts`)
```
--law "行政書士法" --article 19 [--paragraph 2] [--asof YYYY-MM-DD] [--json|--legal-basis]
--keyword "書士法"                       # 법령명 검색
```
- 법령명 → `/laws?law_title=` 부분일치 → **완전일치 우선·폐지 제외**, 다건이면 후보 나열 후 실패
- 조문 → `/law_data/{id}?elm=MainProvision-Article_19&json_format=light` (枝番 `19-3`, 項 지정 가능)
- light JSON 트리를 재귀 순회해 項·号·号細分 텍스트를 **원문 그대로** 추출 (Title/Caption/Num 키 제외)
- 출력: MDX 인용 블록(「> 【法令 第X条（見出し）】 … ― 出典: e-Gov法令検索」) / `--legal-basis`는 frontmatter YAML / `--json`
- sourceUrl `https://laws.e-gov.go.jp/law/{id}#Mp-At_19`, 캐시 24h, 없는 조문은 API 400 메시지 그대로 + exit 1

### B-2. `npm run monitor` — 一次情報 변경 감지 (`monitor.ts`, `scripts/monitor.ts`)
```
[--priority P0] [--id isa-eiju-guideline] [--dry-run] [--github-issue] [--report out.md]
```
1. `prompts/monitor/sources.yaml` **v2.1 (83소스, 全8분야 — 해설 docs/10)** 을 zod로 로드. id 중복·`deadUrls` 해당 URL은 로드 거부. `method: diff`만 처리(rss 10·api 3은 제외 — TASK-10 예정). 현재 **enabled 68건** 베이스라인 기록 완료, 2건은 403으로 `blocked`
2. fetch — **`<meta http-equiv=refresh>` 최대 3단 자동 추적** (입관청 사이트 특성)
3. cheerio로 `selector` 영역만 추출 (미지정이어도 moj.go.jp는 `#contentsArea` 자동), `nav/header/footer/aside/time/iframe/script/style` 상시 제거 + `ignoreSelectors`, block 요소 개행
4. **정규화(오탐 억제)**: 日付(和暦·西暦·슬래시)·時刻·24자+ HEX·세션ID 파라미터·공백 연속 → 토큰화. 링크는 `#`·캐시버스터 쿼리(`?1786951130`, `?v=`) 제거
5. SHA-256 해시 + 링크 집합을 `.cache/monitor-state.json`의 이전 값과 비교
6. 결과: `初期化`(첫 실행) / `変更なし` / `★変更`(추가·삭제 행 diff 최대 20 + 신규 링크) / `✖ エラー`(개별 격리, 전체는 계속)
7. `--github-issue`면 `gh issue create` (라벨 `content-opportunity`, `priority:P0..`) / `--dry-run`은 상태 미갱신 / 전건 에러만 exit 1

### B-3. `npm run pubcomment` — e-Gov パブコメ 감시 (`pubcomment.ts`, `scripts/watch-pubcomment.ts`)
```
[--pages 5] [--all] [--dry-run] [--github-issue] [--report out.md]
```
1. **RSS** `rss/pcm_list.xml`(최신 6건, RDF 파싱) + **목록 서블릿** `POST /servlet/Public CLASSNAME=PCMMSTLIST&Page=n`(20건/p, 무상태) N페이지 → 案件ID로 중복 제거
2. 항목: id/標題/所管/カテゴリー/公示日/締切(「2026/09/04 23:59」·「2026年9月4日0時0分」 모두 `normalizeJpDate`로 통일)
3. **클라이언트측 키워드 필터** 13종(行政書士/在留資格/入管/永住/帰化/育成就労/技能実習/特定技能/外国人/建設業許可/電子申請/行政手続/出入国) — 서버 검색은 세션 의존이라 미사용
4. `.cache/pubcomment-seen.json`에 없는 것만 출력. JST 기준 D-day 계산, **D-7 이하 ★緊急 상단**, 記事機会 高/中/低
5. **N4 준수**: RSS `<channel>` 없음 / 목록 `totalPage`·`li` 없음 / 항목 필드 결손 → throw (0건으로 위장 금지)

### B-4. `npm run stats` — e-Stat 3.0 (`estat.ts`) — **실가동 (2026-08-19, TASK-05 AC 3/3)**
- `ESTAT_APP_ID` 없으면 3단계 안내 + exit 1. `getStatsList`/`getStatsData` JSON, `RESULT.STATUS≥100` 오류 판정, 1건/다건 정규화, `data/stats/{id}.json + .meta.json`(출처 메타 + **CLASS_INF 코드사전**) 저장
- 취득 실적: 0004019020 在留外国人統計 943건 (재류자격별×반기, 2012→2025-12). 帰化許可申請者数는 **e-Stat 부존재 확정** → 法務省 민사국 페이지가 정본 (docs/api/estat-api.md)

### B-5. 운영 스크립트
| 명령 | 기능 |
|---|---|
| `validate:content` | 전 기사 zod + slug/카테고리 일치 + 경고(타이틀 32자 초과, FAQ 3건 미만). CI 게이트 |
| `check:links` | legalBasis URL GET 생존 확인. published 기사의 죽은 링크만 exit 1 |
| `stale` | published 중 183일 미갱신 리포트 |
| `new:article -- --section guide --category nyukan --slug x --type cluster` | 템플릿 복사·날짜/slug 치환 |
| `keywords:seed` | taxonomy seedKeywords + 기사 targetKeywords → `data/keywords.csv` (idempotent, 현재 47행) |

### B-6. 자동화 (GitHub Actions — **전부 실가동 중**, 2026-08-19 실행 이력으로 확인)
원격: `github.com/Kstudy101/Gyosei-navi` (TASK-06 완료 — 「원격 미연결」은 구정보)

| 워크플로 | 트리거 | 동작 | 실가동 확인 |
|---|---|---|---|
| `ci.yml` | push/PR | `npm ci` → validate:content → build | ✅ 8/17~ 연속 success |
| `deploy-xserver.yml` | main push(코드·콘텐츠 경로만) + 수동 | 빌드 → rsync로 Xserver `public_html` 차분 동기 (docs/11) | ✅ 8/17 기사 22건 공개분 배포 success |
| `weekly-audit.yml` | 월 06:00 JST | check:links + stale | 스케줄 대기 |
| `daily-monitor.yml` | **매일 08:00/20:00 JST** + 수동 | monitor + pubcomment + subsidies → `.cache/`를 actions/cache로 유지 → **변경/신착 있을 때만** Issue(`content-opportunity`, `priority:P0/P1`), 실패 시 `monitoring-failure` Issue | ✅ 1일 2회 success |
| `kanpo-archive.yml` | 매일 09:00 JST + 수동 | 官報 텍스트 → `data/kanpo-text/` 자동 커밋, PDF → Release 자산 | ✅ 매일 자동 커밋 중 |

### B-7. 인프라 파일 (미가동)
- `infra/changedetection/` — docker-compose(changedetection.io + browserless Chrome), README(등록 절차·알림: LINE Notify 종료 → 이메일/Discord/Slack/Messaging API), watchlist(JS SPA·PDF 전담 12건)

---

## C. 데이터·상태 파일
| 경로 | 내용 | git |
|---|---|---|
| `.cache/egov/` | 法令API 응답 캐시 24h | ignore |
| `.cache/monitor-state.json` | 소스별 hash/links/snapshot(200KB)/checkedAt | ignore |
| `.cache/pubcomment-seen.json` | 본 案件 ID → title/deadline/firstSeenAt | ignore |
| `data/sources/pubcomment-315000140/` | 永住ガイドライン改定案 원문 (**.txt 정본**, PDF는 이 PC 정책으로 자동 암호화됨), 現行 스냅샷, 검수 README | 커밋 |
| `data/keywords.csv` | 키워드 대장 47행 | 커밋 |
| `data/stats/` | e-Stat 취득분 | ignore |
| `docs/api/*.md` | 조사한 API 스펙 3종 (法令API/パブコメ/e-Stat) | 커밋 |

---

## D. 법적·편집 안전장치 — 코드로 강제되는 것
1. **legalBasis 없는 published 기사 = 빌드 실패** (zod refine)
2. **면책문 전 페이지 푸터 고정** + 기사 말미 `<Disclaimer/>` 자동 삽입 (본문에 없어도)
3. `noticeLevel: draft-proposal` → 「改定案」 배너 자동 (「案」을 「決定」으로 오독 방지)
4. `/about`에 **자격상태(受験中) 명시**(2026-08-19 푸터에서는 제거 — 사용자 지시), `/contact`에 개별상담 불가 명시. 푸터의 면책문(개별상담·서류작성 불가 + 유자격자에게 의뢰 안내)은 전 페이지 고정 유지
5. `ConsultCta`는 `null` 반환 (Phase C까지 상담 CTA 물리적 부재), `LineCta`는 URL 없으면 「準備中」
6. `PrNotice` 컴포넌트 준비 (광고 도입 시 스테마 규제 대응)
7. sitemap·production 빌드에서 미공개 기사 자동 제외 → **사람이 status를 바꾸기 전엔 절대 공개되지 않음**

---

## E. 아직 없는 것 (2026-08-19 갱신)
- ~~계측 ID~~ → **GA4(G-MSE8ZDYPMB)·AdSense(ca-pub-…7558) 가동 중** (GitHub Variables 8/17 설정, 실사이트 태그 출력 확인 2026-08-19. ads.txt와 ID 일치). Clarity만 미도입
- `api/lead` LINE 연동, `src/lib/line.ts`, OG 이미지 생성, Pagefind 검색
- ~~도메인·원격·배포~~ → **Xserver 실배포 가동 중** / ~~e-Stat appId~~ → 실호출 완료(B-4) / ~~changedetection~~ → 네이티브 가동(TASK-04) / ~~daily-monitor~~ → 1일 2회 가동(B-6)
- 기사: **published 34건 / draft 1건** (2026-08-19 실측. 8/17 22건 일괄 공개 후 증분)
