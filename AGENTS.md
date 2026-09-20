# AGENTS.md — 코딩 에이전트용 프로젝트 규범

> Cursor / GitHub Copilot / Claude Code 공통. 작업 시작 전 이 파일을 먼저 읽을 것.

## ⚠️ 2026-09-20 프로젝트 전면 전환

본 프로젝트는 「行政書士ナビ・ジャーナル」(일본 행정서사 업무 전 분야를 다루는 종합 정보 미디어)에서
**일본 전국의 국가・지자체 보조금・조성금 정보를 지역별로 비교・안내하는 사이트**로 방향을 완전히 바꿨다.

- 마스터플랜・IA・편집가이드・법적 포지셔닝 문서는 v2로 재작성 완료 (`docs/00`~`06`).
- `docs/07`~`16` 은 v1(행정서사) 시절 운영 문서 — 상단에 경고 배너가 붙어 있으며, **새 작업의 근거로 쓰지 말 것.**
- `content/`(v1 기사 76건), v1 전용 스크립트・진단툴(`/tools/eiju-shindan`, `/tools/visa-navi`), 자동발행 파이프라인(`docs/16`)은 **삭제 대상**이나 아직 실제 삭제・코드 재작성은 진행 전이다. 이 파일을 읽는 에이전트가 다음 작업자일 가능성이 높다.
- `src/lib/sources/jgrants.ts`(jGrants 전국 보조금 API 연동), `http.ts`(공통 fetch・캐시)는 **예외적으로 보존・재활용** — 새 사이트의 핵심 데이터 인프라다.
- v1의 행정서사법 제19조 관련 제약(절대 규칙・CTA 격리 등)은 **더 이상 이 프로젝트의 핵심 리스크가 아니다.** 새 법적 포지셔닝은 `docs/06_LEGAL_COMPLIANCE.md` v2(완화판) 참조 — 단, 「개별 신청 대행을 시사하는 표현 금지」 한 줄은 유지된다.

## 프로젝트 개요

**全国補助金ナビ・ジャーナル (gyosei-navi, 리브랜딩 진행 중)** — 일본 전국의 보조금・조성금 정보를 지역별로 비교할 수 있게 정리하는 **일본어** 정보 미디어.

- 사이트 언어: **일본어 100%**
- 코드 주석・문서・커밋 메시지: 한국어 또는 일본어 (혼용 가능)
- 사용자와의 대화: **한국어**
- 타겟 독자: 국적・재류자격과 무관한 **일본 전국 거주 일반 주민**(개인・가구), 사업자 대상 보조금도 다룸. v1의 「재일 외국인」 페르소나는 폐기.

## 지금 해야 할 일

> 갱신: 2026-09-20. v1 시절 진행 상황(`published 75기사` 등)은 전부 무효.

**현황**: 문서 재설계, v1 콘텐츠・코드・데이터 정리, v2 스캐폴딩, MDX 콘텐츠 파이프라인 재구축, **5개 카테고리 전부 실제 published 기사 확보까지 완료.**
- `content/`(v1 기사 76건)・`prompts/`・v1 전용 라우트/컴포넌트/lib/scripts 삭제. `data/sources/`(v1 원문 36개)・`data/kanpo-text/`(82MB)・`data/keywords.csv`・`data/auto-rotation.json`도 정리 완료 — `data/`에는 `data/stats/`(e-Stat 캐시)와 v2 신규 원문(`data/sources/<slug>/`, 아래 참조)만 남음.
- `src/config/{site,taxonomy,regions}.ts`・`src/lib/content-schema.ts` v2 스키마로 재작성.
- `src/lib/content.ts`・`seo.ts`・`mdx.tsx`・`related.ts`를 실제 동작하는 로직으로 재구축(섹션: `subsidy`/`compare`/`news`).
- 신규 라우트 4종: `/subsidy/[category]/[slug]`, `/area/[pref]/[city]`, `/compare/[slug]`, `/news/[slug]`.
- `src/components/article/*` 8종(신규: `SubsidyInfoCard`, `CompareTable`).
- `validate-content`・`check-links`・`stale-report`・`new-article` 스크립트 v2 복원.
- **5개 카테고리 전부 published 기사 1건씩 확보** (2026-09-20). 전부 공식 정부 사이트 원문을 `npm run source`(HTML) 또는 직접 다운로드(PDF)로 취득해 근거로 삼았다:
  - `sogyo`: `jizokuka-hojokin-kyodo-kyogyo.mdx` — jGrants API(v2詳細). 원문 `data/sources/jizokuka-hojokin-kyodo-kyogyo/`
  - `jutaku`: `madorinobe2026.mdx` — 先進的窓リノベ2026事業(環境省). 원문 `data/sources/madorinobe2026/`
  - `kaigo`: `kaigo-hoken-jutaku-kaishuu.mdx` — 介護保険住宅改修費(厚生労働省). 원문 `data/sources/kaigo-hoken-jutaku-kaishuu/`(PDF는 gitignore 대상이라 로컬에만 있음, README에 재다운로드 URL 기재)
  - `energy`: `kyutou-shoene2026.mdx` — 給湯省エネ2026事業(経済産業省). 원문 `data/sources/kyutou-shoene2026/`
  - `shussan`: `shussan-ikuji-ichijikin.mdx` — 出産育児一時金(厚生労働省). 원문 `data/sources/shussan-ikuji-ichijikin/`
  - 각 `data/sources/<slug>/README.md`에 원문 근거표 + 「확인되지 않은 것」 섹션 정리 — 새 기사 쓸 때 이 형식을 그대로 따를 것.
