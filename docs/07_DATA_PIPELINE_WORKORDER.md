# 작업지시서 #07 — 자료수집 파이프라인 구축

> **발주**: 총괄 편집장 / **수행**: IDE 코딩 에이전트 (Cursor / Copilot / Claude Code)
> **작성일**: 2026-08-17 / **버전**: v1.0
> **상위 문서**: `docs/00_MASTER_PLAN.md` §8 (운영 시스템 — AI 파이프라인)

---

## 0. 이 작업의 목적

마스터 기획서의 차별화 축 ①「一次情報 최속 해설」을 **사람의 근성이 아니라 시스템**으로 만든다.

편집 규범(`docs/04_EDITORIAL_GUIDELINE.md` R1)은 「一次情報 링크가 없는 기사는 발행 금지」다.
이걸 매번 수작업으로 하면 부업 운영에서 3개월 안에 무너진다.
따라서 **법령 원문 취득과 제도 변경 감지를 자동화**하는 것이 이 작업지시서의 전부다.

### 완료 시 달성되는 상태

1. 법령 ID를 넣으면 **조문 원문이 자동으로 기사에 삽입**된다.
2. 감시 대상 관공서 페이지가 바뀌면 **하루 안에 알림**이 온다.
3. 퍼블릭코멘트가 새로 뜨면 **놓치지 않는다.**
4. 기사의 `legalBasis` 필드가 반자동으로 채워진다.

---

## 1. 전제 — 현재 리포지토리 상태

```
프로젝트명   gyosei-times (行政タイムズ)
런타임       Node >= 20
패키지 매니저 npm  ※ pnpm 아님. 문서에 pnpm이라 적힌 부분은 npm으로 읽을 것
프레임워크   Next.js 15 (App Router) + React 19
스타일       Tailwind CSS v4
검증         zod ^3.24
스크립트 러너 tsx
경로 별칭    @/* → ./src/*
TS           strict: true
```

이미 존재하는 것 (건드리지 말 것):
- `src/config/site.ts`, `src/config/taxonomy.ts` — 설정 정본
- `src/lib/content-schema.ts` — frontmatter zod 스키마
- `content/_TEMPLATE.mdx` — 기사 템플릿
- `prompts/monitor/sources.yaml` — 감시 대상 정의 (**본 작업에서 확장**)

---

## 2. 공통 규약 (전 태스크 적용)

| # | 규약 |
|---|---|
| C1 | TypeScript strict 준수. `any` 금지. 외부 응답은 **반드시 zod로 파싱**한다. |
| C2 | 시크릿 하드코딩 금지. `.env.local`에서 읽고, `.env.example`에 키 이름만 추가한다. |
| C3 | 서버 전용 시크릿에 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. |
| C4 | 스크립트는 `scripts/` 아래, 재사용 로직은 `src/lib/sources/` 아래에 둔다. |
| C5 | 외부 API 호출에는 **User-Agent 헤더**를 명시하고, 요청 간 **최소 1초 간격**을 둔다. (관공서 서버에 부담을 주지 않는다 — 공식 이용조건) |
| C6 | 네트워크 실패는 삼키지 말고 **명확히 로그**하고 종료 코드 1로 실패시킨다. |
| C7 | 캐시·상태 파일은 `.cache/` 아래. `.gitignore`에 추가한다. |
| C8 | **엔드포인트를 기억이나 추측으로 쓰지 말 것.** 반드시 공식 문서/Swagger를 먼저 열어 실제 스펙을 확인하고 구현한다. (§9 참조) |

---

## TASK-01 — e-Gov 法令API 래퍼 【최우선】

### 목적
법령 조문 원문을 프로그램으로 가져와 기사 집필 시 그대로 인용할 수 있게 한다.
**9월 4일 퍼블릭코멘트 마감 기사 집필에 즉시 투입되므로 이 태스크가 1순위다.**

### 사전 조사 (필수 — 구현 전에 반드시 수행)
1. `https://laws.e-gov.go.jp/api/2/swagger-ui/` 를 열어 **Version 2의 실제 엔드포인트·파라미터·응답 스키마를 확인**한다.
2. 확인한 스펙을 `docs/api/egov-law-api.md` 에 요약해 남긴다. (다음 사람이 다시 조사하지 않도록)

