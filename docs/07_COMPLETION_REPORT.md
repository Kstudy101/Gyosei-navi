# 작업지시서 #07 완료 보고

> 보고일: 2026-08-17 / 수행: Claude Code / 양식: `docs/07_DATA_PIPELINE_WORKORDER.md` §5

## 요약

| 태스크 | 상태 | 비고 |
|---|---|---|
| TASK-01 e-Gov 法令API 래퍼 | ✅ 완료 (AC 7/7) | 실호출 검증 완료 |
| TASK-02 一次情報 변경 감지 | ✅ 완료 (AC 7/7) | 8소스 베이스라인 기록, 오탐 0 |
| TASK-03 퍼블릭코멘트 감시 | ✅ 완료 (AC 4/4) | **永住ガイドライン改定案 案件 발견 → 원문 PDF 3종 확보** |
| TASK-04 changedetection.io | ✅ 실기동 완료 (AC 3/3, 2026-08-18) | pip판 네이티브 실행·시작프로그램 자동기동·ntfy 알림 실측·감시 10건 가동. infra/changedetection/README §5 |
| TASK-05 e-Stat 래퍼 | 🟡 골격 완료 (AC 1/3) | appId 발급(사용자) 후 실호출 검증 필요 |
| TASK-06 GitHub Actions | 🟡 파일 완비 (AC 미검증) | 원격 리포 연결 후 workflow_dispatch 로 검증 |
| TASK-07 키워드 대장 | ✅ 초기 47행 시드 | 수동 컬럼은 운용 시 채움 |

**★ 부수 성과 (기사 검수에 직결)**: 파이프라인이 파악한 一次情報로 마스터 플랜·기사 초안의 오류 2건을 발견 — ① パブコメ 締切은 **9月4日0時0分**(「24時」아님) ② 연수입 요소는 **2026年10月 선행 시행**(나머지 2027年4月). 상세: `data/sources/pubcomment-315000140/README.md`

---

## TASK-01 완료 보고 — e-Gov 法令API 래퍼

- **생성/변경 파일**
  - `src/lib/sources/http.ts` (공통 HTTP: UA·1초 간격·캐시·HttpError)
  - `src/lib/sources/jp-number.ts` (漢数字 변환)
  - `src/lib/sources/egov-law.ts` (searchLaws / resolveLawId / getLaw / getArticle / toLegalBasis / toMdxQuote)
  - `scripts/fetch-law.ts` (CLI) / `package.json` `"law"` 스크립트
  - `docs/api/egov-law-api.md` (조사 결과)
- **실행 확인 커맨드**
  - `npm run law -- --law "行政書士法" --article 19` → 第十九条（業務の限制） 1·2項 원문 + 出典 링크 출력 ✔
  - `--law "出入国管理及び難民認定法" --article 22` → 第二十二条（永住許可） 4項 + 号(一·二) 정확 ✔
  - `--article 19-3` (枝番) → 第十九条の三 ✔ / `--article 22 --paragraph 2` → 2項만 ✔
  - `--article 999` → `✖ … e-Gov API 400: 要素（elm）に合致する要素が法令本文に存在しません。` exit 1 ✔
  - `--law "書士法"` → 부분일치 7건 나열 후 정식명칭 요구, exit 1 ✔
  - `--legal-basis` → frontmatter YAML 3줄 출력 ✔
- **AC**
  - [x] 제19조 원문 정확 출력
  - [x] 없는 조문 → 명확한 에러 + exit 1
  - [x] zod 파싱, 불일치 시 실패 (light JSON은 관대한 트리 스키마 + 재귀 추출)
  - [x] `.cache/egov/` 24h 캐시 (재호출 0.7초, 네트워크 미발생)
  - [x] 요청 간 1초 (http.ts 전역 직렬화)
  - [x] sourceUrl 유효 (`https://laws.e-gov.go.jp/law/326AC1000000004#Mp-At_19` HEAD 200)
  - [x] `docs/api/egov-law-api.md` 기록