- 5개 카테고리 개요용 Pillar draft(`*-hojokin-kanzen-guide.mdx`)는 여전히 **status: draft**(구조 검증용, 금액・URL 플레이스홀더) — published 전환 전 반드시 원문 확인 필요.
- **AGENTS.md 절대규칙 7 개정(2026-09-20)** — 원문 아카이브(`data/sources/`)는 여전히 가공 없이 정본 보관하지만, **기사 본문은 그 원문을 근거로 독자용으로 요약・재구성해도 된다**는 점을 명문화했다(수치・취지는 원문과 일치 필수).
- **지역 비교 페이지(`/area/`, `/compare/`) 실제 동작 확인** (2026-09-20). `docs/01` §5가 설계한 카테고리×지역 2축 + 지역횡단비교 구조를 처음으로 콘텐츠로 채웠다.
  - `src/config/regions.ts`에 도쿄도 5개 구(千代田・港・品川・世田谷・渋谷, 총무성 코드 기준) 등록.
  - `shussan` 카테고리에 5개 구별 출산급여 기사 신규 — 전부 각 구 공식 홈페이지 원문 취득. 제도 구조가 3패턴(실비연동형: 港区・千代田区 최대31만엔 / 정액형: 渋谷区 상한10만엔 / 2단조합형: 世田谷区 국가+구독자, 品川区 국가제도만 확인)으로 갈리는 것을 확인.
  - `content/compare/shussan-oiwaikin-tokyo23ku-hikaku.mdx` — 5개 구를 `compareTargets`로 참조하는 첫 `type: compare` 기사.
  - `/area/tokyo/{chiyoda,minato,shinagawa,setagaya,shibuya}` 5개 지역페이지, `/compare/shussan-oiwaikin-tokyo23ku-hikaku` 정상 생성, `CompareTable` 컴포넌트가 5개 구 데이터를 정확히 렌더링함을 빌드 산출물에서 확인.