### 알려진 사실 (조사 시 대조용)
- 인증 불필요, API 키 불필요, 무료
- Version 2는 2025-03-14 릴리스. 특정 시점의 조문 취득, 폐지 법령 검색, 본문 파일 다운로드가 추가됨. 데이터는 2017-04-01 이후 대응
- Version 1은 「当面の間」 계속 이용 가능 (`/api/1/lawlists/{category}`, `/api/1/lawdata/{lawId}`, `/api/1/keyword`)
- **v2를 우선 사용하되, v2에 없는 기능은 v1로 폴백**한다
- 이용조건: 단시간 대량 요청 금지

### 산출물
```
src/lib/sources/egov-law.ts      래퍼 본체
src/lib/sources/egov-law.test.ts 테스트 (선택이지만 권장)
scripts/fetch-law.ts             CLI
docs/api/egov-law-api.md         조사 결과 요약
```

### 인터페이스 사양
```ts
// src/lib/sources/egov-law.ts

/** 법령 검색 */
export async function searchLaws(params: {
  keyword?: string;
  lawTitle?: string;
  /** 특정 시점의 법령을 취득 (YYYY-MM-DD). 미지정 시 현행 */
  asOf?: string;
}): Promise<LawSummary[]>;

/** 법령 전문 취득 */
export async function getLaw(lawId: string, asOf?: string): Promise<LawDocument>;

/**
 * 조문 단위 취득 — 기사 인용의 핵심 함수
 * 예: getArticle("行政書士法", "19") → 제19조 원문
 */
export async function getArticle(
  lawIdOrTitle: string,
  articleNumber: string,
  opts?: { paragraph?: string; asOf?: string }
): Promise<{
  lawTitle: string;      // 法令名
  lawNumber: string;     // 法令番号 (예: 昭和二十六年法律第四号)
  articleTitle: string;  // 条見出し
  text: string;          // 条文原文 (プレーンテキスト)
  sourceUrl: string;     // e-Gov 法令検索の該当条文URL ← legalBasis에 그대로 사용
  retrievedAt: string;   // ISO8601
}>;

/** frontmatter의 legalBasis 항목을 바로 생성 */
export function toLegalBasis(a: Awaited<ReturnType<typeof getArticle>>): {
  label: string;      // "行政書士法 第19条（業務の制限）"
  url: string;
  accessedAt: string; // YYYY-MM-DD
};
```

### CLI 사양
```bash
npm run law -- --law "行政書士法" --article 19
npm run law -- --law "出入国管理及び難民認定法" --article 22 --paragraph 2
npm run law -- --keyword "行政書士" --json
```

출력은 **MDX에 그대로 붙여넣을 수 있는 형태**로:
```markdown
> 【行政書士法 第19条（業務の制限）】
> 行政書士又は行政書士法人でない者は、業として第一条の二に規定する業務を行うことができない。（後略）
>
> ― 出典: e-Gov法令検索（2026-08-17 取得）
```

`package.json`에 추가:
```json
"law": "tsx scripts/fetch-law.ts"
```

### 수용 기준 (AC)
- [ ] `npm run law -- --law "行政書士法" --article 19` 가 제19조 원문을 정확히 출력한다
- [ ] 존재하지 않는 조문 요청 시 명확한 에러 메시지와 함께 종료 코드 1
- [ ] 응답이 zod로 파싱되며, 스키마 불일치 시 실패한다
- [ ] 동일 요청은 `.cache/egov/` 에 캐시되어 재호출하지 않는다 (TTL 24시간)
- [ ] 연속 호출 시 요청 간 1초 이상 간격이 보장된다
- [ ] `sourceUrl` 이 실제로 브라우저에서 열리는 유효한 URL이다
- [ ] `docs/api/egov-law-api.md` 에 조사한 엔드포인트 스펙이 기록돼 있다

### 우선 대응 법령 (동작 확인용)
| 법령 | 용도 |
|---|---|
| 行政書士法 | 제1조(사명), 제1조의2, **제19조(업무제한)**, 제19조의3, 벌칙 |
| 出入国管理及び難民認定法 | 제22조(영주허가), 제20조(재류자격변경), 제21조(재류기간갱신) |
| 建設業法 | 제3조(허가) |
| 会社法 | 제26~30조(정관) |

---

## TASK-02 — 一次情報 변경 감지 스크립트 【2순위】

### 목적
관공서 페이지의 변경을 하루 안에 포착한다. 입관청·총무성은 RSS가 없으므로 **페이지 자체를 해싱해 비교**한다.