- **조사해서 알아낸 사실**: Swagger UI의 실제 스펙 파일은 `/api/2/swagger-ui/lawapi-v2.yaml`. Base `https://laws.e-gov.go.jp/api/2`, 엔드포인트 6종. 조 단위 취득은 `law_data/{id}?elm=MainProvision-Article_19&json_format=light`. `law_title` 은 부분일치라 완전일치 우선 로직 필요. 行政書士法 = `326AC1000000004`, 入管法 = `326CO0000000319`.
- **남은 이슈**: v1 폴백 미구현(v2로 전 요건 충족). `asOf`(시점 지정)는 파라미터 전달만 하고 미검증. 條文 앵커 형식(`#Mp-At_19`)은 法令検索 사이트 관례라 개편 시 재확인.

## TASK-02 완료 보고 — 一次情報 변경 감지

- **생성/변경 파일**: `src/lib/sources/monitor.ts`, `src/lib/sources/github-issue.ts`, `scripts/monitor.ts`, `prompts/monitor/sources.yaml`(스키마 확장·URL 정정), `.gitignore`(.cache/)
- **실행 확인 커맨드**
  - `npm run monitor` 1회차 → 8건 「初期化完了」 ✔ / 2회차 → 「変更なし」만 출력 (노이즈 0) ✔
  - 상태 파일 해시 조작 후 `--id isa-eiju-guideline --dry-run` → ★変更 + 신규 링크 1 + 追加行 20줄 diff 출력, **상태 파일 미갱신** 확인 ✔
- **AC**: 7/7 ([x] 초기화 / [x] 변경 없음 / [x] 변경 감지+diff / [x] 오탐 억제(날짜·시각·令和·HEX·세션ID 정규화 + ignoreSelectors) / [x] 개별 실패 격리(1회차에 3건 에러가 나도 나머지 5건 정상 처리됨을 확인) / [x] 1초 간격 / [x] dry-run)
- **조사해서 알아낸 사실**
  - 입관청 사이트는 `<main>` 없음, 본문은 `#contentsArea`. **HTTP 리다이렉트 대신 `<meta refresh>` 를 다용** → `fetchFollowingMetaRefresh` 로 최대 3단 추적 구현
  - 永住ガイドライン 실제 페이지: `/isa/applications/resources/nyukan_nyukan50.html` (「令和８年２月２４日改訂」판 게재 중). 手続 페이지: `/isa/applications/procedures/eizyuu_00001.html`
  - 총무성 行政書士 페이지 이동: `/main_sosiki/jichi_gyousei/gyouseishoshi/index.html`
  - jGrants 는 Angular SPA → 정적 취득 본문 0자 → `enabled: false`, TASK-04 로 이관
- **남은 이슈**: 초기 1주 `--dry-run` 권장(작업지시서 지침). GitHub Issue 기표는 `gh` CLI 의존(로컬은 `gh auth login` 필요, Actions는 자동).

## TASK-03 완료 보고 — 퍼블릭코멘트 감시

- **생성/변경 파일**: `src/lib/sources/pubcomment.ts`, `scripts/watch-pubcomment.ts`, `docs/api/egov-pubcomment.md`, `data/sources/pubcomment-315000140/` (PDF 3종 + README)
- **실행 확인 커맨드**: `npm run pubcomment -- --dry-run --pages 5` → RSS 6 + 목록 100 → 95건 → 키워드 일치 5건, ★緊急 1건 D-7 표시 ✔ / 정식 실행 후 2회차 → 「新規案件なし」 ✔
- **AC**: 4/4 ([x] 신규만 / [x] D-day JST 계산 / [x] D-7 이하 ★緊急 상단 / [x] RSS `<channel>` 부재·목록 `totalPage`/`li` 부재·항목 필드 결손 시 throw)
- **조사해서 알아낸 사실**: 공식 RSS 존재(`/rss/pcm_list.xml`, 최신 6건). 목록 서블릿 `POST /servlet/Public CLASSNAME=PCMMSTLIST&Page=n` 은 무상태 페이지네이션 가능(148p). **서버측 keyword 검색은 세션 의존이라 무상태 호출로 0건** → 클라이언트 필터 채택. 첨부 PDF는 `/pcm/download?seqNo=…`.
- **남은 이슈**: 目록 순회는 기본 3페이지(60건). 신착이 하루 20건을 넘는 날은 드물지만 CI는 `--pages 5`.