- `npm run build` 정상 통과, published 기사 10건(카테고리별 1건 + shussan 지자체 5건 + compare 1건) 모두 정적 생성・검색 색인 확인.
- **헤더에 드롭다운 「特集」 메뉴 신설** (2026-09-20). `/compare/`(객관적 비교표) 와 역할을 분리해 `/tokushu/`(편집부가 순위를 매기는 콘텐츠, 예: 「子育てに手厚い市 TOP5」)를 신설. 카테고리는 `TOKUSHU_CATEGORIES`(taxonomy.ts)로 subsidy 카테고리와 별도 체계 — 향후 계속 추가하는 것을 전제로 설계, 지금은 `kosodate`(子育て支援) 1건만 등록. `type: tokushu` + `rankings` 필드(순위 최소5건 미만이면 빌드 실패 — DB 부족 상태의 추측 랭킹을 zod refine으로 원천 차단, `docs/01` §7.1). **실제 특집 기사(순위 콘텐츠)는 아직 0건** — 비교 가능한 지자체 데이터가 카테고리당 5건 이상 쌓인 뒤 작성하는 방침(사용자 확인 사항). 라우트 3종(`/tokushu`, `/tokushu/[category]`, `/tokushu/[category]/[slug]`), 헤더 드롭다운(`TokushuNavDropdown`, 클릭식・외부클릭/ESC로 닫힘)을 Playwright로 실제 클릭 동작까지 검증 완료.
- **(부수 발견) `src/lib/ads/` 계열이 별도 세션(라쿠텐 어필리에이트)에 의해 추가됨**(커밋 `bab33a9`). `ArticleView.tsx`・`mdx-components.tsx`에 `RakutenRelatedProducts`・`RakutenMotionWidget`이 자동 삽입되도록 연동돼 있다 — 이 프로젝트는 여러 세션이 동시에 작업할 수 있으므로, **작업 전 반드시 `git status`・`git log`로 최신 상태를 확인**하고 다른 세션이 만든 파일은 내용을 먼저 확인한 뒤 다루도록 주의할 것.
- **`workspace/`는 세션별 작업 완료 기록 폴더**(2026-09-20부터 운용, `.gitignore` 대상 — git에는 없음). 작업을 마치면 그 세션에서 생성/수정한 파일들의 스냅샷과 README(요청 내용・한 일・검증 결과)를 `workspace/<날짜>-<주제>/`에 남기는 관례가 있다. 새로 작업할 때도 이 관례를 따를 것.

**다음 우선순위**
1. **다른 카테고리(jutaku)에 지자체 단위 비교 확장** — `shussan`에서 검증한 「5개 구 원문조사→개별기사→compare기사」 패턴을 `jutaku`(주택리폼)에 적용. 지자체별 리폼 보조금은 실재하고 차액이 크므로 비교 페이지 효과가 큼. `sogyo`・`energy`・`kaigo`는 이미 국가 단위 제도를 다뤘으므로, 지자체 비교보다 jGrants 등에서 카테고리당 Cluster를 추가하는 쪽이 더 자연스러울 수 있음.
2. **`src/config/regions.ts`에 도쿄 23구 잔여 18개 구 및 타 도도부현 시구정촌 추가** — 현재 도쿄도 5개 구만 등록. 새 지자체 기사를 쓸 때마다 먼저 여기 등록.
3. jGrants 기반 기사를 또 쓸 때는 `fetchSubsidyDetail()` 원응답을 `data/sources/<slug>/`에 JSON 그대로 저장하는 절차(`sogyo` 기사가 선례)를 유지할 것.
4. **`shussan` 카테고리 지자체 데이터가 10건 이상 쌓이면 첫 特集 기사 작성 검토** — `kosodate`(子育て支援) 카테고리는 현재 `/compare/shussan-oiwaikin-tokyo23ku-hikaku`의 5개 구 데이터가 있지만, 「TOP5」류 순위 콘텐츠를 만들려면 순위를 매길 만한 차별화 포인트(금액 외 정성적 요소 포함 여부 등)를 먼저 편집 기준으로 정해야 함.
5. 실제 기사가 쌓이는 대로 `docs/05_CONTENT_CALENDAR.md`를 진행 상황에 맞춰 갱신.

**주의**:
- **draft 기사(Pillar 5건)에 적힌 금액・마감일・URL은 전부 플레이스홀더다.** 절대 그대로 published로 바꾸지 말 것 — 절대규칙 7(원문 확인 없이 쓰기 금지)・9(AI가 만든 수치 그대로 쓰기 금지) 위반이 된다.
- v1 시절 「기사를 쓴 제도는 감시 등록」 원칙은 보조금 마감・조건 변경 추종에도 유효한 발상이다 — 감시 체계 재구축 시 이 교훈을 계승할 것(`docs/10_MONITORING_REGISTRY.md` 상단 배너 참조). `prompts/monitor/`는 삭제됐으므로 새로 설계해야 한다.
- 일본어 문체 점검 시 `docs/04_EDITORIAL_GUIDELINE.md` §3.4(AI 특유 번역투・상투구 카탈로그, 2026-09-20 신설)를 참고할 것 — `github.com/coji/natural-japanese` 스킬의 검증된 패턴을 요약 반영했다.
- **배포 직후 라이브 사이트 확인 시 서버 캐시(`Cache-Control: max-age=600`, 10분)로 구버전이 잠깐 보일 수 있다.** 배포 워크플로가 success인데 반영이 안 된 것처럼 보이면, 먼저 캐시 우회 쿼리(`?_nocache=$(date +%s)`)로 재확인할 것 — 재배포를 시도하기 전에.