### 산출물
```
src/lib/sources/monitor.ts       감시 로직
scripts/monitor.ts               실행 엔트리
prompts/monitor/sources.yaml     ← 확장 (기존 파일)
.cache/monitor-state.json        상태 (gitignore)
```

### 동작 사양
```
1. prompts/monitor/sources.yaml 을 읽는다 (zod로 검증)
2. 각 source의 url을 fetch
3. HTML에서 노이즈 제거 후 본문 추출
   - <script> <style> <nav> <footer> 제거
   - 날짜·세션ID 등 매번 바뀌는 요소 제거 (source별 ignoreSelectors 지원)
4. 정규화된 텍스트의 SHA-256 해시를 계산
5. .cache/monitor-state.json 의 이전 해시와 비교
6. 변경 시:
   - diff 요약 (추가/삭제된 줄 최대 20줄)
   - 콘솔에 리포트 출력
   - --github-issue 플래그가 있으면 GitHub Issue 생성
7. 상태 파일 갱신
```

### sources.yaml 스키마 확장
기존 필드에 다음을 추가한다:
```yaml
- id: isa-eiju-guideline
  name: 永住許可に関するガイドライン
  url: https://www.moj.go.jp/isa/applications/guide/
  category: nyukan
  priority: P0
  checkFrequency: daily
  # ↓ 추가 필드
  selector: "main"                 # 감시할 영역 (미지정 시 body)
  ignoreSelectors: [".date", "#ad"] # 무시할 요소
  enabled: true
  notifyOn: ["content", "newLink"] # 본문 변경 / 새 링크 등장
```

### CLI 사양
```bash
npm run monitor                      # 전체 (checkFrequency 무시)
npm run monitor -- --priority P0     # P0만
npm run monitor -- --id isa-eiju-guideline
npm run monitor -- --dry-run         # 상태 파일 갱신 없이 확인
npm run monitor -- --github-issue    # 변경 시 Issue 기표
```

`package.json`에 추가:
```json
"monitor": "tsx scripts/monitor.ts"
```

### 수용 기준 (AC)
- [ ] 첫 실행 시 전 소스의 베이스라인 해시가 기록되고 「초기화 완료」로 보고된다
- [ ] 두 번째 실행 시 변경 없음이면 「변경 없음」만 출력한다 (노이즈 없음)
- [ ] 페이지가 실제로 바뀌면 변경으로 감지되고 diff가 출력된다
- [ ] 광고·날짜 등 매일 바뀌는 요소로 **오탐(false positive)이 발생하지 않는다** ← 가장 중요
- [ ] 1개 소스 실패가 전체 실행을 중단시키지 않는다 (개별 에러 수집 후 마지막에 요약)
- [ ] 요청 간 1초 이상 간격
- [ ] `--dry-run` 이 상태 파일을 건드리지 않는다

> ⚠️ **오탐 억제가 이 태스크의 성패다.** 매일 「변경됨」이 뜨면 아무도 안 보게 된다.
> 초기 1주일은 `--dry-run` 으로 돌려 오탐 패턴을 찾고 `ignoreSelectors`를 튜닝할 것.

---

## TASK-03 — 퍼블릭코멘트 감시 【2순위】

### 목적
제도 개정을 **예고 단계**에서 잡는다. 우리 미디어의 속도 우위는 여기서 나온다.

### 대상
`https://public-comment.e-gov.go.jp/` — 키워드로 신착 안건을 검색

### 감시 키워드
```
行政書士 / 在留資格 / 入管 / 出入国 / 永住 / 帰化 / 育成就労 /
技能実習 / 特定技能 / 外国人 / 建設業許可 / 電子申請 / 行政手続
```

### 산출물
```
src/lib/sources/pubcomment.ts
scripts/watch-pubcomment.ts
.cache/pubcomment-seen.json      이미 본 안건 ID
```

### 동작
```
1. 각 키워드로 검색 페이지를 조회
2. 안건 목록 파싱 → { 案件ID, 標題, 所管府省, 受付開始日, 締切日, URL }
3. .cache/pubcomment-seen.json 에 없는 신규 안건만 리포트
4. 締切까지 남은 일수를 함께 출력하고, 7일 이하면 ★긴급 표시
5. seen 파일 갱신
```