## TASK-04 완료 보고 — changedetection.io

- **생성 파일**: `infra/changedetection/docker-compose.yml`, `.env.example`, `README.md`, `watchlist.md`
- **AC**: [x] compose 완비 / [x] README 절차 / [ ] **알림 실동작 — 사용자 환경에서 「Send test notification」 필요**
- **조사**: LINE Notify 2025-03-31 종료 확인. 대체는 이메일(SMTP, 1순위) / Discord·Slack Webhook / LINE Messaging API(Phase 1 공식계정 후 자체 Webhook 중계). Apprise URL 형식을 README에 기록.

## TASK-05 완료 보고 — e-Stat

- **생성 파일**: `src/lib/sources/estat.ts`, `scripts/fetch-stats.ts`, `docs/api/estat-api.md`, `.env.example`(ESTAT_APP_ID)
- **AC**: [x] appId 미설정 → 안내 3단계 + exit 1 / [ ] 데이터 저장(`data/stats/`) — 코드 완비, appId 발급 후 검증 / [ ] 출처 메타 — `.meta.json` 코드 완비
- **조사**: API 3.0, `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsList|getStatsData`, `RESULT.STATUS` 100+ 가 오류(HTTP 200이어도). 1건/다건이 객체/배열로 갈리는 JSON 특성 → `oneOrMany` 정규화.

## TASK-06 완료 보고 — GitHub Actions

- **생성 파일**: `.github/workflows/daily-monitor.yml`
- **사양 충족**: cron `0 23 * * *`(JST 08:00) / `workflow_dispatch`(dry_run 입력) / monitor + pubcomment / 변경·신규 시에만 Issue(`content-opportunity`, `priority:P0|P1`) / `.cache/` 를 actions/cache restore-keys 로 유지 / 실패 시 `monitoring-failure` Issue
- **AC**: 원격 리포 미연결이라 **미검증**. 연결 후 `workflow_dispatch` 1회 → 「初期化」, 2회 → Issue 0건 확인 필요.

## TASK-07 완료 보고 — 키워드 대장

- **생성 파일**: `data/keywords.csv`(47행: taxonomy seed 41 + 기사 targetKeywords 6), `scripts/seed-keywords.ts`, `docs/08_KEYWORD_RESEARCH.md`
- 재실행 idempotent (신규 0) ✔. 수동 컬럼(volume_est 등)은 운용 루틴에서 채움.

---

## 추가 보고 (2026-08-17 후반) — sources.yaml v2.1 대응 / TASK-05 검증 / 기사 2건

- **sources.yaml v2.1 (83소스, docs/10) 대응**: `monitor.ts` 스키마에 `method/status/publishPriority/frequencyHint/baseUrl/docUrl/related` 명시, `deadUrls` 로드 시 거부, `method!=diff` 자동 제외, 리포트에 「未検証」·「希望頻度」 배지, moj.go.jp 에 `#contentsArea` 자동 적용, `nav/header/footer/aside/time` 상시 제거, 링크 캐시버스터(`?1786951130`, `?v=`) 정규화
  - 실측: enabled diff 70건 → 68건 베이스라인 / 2건 403(中小企業庁·経産省 → `status: blocked, enabled: false`) / 2회차 오탐 1건(大阪会 캐시버스터) → 수정 후 3회 반복 오탐 0
  - v2.1 자체 오류 정정: `isa-eiju-guideline` URL(구 `/guide/` → 手続一覧으로 튀던 것)을 `nyukan_nyukan50.html` 로, note 締切을 9/3 必着으로. `isa-eiju-procedure`, `isa-ikusei-shuro-unyo` 추가
  - docs/10 TASK-03 확인: RDF 파싱 ✔ / 키워드 병행 ✔ / **1일 2회** → daily-monitor.yml cron 2개(08:00·20:00 JST)로 변경