## 문서 우선순위

작업 전 반드시 읽을 것:

| 순위 | 문서 | 내용 |
|---|---|---|
| 1 | `docs/00_MASTER_PLAN.md` | ★ 마스터 기획서 v2 — 모든 판단의 상위 규범 |
| 2 | `docs/01_IA_TAXONOMY.md` | 카테고리×지역 이중 축 설계 — 코드 작성 전 필독 |
| 3 | `docs/06_LEGAL_COMPLIANCE.md` | 법적 포지셔닝 v2(완화판) — 여전히 넘으면 안 되는 선 |
| 4 | `docs/03_CONTENT_TEMPLATE.md` | frontmatter 스키마 설계안 — `content-schema.ts` 작성 시 기준 |
| 5 | `docs/04_EDITORIAL_GUIDELINE.md` | 기사를 쓸 때 |
| 6 | `docs/02_REPO_STRUCTURE.md` | 파일을 어디에 둘지 모를 때, v1 자산 처리 방침 |

`docs/07`~`16`은 v1 유산 문서다. 배너에 「재활용 검토」라고 적힌 것(10, 11, 15)만 참고하고, 나머지는 읽지 않아도 된다.

## 코드 정본 (문서보다 우선)

| 파일 | 역할 | 상태 | 변경 시 |
|---|---|---|---|
| `src/config/site.ts` | 사이트 설정・면책 문안 | **v2 작성 완료** | 승인 필요 |
| `src/config/taxonomy.ts` | 분류체계 정본 | **v2 작성 완료**(카테고리 5개 초안) | 승인 필요 + `docs/01` 정합 확인 |
| `src/config/regions.ts` | 지역 코드-슬러그 매핑 | **v2 작성 완료**(도도부현만, 시구정촌 미등록) | 승인 필요 |
| `src/lib/content-schema.ts` | frontmatter zod 스키마 | **v2 작성 완료**(subsidy 필드군 포함) | 승인 필요 |
| `src/lib/content.ts`, `seo.ts`, `mdx.tsx`, `related.ts` | MDX 로딩・렌더링・SEO 헬퍼 | **v2 작성 완료** — 실제 동작 확인됨 | 승인 필요 |
| `content/_TEMPLATE.mdx` | 기사 템플릿 | **v2 작성 완료** | 승인 필요 |
| `src/components/article/*` | 기사 렌더링 컴포넌트 | **v2 작성 완료**(`SubsidyInfoCard`・`CompareTable`・`TokushuRanking` 신규) | 통상 리뷰 |
| `src/components/layout/TokushuNavDropdown.tsx` | 헤더 「特集」 드롭다운(클라이언트 컴포넌트) | **v2 작성 완료** | 통상 리뷰 |
| `src/lib/sources/jgrants.ts`, `http.ts` | 전국 보조금 API 연동 | **v1 그대로 유효 — 재활용** | 변경 시 통상 리뷰 |
| `src/lib/ads/*`, `src/components/ads/*` | 楽天アフィリエイト 연동 | **다른 세션 작업(v2와 별개 계통)** | 이 파일들을 바꿀 때는 특히 `git log -- <path>`로 이력 확인 |

## 기술 스택

```
Node >= 20 / npm (pnpm 아님)
Next.js 15 App Router + React 19
Tailwind CSS v4
zod ^3.24  ← 외부 데이터는 전부 zod로 파싱
tsx        ← 스크립트 러너
경로 별칭  @/* → ./src/*
TypeScript strict: true
```

## 절대 규칙