### 출력 예
```
🆕 신규 퍼블릭코멘트 2건

★ 긴급 (마감 D-3)
  [永住] 永住許可に関するガイドラインの改定案に関する意見募集
  所管: 出入国在留管理庁 / 締切: 2026-09-04 (D-3)
  https://public-comment.e-gov.go.jp/...
  → 기사 기회: 高 (P0 카테고리 nyukan)
```

### 수용 기준 (AC)
- [ ] 신규 안건만 출력되고, 이미 본 안건은 재출력되지 않는다
- [ ] 마감일까지 남은 일수가 정확히 계산된다 (JST 기준)
- [ ] D-7 이하 안건이 상단에 ★긴급으로 표시된다
- [ ] 파싱 실패 시 HTML 구조가 바뀐 것으로 보고 **명확한 에러**를 낸다 (조용히 0건 반환 금지)

> ⚠️ **「0건」과 「파싱 실패」를 반드시 구분할 것.** 파싱이 깨졌는데 0건으로 보고하면 개정을 통째로 놓친다.

---

## TASK-04 — changedetection.io 셋업 【3순위 · 코드 아님】

### 목적
TASK-02가 커버하지 못하는 「JS 렌더링 페이지」와 「PDF 갱신」을 감시한다.

### 산출물
```
infra/changedetection/docker-compose.yml
infra/changedetection/README.md      셋업·감시 URL 등록 절차
infra/changedetection/watchlist.md   등록할 URL 목록
```

### docker-compose 요건
- `changedetection.io` 본체 + `browserless/chrome` (JS 렌더링용)
- 데이터는 named volume에 영속화
- 포트는 환경변수로 (기본 5000)
- 알림은 이메일 또는 LINE Notify 대체 수단으로 (LINE Notify는 2025년 종료됨 → **대체 수단을 조사해서 README에 기록**)

### 초기 감시 URL (watchlist.md)
`prompts/monitor/sources.yaml` 의 P0/P1 소스 + 다음:
- 出入国在留管理庁 「新着情報」
- 出入国在留管理庁 「永住許可に関するガイドライン」PDF
- 日本行政書士会連合会 「お知らせ」
- 総務省 「行政書士制度」
- デジタル庁 「政策」

### 수용 기준 (AC)
- [ ] `docker compose up -d` 만으로 기동된다
- [ ] README에 감시 URL 등록 절차가 스크린샷 없이도 따라할 수 있게 적혀 있다
- [ ] 알림 채널이 실제로 동작하는 것이 확인됐다

---

## TASK-05 — e-Stat 통계 API 래퍼 【4순위】

### 목적
기사에 넣을 통계(在留外国人統計 등)를 자동 취득한다.

### 사전 조사
1. e-Stat API 이용 등록 → **appId 발급** (무료)
2. 최신 API 버전과 엔드포인트를 공식 문서에서 확인 (`https://www.e-stat.go.jp/api/`)
3. `docs/api/estat-api.md` 에 요약 기록

### 산출물
```
src/lib/sources/estat.ts
scripts/fetch-stats.ts
docs/api/estat-api.md
```

### 환경변수
`.env.example` 에 추가:
```
# e-Stat API アプリケーションID (https://www.e-stat.go.jp/api/ で取得)
ESTAT_APP_ID=
```

### 우선 대상 통계
| 통계 | 용도 |
|---|---|
| 在留外国人統計 (出入国在留管理庁) | 재류자격별 인원 추이 — 入管 기사 필수 그래프 |
| 帰化許可申請者数等の推移 | 귀화 기사 |
| 人口推計 | 세대 평균수입 관련 보조 |

### 수용 기준 (AC)
- [ ] appId 미설정 시 명확한 안내 메시지와 함께 실패한다
- [ ] 취득 데이터가 CSV/JSON으로 `data/stats/` 에 저장된다
- [ ] 출처 정보(통계명·공표일·URL)가 함께 저장돼 기사에 인용 가능하다

---

## TASK-06 — 일일 자동 실행 (GitHub Actions) 【5순위】

### 산출물
```
.github/workflows/daily-monitor.yml
```

### 사양
```yaml
스케줄:   매일 JST 08:00 (cron은 UTC이므로 '0 23 * * *')
수행:     TASK-02 monitor + TASK-03 pubcomment
결과:     변경/신규 발견 시에만 GitHub Issue 생성
          라벨: content-opportunity, priority:P0|P1|P2
Issue 본문: 변경 내용 요약 + 원문 URL + 기사 기회 판정
상태 캐시: actions/cache 로 .cache/ 를 유지
실패 시:   Issue 생성 (라벨 monitoring-failure)
```