- **TASK-05 e-Stat**: 사용자 appId 발급 → 실호출 검증 완료 (AC 3/3). `data/stats/0004019020.*` 저장 확인
- **기사 초안 2건 추가** (status: review): `eiju-guideline-kaitei-genbun-taisho`(#2 原文対照, 관련 案件 315000141·315000139 원문 확보·대조), `eiju-nenshu-yoken-setai`(#3 年収要件)
- **GA4/Clarity 스크립트** `src/components/seo/Analytics.tsx` (production + ID 있을 때만 출력) → layout 삽입
- docs/10 신규 TASK-08(jGrants)·TASK-09(官報)·TASK-10(RSS) — ✅ 전부 완료 (아래)

## TASK-09 완료 보고 — 官報 일일 아카이빙 (2026-08-17)

- **생성**: `src/lib/sources/kanpo.ts`, `scripts/archive-kanpo.ts`, `.github/workflows/kanpo-archive.yml`, package.json `kanpo`, deps `pdfjs-dist`
- **실측 구조**: 톱페이지(index.html)에 직근 90일 색인 평면 나열 / 号URL `{YYYYMMDD}{種別h·g·c·t·m}{5자리}` / PDF `…/pdf/{id}full{NNNN}{PPPP}.pdf`. pdf-parse는 CID 폰트 깨짐 → pdfjs-dist(legacy)+CMap으로 해결 (Windows는 경로를 /구분·말미/ URL형으로)
- **설계**: 멱등 키 = data/kanpo-text/ 텍스트 파일 존재 (리포가 상태) → 7일 백필 창으로 결측 자기복구 / PDF 원본은 Release 자산(kanpo-YYYY-MM)으로 영구화(리포 비대화 방지) / 추출 텍스트는 리포 커밋 → `npm run kanpo -- --search 키워드`로 과거분 검색
- **AC 실측 (2026-08-17)**: [x] 당일 4号(本紙32p·号外80p·政府調達72p·特別号外4p) 취득·텍스트 추출 성공 [x] 매일 자동 = kanpo-archive.yml cron 09:00 JST [x] 실패 시 monitoring-failure Issue (외 90일 영구손실 경고 문구) [x] 검색: 「建設業」19건 히트 확인
- **주의**: 목차의 한자 숫자·일부 문자 배열은 PDF 레이아웃 순서라 완벽하지 않음 — 키워드 검색 목적으로는 충분

## TASK-08 완료 보고 — jGrants 보조금 감시 (2026-08-17)

- **생성/수정**: `src/lib/sources/jgrants.ts`, `scripts/watch-subsidies.ts`, `docs/api/jgrants-api.md`, package.json `subsidies`, daily-monitor.yml 편입(신규 시 Issue·실패 시 monitoring-failure)
- **사양**: keyword 필수(전건 파라미터 부재) → 광역 7어 화집합(실측 296건, 조사시점 208→증가) / v2 상세 zod 파싱(granttype nullable·workflow 배열·첨부 data(base64)는 name만 보존) / `.cache/subsidies-seen.json` dedup / 締切 승순·D-7 이하 ★緊急 / 초회 베이스라인만 / 일부 키워드 실패는 경고·전멸은 에러 / 1초 간격은 http.ts 전역 스로틀
- **AC 실측 (2026-08-17)**: [x] 목록 296건 취득 [x] 2회차 신규 0·재출력 없음 [x] 신착 재현 → ★緊急 D-6 리포트 + v2 상세(補助率 1/2以内) 취득 [x] 요청 간 1초 [x] jgrants-api.md 실측 스키마 기록
- **채택 판단**: 공식 MCP 서버(Python)는 TS/npm 리포에 embed하지 않고 API 직접 호출 (docs/10 상정대로)

## TASK-10 완료 보고 — RSS 파서 분기 (2026-08-17)

- **생성/수정**: `src/lib/sources/rss.ts`(신규), `src/lib/sources/monitor.ts`(CheckResult.rssItems + 리포트 「新着記事」), `scripts/monitor.ts`(method 분기), sources.yaml rss 9건 `enabled: true`
- **사양**: RSS 2.0·RDF 양대응(cheerio xml) / guid∥link 키로 `.cache/rss-seen.json` dedup(소스당 500키 상한) / keywords는 title+description 부분일치 필터(비매칭 신규도 기지 처리) / pubDate·dc:date → ISO 정규화 / item 0건·파싱 실패는 명시적 에러 / 초회는 베이스라인만(신착 미보고)
- **AC 실측 (2026-08-17)**: [x] RDF(mlit·mhlw·caa·e-Gov 결과공시·카테고리) + RSS2.0(moj·日行連·デジ庁·ミラサポ) 9피드 전부 파싱 [x] 2회차 재출력 0 [x] 신착 재현 테스트에서 ★変更 리포트 + 직후 재실행 変更なし [x] moj-news 키워드 필터 동작(비매칭 신착 → 変更なし) [x] diff 소스 회귀 없음(P0 배치 혼합 실행 정상)
- **비고**: `egov-pubcomment-all`은 watch-pubcomment.ts 담당이므로 계속 disabled. CI 첫 실행 시 rss 9건은 1회 初期化 후 정상 가동

## 추가 보고 (2026-08-17 저녁) — GitHub 원격 연결 · TASK-06 원격 검증

- **리포**: `https://github.com/Kstudy101/Gyosei-navi` (private). gh CLI(winget 설치) + `gh auth setup-git` 로 비대화형 push. 워크플로 4종 등록 확인
- **CI**: push 트리거 성공 (validate:content + build)
- **Deploy to Xserver**: 빌드·out/ 검증까지 성공. Secrets 미등록 시 FTP 단계 **스킵**하도록 보강(계약 전 실패 노이즈 방지) → 성공
- **TASK-06 Daily Monitor 원격 실검증** (workflow_dispatch 2회):
  - monitor: 68소스 초기화 → 2회차 캐시 복원·変更なし ✔ (AC「.cache 유지」충족)
  - **발견**: e-Gov パブコメ 목록 서블릿이 **GitHub 러너(해외 IP)에서 HTTP 403**. RSS는 정상 → 목록 실패 시 RSS만으로 판정하고 리포트에 ⚠ 명시하도록 강등 처리 (RSS도 실패하면 여전히 hard fail). 하루 2회 폴링이므로 RSS(최신 6〜7건)만으로도 신착 포착 가능. 완전 백필이 필요하면 일본 IP 셀프호스트 러너 또는 로컬 cron 병행
  - Issue 라벨 6종 생성 + 워크플로에서 `gh label create --force` 로 보장. 첫 실행은 「新規」로 보고하지 않도록 수정 (Issue #1 은 초기화 아티팩트로 close)
  - AC: [x] workflow_dispatch [x] 변경 없는 날 Issue 0 (2회차 확인) [x] .cache 유지

## 추가 보고 (2026-08-20) — Month 4 발행 · 품질 인프라 3건 · 본번 배포

> 커밋 `b411da7`〜`e6cb363` (15건). 배포 run **32328048664** 성공 (2026-08-20 03:24 UTC).

### 1. Month 4 콘텐츠 (#29〜#37, 9건) — 초안 → 검수 → 발행 완료

- pillar 2 (日本人の配偶者等 / 帰化申請), tool 1 (在留資格判定ナビ 소개), cluster 5
  (家族滞在 / 定住者 / 離婚6ヶ月ルール / 高度専門職·J-Skip / 特定活動46号), checklist 1 (配偶者ビザ 書類 + DL CSV)
- 발행일은 전건 **2026-08-20**
  - ⚠️ 당초 08-20〜09-08로 「분산」했으나 **오늘(08-20)보다 미래여서 부적절** → 사용자 지적으로 같은 날 시정.
    과거로 분산하는 안도 불가: Month 4는 Month 3(08-19)을 다수 인용하므로 앞당기면 내부링크가 미래를 가리키게 되고,
    오늘 취득한 원문의 `accessedAt: 2026-08-20` 보다 발행일이 빨라져 인용 관계가 모순된다.
    **교훈: 발행일 분산은 「과거 방향으로, 인용 하한을 지켜서」만 가능하다. 미래 날짜는 어떤 경우에도 불가.**
- 누적 **61기사**. 리드 마그넷 2종 확보 (Phase 1 목표 3종 중)
- 계획은 `docs/05_CONTENT_CALENDAR.md` Month 4 절에 기록

### 2. `npm run check:links` 복구 + 링크 절단 2건 수정

- **버그**: top-level await + CJS 변환 충돌로 **스크립트가 아예 실행 불가 상태**였음 → `async main()` 래핑으로 복구
- 개선: 중복 URL 제거(202→고유140건) / **호스트별 1초 간격 직렬화**(절대규칙5) / 응답 본문 즉시 cancel /
  `process.exit()` → `process.exitCode`(Windows+Node24 fetch 핸들 충돌 회피) / UA 구명칭 gyosei-times → gyosei-navi
- **복구 직후 첫 실행에서 published 기사 2건의 一次情報가 404 검출**.
  特定技能運用要領이 令和8年8月20日자 개정으로 본체 PDF URL 변경 (001460079 → 001468647)
  - 신구대조표 23항목 전건 확인 → **2호 신설 요건**(지도·관리 업무 종사 및 분야별 대상자수 이상 지도, 誓約書 참고양식 제1-32호)을
    `tokutei-gino-1go-2go-zentaizo` 본문에 반영. 11분야·파견가능분야는 시점표기만 삭제되고 내용 불변임을 확인
  - 양쪽 기사 changelog에 정정 기록 (docs/04 §6)
- 현재 **고유 140건 / 죽은 링크 0건**

### 3. 감시 레지스트리 — 特定技能 공백 해소 (95 → 98건)

위 링크 절단의 근본 원인. 기사 클러스터의 중핵인데 **特定技能 관련 소스가 0건**이었음.

| id | 대상 | 우선도 |
|---|---|---|
| `isa-tokutei-gino-unyo` | 特定技能運用要領 일람 (개정 시 PDF URL이 바뀌므로 일람 페이지를 감시) | P0/daily |
| `isa-tokutei-gino` | 在留資格「特定技能」 | P0/daily |
| `isa-tokutei-gino-bunya` | 基本方針·分野別運用方針 | P1/weekly |

3건 모두 실지 취득 확인(본문 7,396 / 5,742 / 1,923자). 경위·재발방지는 `docs/10` §6-2.
※ bunya는 처음 추정한 URL(00135)이 오답 → 공식 일람에서 00132 확인 후 리다이렉트 최종 경로로 교정 (절대규칙4)

### 4. 【신규】 `npm run source` — 一次情報 원문 취득 (`scripts/fetch-source.ts`)

- **배경**: Month 4 집필 시 WebFetch가 요약본만 반환해 필요서류 등을 verbatim으로 확보하지 못하고
  「검수 시 원문 재확인 필요」로 남겨둔 부채가 있었음
- **사양**: cheerio로 태그만 제거하고 **문자는 일절 치환하지 않음**(절대규칙7).
  `monitor.ts`의 `extract()`는 差分검지용으로 `normalizeText()`가 날짜를 `<DATE>`로 치환하므로 원문 저장 불가 → 별도 구현.
  본문 200자 미만이면 실패(절대규칙6) / UA 명시·복수 URL 1초 간격(절대규칙5) / PDF는 명시적 거부
- **성과**: 一次情報 9건 원문 취득 → 대조 결과 **5건에서 부정확성 발견·정정**

| 기사 | 정정 내용 |
|---|---|
| #29·#37 配偶者 | **과세·납세증명서 명의자를 「配偶者」→「申請人の滞在費用を支弁する方」로 정정**(최대). 戸籍謄本=全部事項証明書, 마이넘버 생략, 스냅사진 앱가공 불가, 간이서류 우표, 3개월 이내 요건. DL CSV v2 |
| #32 家族滞在 | 定住者/特定活動 각 루트 요건 누락 보정(공적의무 이행, 특정활동측 계속재류). N2가 특정활동 한정임을 명확화 |
| #33 定住者 | 日系3世 일본어요건을 B1상당 이상 구체기준(N2/N3+104점/BJT400점) + 시험 이외 경로 + 미성년 제외까지 정밀화 |
| #31 帰化 | 「표준처리기간 미공표」→ 원문은 審査基準·標準処理期間·不服申立方法이 전부 「ありません」(**미공표가 아니라 미설정**) |
| #35 高度専門職 | 대조 결과 수치 전건 일치, 정정 없음 |

- 재발 방지로 **AGENTS.md 절대규칙 7에 원문 취득 방법을 명문화**
- 잔여 미확보 1건: 定住者告示(平成2년 법무성고시 132호) 본문 — e-Gov JS렌더링으로 취득 불가.
  기사는 号번호를 단정 인용하지 않고 「告示で定める類型」으로 일반화 서술 중

### 5. 배포 검증 (2026-08-20)

- rsync 501파일 동기화. CI(validate+build)·Deploy 모두 성공
- 라이브 실측 **12 URL 전건 HTTP 200** (신규 9기사 + /tools/visa-navi + DL CSV + OG 이미지)
- 정정 내용이 실제 배포본에 반영됐음을 문자열 단위로 확인(「滞在費用を支弁する方」)
- 검증: `validate:content` 61건 0오류 0경고 / `check:links` 죽은 링크 0건 / `stale` 6개월 미갱신 0건

### ⚠️ 이번 작업에서의 실수 기록

`npm run monitor` 첫 실행 시 출력을 grep으로 필터링했는데 **변경 보고 헤더가 일본어(「変更検知」)라 패턴에 걸리지 않았다.**
그 실행에서 기존 소스에 변경이 있었다면 보고를 놓쳤고, 베이스라인이 갱신되어 재보고되지 않는다.
`.cache/`는 git 미추적이라 복원 불가. 이후로는 `npm run monitor -- --report <파일>` 로 리포트를 파일에 남기는 방식 사용.

---

## 다음 사람에게 넘기는 것 (우선순위순)

1. **기사 초안 2건 검수·수정** — `data/sources/pubcomment-315000140/README.md` 의 차이점 5개 반영 (締切 0時 / 연수입 10月 선행 시행 / 누락 포인트) → legalBasis 를 案件 직링크로 교체 → `status: published`
2. GitHub 원격 리포 + Vercel 연결 → `daily-monitor.yml` 수동 실행 검증
3. e-Stat appId 발급 → `npm run stats -- --search 在留外国人` 첫 검증
4. Docker 환경에서 changedetection 기동 → 이메일 알림 테스트
5. `prompts/monitor/sources.yaml` 의 育成就労 전용 페이지 URL 확정