1. **`any` 금지.** 외부 API 응답은 zod로 검증한다.
2. **시크릿 하드코딩 금지.** `.env.local`에서 읽고 `.env.example`에 키 이름만 추가.
3. **서버 전용 시크릿에 `NEXT_PUBLIC_` 금지.**
4. **엔드포인트를 추측으로 쓰지 말 것.** 공식 문서/Swagger를 열어 확인하고, 알아낸 스펙은 `docs/api/`에 기록한다.
5. **관공서 서버에 초당 1회 이상 요청 금지.** User-Agent를 명시한다.
6. **파싱 실패・미조사를 「0건(보조금 없음)」으로 처리 금지.** `subsidy.status: unresearched`로 명시하고 명확히 구분한다(`docs/01` §4.2, `docs/04` R9).
7. **원문 아카이브(`data/sources/`)는 정본 — 가공해서 「원문」이라고 저장 금지.**
   요약 도구(WebFetch 등)의 출력은 요약이지 원문이 아니므로 `data/sources/`에는 저장하지 않는다.
   HTML 페이지는 `npm run source`로 취득한다(태그만 제거하고 문자는 치환하지 않음). PDF는 직접
   다운로드해 읽는다. API 응답은 원 JSON을 그대로 저장한다(`sogyo` 기사 사례 참조).
   **기사 본문은 이 정본을 근거로 독자가 이해하기 쉽게 요약・재구성해도 된다** — 표・문체 변환・
   구조 재배열 등 형태는 자유롭되, 수치(금액・마감일・조건)와 취지는 원문과 정확히 일치해야
   하며 임의로 지어내거나 원문의 취지를 벗어나게 바꾸지 않는다.
8. **`sourceLinks`(구 `legalBasis`) 없는 기사는 published 불가** — zod 스키마가 빌드를 막는다. 우회하지 말 것.
9. **금액・마감일・조건 수치는 AI가 만든 값을 그대로 쓰지 않는다.** 원문 대조 100%(`docs/04` §7).

## 법적 포지셔닝 (v2, 완화판)

v1의 행정서사법 제19조 제약은 더 이상 핵심 리스크가 아니다. 여전히 지켜야 할 선은:

- ❌ **개별 신청서류의 작성・제출 대행을 시사하는 기능・문구** (유・무상 불문)
- ❌ 「반드시 받을 수 있습니다」「100%」 등 결과 보증 표현
- ❌ 「제 경우는 받을 수 있나요?」류 개별 질문에 개별 판정으로 답하기

상세는 `docs/06_LEGAL_COMPLIANCE.md` v2. v1에 있던 「行政書士 자칭 금지」・「CTA를 자격 취득 후 교체 가능하게 격리」 조항은 v2에서 해당 없음으로 삭제됐다.

## 커맨드 (v2 정리・복원 완료)

```bash
npm run dev
npm run build
npm run validate:content   # 전 기사 frontmatter 검증 (섹션: subsidy/compare/news 기준)
npm run check:links        # sourceLinks + subsidy.applyUrl 생존 확인
npm run stale               # 6개월 미갱신 + 募集期限 경과(subsidy.status: open인데 periodEnd 경과) 리포트
npm run new:article -- --section subsidy --category shussan --slug <slug> --type cluster   # 템플릿에서 기사 생성
npm run subsidies   # jGrants 국가 보조금 신착 감시 (scripts/watch-subsidies.ts, v1에서 그대로 계승)
npm run stats -- --search "<검색어>"   # e-Stat 통계 (ESTAT_APP_ID 필요)
npm run source -- --url <URL> --out data/sources/<topic>/NN_<name>.txt   # 一次情報 페이지 원문 취득
```

> `law`・`monitor`・`pubcomment`・`rotate:next`(법령조문취득・一次情報감시・パブコメ감시・자동발행로테이션)는 v1 도메인에 깊이 결합돼 있어 삭제된 채로 남아 있다. 감시 체계가 필요해지면 `docs/10_MONITORING_REGISTRY.md`의 교훈을 참고해 새로 설계할 것.

API 스펙은 `docs/api/*.md`에 조사 결과가 있다. **엔드포인트를 새로 쓸 때는 반드시 거기부터 읽고, 없으면 공식 문서를 열어 확인 후 추가한다.**

## 자동 발행 파이프라인 — 정지 상태

v1의 자동 발행 파이프라인(`docs/16_AUTO_PUBLISH_PIPELINE.md`)은 폐기 대상이다. Windows 작업 스케줄러에 `GyoseiNavi-AutoPublish` 작업이 등록돼 있는지 확인했으며(2026-09-20 시점 **미등록** 확인됨), 향후 재등록 여부는 파이프라인 재구축 결정 이후로 미룬다.