### 수용 기준 (AC)
- [ ] `workflow_dispatch` 로 수동 실행이 가능하다
- [ ] 변경이 없는 날에는 Issue가 생성되지 않는다 (노이즈 0)
- [ ] `.cache/` 가 실행 간 유지되어 매번 「초기화」가 되지 않는다

---

## TASK-07 — 키워드 리서치 대장 【코드 아님 · 상시】

### 목적
기사 기획의 근거를 남긴다. 감으로 기사를 쓰지 않는다.

### 산출물
```
data/keywords.csv
docs/08_키워드리서치_운용.md
```

### CSV 컬럼
```
keyword, category, audience, volume_est, difficulty, intent,
competitor_top3, our_status, target_slug, memo, updated_at
```

### 사용 툴 (외부 · 코드 불필요)
| 툴 | 비용 | 용도 |
|---|---|---|
| ラッコキーワード | 무료~¥440/월 | サジェスト·Q&A·공지검색. **일본어 SEO 필수** |
| Google Search Console | 무료 | 자사 실측 데이터. 리라이트 우선순위의 유일한 근거 |
| Google キーワードプランナー | 무료 | 검색량 개산 (광고 미집행 시 범위 표시) |

### 초기 등록 대상
`src/config/taxonomy.ts` 의 `CATEGORIES[].seedKeywords` 전부 + 永住 특집 8기사의 `targetKeywords`

---

## 3. 실행 순서 및 일정

```
Day 1-2   TASK-01  e-Gov 法令API 래퍼          ★9/4 기사에 즉시 투입
Day 3-4   TASK-02  변경 감지 스크립트
Day 5     TASK-03  퍼블릭코멘트 감시
Day 6     TASK-06  GitHub Actions 연결
이후      TASK-04  changedetection.io
          TASK-05  e-Stat API
상시      TASK-07  키워드 대장
```

> TASK-01만 끝나도 기사 집필 속도가 확 올라간다. **완벽한 파이프라인보다 9월 4일 발행이 우선이다.**
> 나머지 태스크가 지연돼도 콘텐츠 발행을 멈추지 말 것.

---

## 4. 금지사항

| # | 금지 |
|---|---|
| N1 | **엔드포인트·파라미터를 기억이나 추측으로 작성하는 것.** 반드시 공식 문서/Swagger를 열어 확인한다 |
| N2 | 관공서 서버에 초당 1회를 넘는 요청을 보내는 것 |
| N3 | 취득한 법령 원문을 **가공·요약해서 「원문」이라고 저장하는 것** (원문은 원문 그대로) |
| N4 | 파싱 실패를 「0건」으로 처리하는 것 |
| N5 | API 키·토큰을 코드나 커밋에 포함하는 것 |
| N6 | 기존 `src/config/*.ts`, `src/lib/content-schema.ts` 를 본 작업에서 변경하는 것 (별도 승인 필요) |
| N7 | 스크래핑 대상 사이트의 이용규약·robots.txt를 무시하는 것 |

---

## 5. 완료 보고 양식

각 태스크 완료 시 다음을 보고할 것:

```markdown
## TASK-0X 완료 보고
- 생성/변경 파일: (목록)
- 실행 확인 커맨드: (실제로 돌린 명령과 출력 요약)
- AC 달성 현황: (체크리스트, 미달 항목은 이유 명시)
- 조사해서 알아낸 사실: (엔드포인트 스펙 등 — docs/api/ 에 기록했는지)
- 남은 이슈 / 다음 사람에게 넘기는 것:
```

---

## 6. 참고 자료

| 자료 | URL |
|---|---|
| e-Gov 法令API Version2 Swagger | https://laws.e-gov.go.jp/api/2/swagger-ui/ |
| e-Gov 法令検索 お知らせ | https://laws.e-gov.go.jp/news/ |
| e-Gov パブリックコメント | https://public-comment.e-gov.go.jp/ |
| e-Stat API | https://www.e-stat.go.jp/api/ |
| インターネット版官報 | https://www.npb.go.jp/product_service/books/kanpo/ |
| 官報の電子化について (내각부) | https://www.cao.go.jp/others/soumu/kanpo/about/kanpo_about.html |
| changedetection.io | https://changedetection.io/ |
