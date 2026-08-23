# 감시 소스 레지스트리 해설 — 전 분야 망라판

> 정본 파일: **`prompts/monitor/sources.yaml` (v2.1)**
> 조사일: 2026-08-17 / 전 URL 실지 검증 / 소스 83건
> 상위 문서: `docs/00_MASTER_PLAN.md` §8, `docs/07_DATA_PIPELINE_WORKORDER.md`
> 구현 현황: `docs/09_SYSTEM_OVERVIEW.md`

---

## 0. 배치와 호환성 — 먼저 읽을 것

### 파일 배치

| 파일 | 위치 | 비고 |
|---|---|---|
| 레지스트리 정본 | `prompts/monitor/sources.yaml` | v2.1 / 소스 83건 |
| 본 해설 문서 | `docs/10_MONITORING_REGISTRY.md` | — |
| 구현 현황 | `docs/09_SYSTEM_OVERVIEW.md` | IDE 에이전트 작성 |
| 작업지시서 | `docs/07_DATA_PIPELINE_WORKORDER.md` | §5에 개정사항 |

### ⚠️ 2026-08-23 — `checkFrequency` 가 드디어 실제로 지켜진다

그동안 `checkFrequency` 는 **스키마로 파싱만 되고 실행 게이팅에는 쓰이지 않았다**
(`scripts/monitor.ts` 헤더에도 「checkFrequency 무시」라고 적혀 있었다).
그 결과 weekly/monthly 로 선언한 P2/P3 소스까지 **하루 2회** diff 되어,
카운터·이벤트 목록 같은 무의미한 변경이 매일 Issue 로 올라왔다.

실측 (2026-08-17〜23, Issue 13건):

| | 건수 |
|---|---|
| 총 검지 | 67건 |
| 記事機会 **高** | **3건** (그나마 1건은 입관 채용정보 = 실질 0) |
| 記事機会 中 | 25건 |
| 記事機会 低 | 39건 |

최다 노이즈원: 内閣府 NPO(8회, 전건 低 — 認定件数 카운터), 大阪産業局(7회, 전건 低),
官報(7회, 전건 中 — **이미 TASK-09 가 전호 아카이브하므로 정보가치 없음**),
東京都中小企業振興公社(6회, 전건 低), 警視庁 探偵業法(4회, 전건 低 — 조달공고를 잡고 있음).

**대응**: `checkedAt` 기준으로 주기 미도래 소스를 건너뛴다 (`status: "skipped"`).
- daily 는 간격 0 → 종전과 동일. **P0 11건 중 10건이 daily 라 영향 없음**
- 정례 실행 기준 검사 대상 80건 → **18건** (weekly 34 / monthly 28 스킵)
- 베이스라인이 없는 신규 소스는 주기와 무관하게 즉시 검사
- 스킵 건수는 반드시 출력한다 (침묵하면 「전건 확인」으로 오인)
- 전건 강제 검사: `npm run monitor -- --all-frequencies`

### 2026-08-23 (2차) — 노이즈원 3건 개별 대응

| 소스 | 조치 | 근거 (실측) |
|---|---|---|
| `kanpo` | **`enabled: false`** | 7일간 7회 검지 전건이 「그날의 号 링크 증가」뿐. TASK-09 가 전 号를 아카이브하므로 완전 중복. 본문 검색은 `npm run kanpo -- --search <키워드>` |
| `keishicho-tantei` | **`selector: "#main"`** | selector 미지정으로 페이지 전체를 diff → 사이트 공통 영역의 조달공고를 잡고 있었다. `#main` 은 探偵業 본문만 포함하고 링크 0건. 실측 1,206자→654자 / 링크 23→0 |
| `isa-top` | **`ignorePatterns` 4개** | P0 라 「記事機会 高」로 표시되지만 실제로는 採用·調達 갱신이 대부분. 실측 텍스트 201→194행 / 링크 77→74건, 제거 대상에 Issue #9 의 `/isa/16_00643.html` 포함. 在留 본문은 유지 확인 |

**신규 필드 `ignorePatterns`** (`sourceSchema`): 정규식 문자열 배열.
CSS 로는 못 거르는 「같은 목록 안의 관심 밖 항목」용이며, **본문 행과 `<a>` 앵커 텍스트 양쪽**에 적용된다.
앵커가 걸리면 그 링크도 신규 판정에서 빠진다 (URL 만으로는 採用情報 인지 알 수 없기 때문).
무효한 정규식은 경고 후 제외 — 조용히 무시하지 않는다.

> ⚠️ **추출 규칙을 바꾸면 해시가 달라져 다음 1회는 「変更」으로 뜬다.**
> 2026-08-23 의 isa-top / keishicho-tantei 변경분은 그 자리에서 수동 실행해 소화시켰다.
> 앞으로 selector·ignorePatterns 를 만질 때도 같은 일회성 오보가 난다는 점을 염두에 둘 것.

**남은 판단 과제**:
- `soumu-gyoseishoshi` 는 **P0 인데 weekly** — 유일한 예외. changedetection 이 중복 감시 중이라 당장은 무해
- `isa-top` 의 ignorePatterns 는 **분기마다 재검토**할 것. 본래 잡아야 할 제도 변경을 같이 버리고 있지 않은지,
  Issue 의 diff 와 실페이지를 대조해 확인한다

### ⚠️ v2.0 → v2.1 에서 무엇을 고쳤는가

v2.0은 `crosscutting:` + `categories.<code>.sources` 의 **계층 구조**였고,
`collect_priority` / `checkFrequency: 2x-daily` 등의 필드를 썼다.
이것은 이미 구현된 `src/lib/sources/monitor.ts` 의 `sourcesFileSchema`
(= 최상위 `sources:` 평면 배열, `priority` 필수, `checkFrequency: daily|weekly|monthly`)
와 **호환되지 않아 `npm run monitor` 가 스키마 오류로 죽는다.**

v2.1은 **기존 로더를 건드리지 않고** 동작하도록 다음을 지켰다.

- 최상위 `sources:` **평면 배열** (83건, id 중복 없음)
- 전 엔트리에 `id` / `name` / `url`(유효 URL) / `priority`(P0~P3) / `checkFrequency`(daily·weekly·monthly) 필수 충족
- `2x-daily` · `quarterly` 는 enum에 없으므로 **daily · monthly 로 반올림**하고, 본래 희망 빈도는 `frequencyHint` 확장 필드에 남김
- 추가 필드(`method` `status` `publishPriority` `frequencyHint` `baseUrl`)는 zod가 **읽고 버리므로 무해**
- 최상위 `automationPriority` `todoVerify` `deadUrls` `defaults` 도 스키마상 무해

**검증 결과: 기존 zod 스키마 기준 PASS.**

```
총 소스 83건   enabled 68건(diff, 즉시 동작)   disabled 15건(rss/api, 별도 처리)
method   diff 70 / rss 10 / api 3
priority P0 9 / P1 29 / P2 36 / P3 9
status   confirmed 75 / listed 6 / blocked 1 / unverified 1
```

### RSS·API 소스를 왜 `enabled: false` 로 두었는가

현행 `monitor.ts` 는 cheerio 기반 **HTML 해싱 전용**이다.
RSS 피드를 그대로 해싱하면 신규 item이 뜰 때마다 「변경」이 되어,
TASK-02의 핵심 수용 기준인 **「오탐 없음」이 깨진다.**

그래서 RSS/API는 끄고, **TASK-10(RSS 파서 분기)** 으로 분리했다.
단 다음 2건은 이미 별도 경로가 있어 애초에 켤 필요가 없다.

- `egov-pubcomment-all` → `scripts/watch-pubcomment.ts` 가 이미 담당
- `egov-law-api` → `scripts/fetch-law.ts` (감시 대상이 아니라 취득 수단)

---

## 1. 설계 원칙 — 수집과 발행은 다른 것이다

v1 레지스트리는 入管에 P0가 몰려 있고 나머지 7개 분야가 비어 있었다.
「초기 6개월은 入管 집중」이라는 발행 전략을 **수집 계층에까지 그대로 적용한 것**이 원인이며, 이것은 설계 오류다.

```
                  collect (수집·감시)          publish (기사화·발행)
목적              一次情報 아카이브 축적        검색 상위 확보
비용              크롤링 비용 ≒ 0              집필 공수 = 최대 제약
최적 전략         전 분야 망라, 처음부터        좁고 깊게, 한 분야씩
현재 설정         8개 분야 전부 P0~P2          nyukan만 P0, 나머지 P3
```

### 왜 수집은 전 분야여야 하는가

**一次情報 아카이브는 쌓인 기간만큼만 가치가 생긴다.**

2028년에 건설업 분야로 확장할 때 두 가지 상태가 가능하다.

| | 2026년부터 수집한 경우 | 그때부터 수집하는 경우 |
|---|---|---|
| 보유 자산 | 2년치 개정 이력·통지·운용 변경 전문 | 없음 |
| 쓸 수 있는 기사 | 「建設業法 개정 2년의 궤적」 같은 아무도 못 쓰는 기사 | 남들과 같은 개설 기사 |
| 경쟁 우위 | 시간이 만든 해자 | 없음 |

크롤링 비용은 GitHub Actions 무료 티어로 충분하다. **지금 안 모으면 그 2년은 영구히 복구되지 않는다.**

### 발행은 왜 좁혀야 하는가

신규 도메인이 YMYL(법률·행정) 영역에서 8개 분야를 얕게 다루면, 검색엔진에 「무엇에 관한 사이트인지」 신호가 전달되지 않는다. `publishPriority`는 nyukan만 P0로 유지한다.

---

## 2. 이번 조사의 최대 성과 — 자동화 가능한 소스 9개

v1에서는 「관공서는 RSS가 없으니 전부 HTML diff」라고 가정했다. **틀렸다.**

| # | 소스 | 방식 | URL | 검증 |
|---|---|---|---|---|
| 1 | **e-Gov 퍼블릭코멘트 전체** | RSS(RDF) | `public-comment.e-gov.go.jp/rss/pcm_list.xml` | ✅ 실측 |
| 2 | **jGrants 보조금 API** | API (**인증 불필요**) | `api.jgrants-portal.go.jp/exp/` | ✅ 실측 208건 |
| 3 | **jGrants 공식 MCP 서버** | MCP | `github.com/digital-go-jp/jgrants-mcp-server` | ✅ 확인 |
| 4 | 法務省 신착·갱신 | RSS | `moj.go.jp/news.xml` | ✅ 실측 |
| 5 | 日本行政書士会連合会 | RSS 2.0 | `gyosei.or.jp/news/rss.xml` | ✅ 실측 |
| 6 | 国土交通省 보도발표 | RSS(RDF) | `mlit.go.jp/pressrelease.rdf` | ✅ 확인 |
| 7 | 厚生労働省 신착 | RSS(RDF) | `mhlw.go.jp/stf/news.rdf` | ✅ 확인 |
| 8 | 消費者庁 신착 | RSS 1.0 | `caa.go.jp/news.rss` | ✅ 실측 |
| 9 | デジタル庁 뉴스 | RSS 2.0 | `digital.go.jp/rss/news.xml` | ✅ 실측 |

### ★ 가장 중요한 발견 두 가지

**① e-Gov 퍼블릭코멘트에 공식 RSS가 있다**

공식 API는 존재하지 않는다(`developer.e-gov.go.jp`에서 부존재 확인). 하지만 RSS가 완비되어 있다.
- 전체 피드 + 결과공시 피드 + **카테고리별 53종** 피드
- 상세 URL은 레거시 servlet 형식이 2026년 8월 현재도 정상 작동:
  `https://public-comment.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id={id}&Mode=0`
- 신 UI(`/pcm/list`)는 SPA로 링크가 전부 `javascript:void(0)` → **스크래이핑 부적합**

⚠️ **롤링 윈도우형**이다. 실측 시 전체 피드에 7건만 실려 있었다. 전량이 아니라 최근/모집중만 나온다.
→ **1일 2회 폴링 + 案件ID로 dedup**이 필수. 하루 놓치면 안건이 통째로 사라진다.

⚠️ 카테고리 분류에 **「建設」「運輸」「医療」「法務」가 없다.** 建設業許可는 `建築、住宅`/`産業一般`에, 入管은 `外事`/`その他`에 흩어진다. → **키워드 매칭 병행 필수.**

**② jGrants가 인증 불필요 공개 API + 디지털청 공식 MCP 서버를 제공한다**

보조금 분야는 「신규 공모의 검지」가 가치의 9할이다. 그게 API로 해결된다.
게다가 공식 MCP 서버는 **첨부 PDF·Word·Excel의 본문 텍스트 추출**까지 제공한다(`get_file_content`).
→ **API 직접 호출보다 MCP를 먼저 시도할 것.**

---

## 3. RSS가 없어 diff 감시가 필요한 소스

| 기관 | 확인 결과 |
|---|---|
| 環境省 | **RSS 없음(확인)**. 대체: 메일 배신 `env.go.jp/webnews/` 주 1회 |
| 国税庁 | **RSS 없음**. `/rss/index.htm`은 404 |
| 警察庁 | 안내 페이지는 존재하나 **피드 URL 비게재** → 실체 미확인 |
| 官報 | **RSS·API 모두 부존재(확인)**. 90일 후 유통 종료 → **일일 PDF 아카이빙 자체 구축 필수** |
| 日本公証人連合会 | robots/차단으로 하위 페이지 접근 불가 |
| 法人設立ワンストップ | 장애 정보가 여기에만 게재 → 일일 diff |
| 시험센터·행정서사회 | RSS 없음 |

---

## 4. 조사에서 드러난 「지금 당장 기사 가치가 있는」 제도 변화

수집 범위를 넓혀보니, 入管 외에도 즉시 쓸 수 있는 소재가 대량으로 나왔다.
**발행 우선순위는 nyukan을 유지하되, 아래는 아카이브에 확실히 기록해 둔다.**

| 분야 | 제도 변화 | 시기 | 비고 |
|---|---|---|---|
| 相続 | **相続登記 경과조치 마감** | **2027-03-31** | 남은 7개월. 수요 피크 |
| 相続 | **住所等変更登記 의무화** | 2026-04-01 시행 | 제2의 등기 의무화. 과료 5만엔 |
| 相続 | 「スマート変更登記」 **개인용 개시시기 미정** | — | ★일본 전체에서 아무도 확답 못 하는 상태 = 선점 가능 |
| 民事 | **民法 대개정**(성년후견 일원화 + **「保管証書遺言」= 전자 유언 창설**) | 2026-06-24 공포 / ~2029-06 시행 | 유언 업무의 게임체인저 |
| 民事 | **押印의 임의화** | ~2027-06 | 계약서 실무 직격 |
| 契約 | 消費者庁 **2개 검토회 동시 가동** | 진행 중 | 契約法·特商法 개정 예고 |
| 許認可 | **廃棄物処理法 개정안 각의결정** — 스크랩야드 **허가제 신설** | 2026-04-10 | ★행정서사 신규 시장 |
| 許認可 | **개정 建設業法 완전시행** | 2025-12-12 | 부당 저가·단공기 금지 |
| 許認可 | **経営事項審査 개정 시행** | 2026-07-01 | 시행 직후 혼란기 |
| 許認可 | **古物営業 유식자회의** 제3회까지 개최 | 진행 중 | 차기 개정 예고 |
| 運送 | **貨物運送 2법** — 3년 내 **트럭 허가 갱신제 도입** | 2025-06-11 공포 | 갱신 업무라는 정상 수입 발생 |
| 自動車 | **軽自動車 법정수수료 변경** | 2026-04-01 | 견적 단가 재설정 필요 |
| 新領域 | **小型無人機飛行禁止法** 공항 주변 300m→**1,000m** | 2026-07-14 | 촬영·측량 안건 조정 범위 3배 |
| 新領域 | **大麻草採取栽培者免許** 신설 | 2025-03-01 | ★경합 최소 블루오션 |
| 法人 | **GビズID 유효기간 2년 3개월 도입** | 2026-07~ | ★보조금 신청 대행 사고 예비군 |

### ⚠️ 오보 주의 3건

1. **AI法(令和7년 법률 제53호)은 「추진법」이며 규제·허가제가 아니다.** 현시점에 「AI 인허가」 시장은 존재하지 않는다. 이걸 틀리면 중대 오보다.
2. **IT導入補助金은 「デジタル化・AI導入補助金」으로 개명·개편됐다.** 구명칭으로 쓰면 오보.
3. **車庫証明의 온라인화는 「届出」계 4수속만이다.** 普通車의 보관장소 「証明」 신청은 여전히 창구 또는 OSS 경유. 혼동하기 쉬운 지점.

---

## 5. 작업지시서 #07 개정사항

> IDE 에이전트가 이미 TASK-01~07을 구현했다(`docs/07_COMPLETION_REPORT.md`).
> 아래는 **그 위에 얹는 차분**이다. 이미 만든 것을 다시 만들지 말 것.

### TASK-03 【확인·보강】 퍼블릭코멘트 감시

`scripts/watch-pubcomment.ts` 와 `docs/api/egov-pubcomment.md` 가 이미 존재한다.
다음 3점만 **확인하고, 미충족이면 보강**한다.

- [ ] RSS(`pcm_list.xml`)를 **RDF/RSS 1.0** 으로 파싱하고 있는가 (`dc:date` 사용)
- [ ] **1일 2회** 스케줄인가 — 롤링 윈도우형(실측 7건)이라 하루 놓치면 안건이 통째로 사라진다
- [ ] 카테고리에 「建設」「運輸」「医療」「法務」가 **없음을 전제로 키워드 매칭을 병행**하는가

신 UI(`/pcm/list`)는 SPA이므로 스크래이핑 금지. 상세 URL은 servlet 형식을 쓴다.
`https://public-comment.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id={id}&Mode=0`

### TASK-02 【보강】 sources.yaml v2.1 대응

- [ ] `deadUrls` 에 실린 URL이 `sources[].url` 에 나타나면 **로드 시 에러로 거부**한다
- [ ] `status: unverified | blocked` 소스는 리포트에 **「미검증」 배지**를 붙인다
- [ ] `frequencyHint` 가 있는 소스는 리포트에 본래 희망 빈도를 병기한다
- [ ] `sourceSchema` 에 `method` `status` `publishPriority` `frequencyHint` `baseUrl` 를
      **optional 로 명시 추가**한다 (현재는 읽고 버려지므로 활용 불가)

### TASK-08 【신규】 jGrants 보조금 감시 ★다음 우선순위

인증이 필요 없어 구현 비용이 가장 낮고 효과가 즉각적이다.

```
산출물:
  src/lib/sources/jgrants.ts
  scripts/watch-subsidies.ts
  docs/api/jgrants-api.md
  package.json: "subsidies": "tsx scripts/watch-subsidies.ts"

사양:
  1. 먼저 デジタル庁 공식 MCP 서버(digital-go-jp/jgrants-mcp-server)를 검토한다.
     get_file_content 로 첨부 PDF·Word·Excel 본문까지 추출 가능.
     이 리포는 TS/npm이므로 Python MCP를 직접 embed하기 어렵다면 2)로 간다.
  2. API 직접 호출 (인증 불필요):
     GET https://api.jgrants-portal.go.jp/exp/v1/public/subsidies
     GET https://api.jgrants-portal.go.jp/exp/v2/public/subsidies/id/{id}
  3. acceptance=1(모집중)로 폴링 → 신규 공모를 .cache/subsidies-seen.json 과 대조
  4. 신규 건은 締切·대상지역·상한액·소관과 함께 리포트, D-7 이하는 ★긴급

AC:
  - [ ] 실제로 공모 목록을 취득한다 (조사 시점 실측 208건)
  - [ ] 신규 건만 리포트되고 기존 건은 재출력되지 않는다
  - [ ] v2의 granttype·ワークフロー 배열 구조를 zod로 파싱한다
  - [ ] 레이트리밋이 문서에 없으므로 요청 간 1초 이상 간격을 둔다
  - [ ] docs/api/jgrants-api.md 에 실제 응답 스키마를 기록한다
```

### TASK-09 【신규】 官報 일일 아카이빙

**우선도는 낮지만, 지연되면 그만큼 영구 손실**이다.

```
배경:
  2025-04-01「官報の発行に関する法律」施行으로 전자판이 정본화. 매일 8:30 발행.
  ⚠️ 발행 후 90일간만 전체 무료 열람·DL 가능.
     90일 경과 후에는 개인의 처분·프라이버시 관련 기사가 비표시된다.
  RSS·API 모두 부존재. 키워드 검색은 유료「官報情報検索サービス」뿐.

산출물:
  scripts/archive-kanpo.ts
  package.json: "kanpo": "tsx scripts/archive-kanpo.ts"
  .cache/kanpo/YYYY/MM/DD/*.pdf  (용량이 커지면 외부 스토리지로)

AC:
  - [ ] 매일 자동 취득된다 (daily-monitor.yml 에 편입)
  - [ ] 취득 실패 시 반드시 알림이 온다 — 놓친 날은 90일 후 복구 불가
  - [ ] 텍스트 추출 후 키워드로 과거분을 검색할 수 있다
```

### TASK-10 【신규】 RSS 파서 분기 — 가치 대비 공수 최고

`sources.yaml` 의 rss 10건을 켜기 위한 작업. **오탐이 구조적으로 발생하지 않는다.**

```
산출물:
  src/lib/sources/rss.ts
  src/lib/sources/monitor.ts 수정 (method 로 분기)

사양:
  1. method: "rss" 인 소스는 해싱이 아니라 피드 파싱으로 처리한다
  2. RSS 2.0 / RDF(RSS 1.0) 양쪽을 지원 (관공서는 RDF가 많다)
  3. item의 guid 또는 link 를 키로 .cache/rss-seen.json 과 대조 → 신규 item만 리포트
  4. keywords 가 있으면 title + description 에 매칭해 필터링
  5. enabled: false 인 rss 소스를 순차적으로 true 로 전환

대상 (automationPriority 순):
  moj-news / nichigyoren-news / mlit-pressrelease / mhlw-news /
  caa-news / digital-agency-news / mirasapo-subsidy-rss /
  egov-pubcomment-result / egov-pubcomment-category-noki

AC:
  - [ ] RDF(RSS 1.0)와 RSS 2.0 양쪽이 파싱된다
  - [ ] 신규 item만 리포트되고 기존 item은 재출력되지 않는다
  - [ ] keywords 필터가 동작한다 (moj-news 는 필터 없이는 노이즈가 과다)
  - [ ] 파싱 실패를 「0건」으로 처리하지 않고 명확히 실패시킨다
  - [ ] diff 소스의 동작에 영향을 주지 않는다 (회귀 없음)
```

---

## 6. 감시 빈도 설계 (부하 vs 취락 트레이드오프)

| 빈도 | 대상 | 근거 |
|---|---|---|
| **1일 2회** | e-Gov 퍼블릭코멘트 | 롤링 윈도우형. 놓치면 안건이 사라진다 |
| **일일** | 法務省·国交省·厚労省·消費者庁·デジタル庁 RSS / 日行連 / jGrants / 官報 / 入管 3소스 / 法人設立OSS | 저비용 또는 실무 직격 정보 |
| **주간** | 建設業·許認可·登記·보조금 공모·GビズID·드론 | 개정 사이클이 주 단위 |
| **월간** | 相続 각 제도·자동차·전기통신·동물취급업·의료법인 | 갱신 빈도 낮음 |
| **분기** | 農地転用·탐정업·大麻草·우주·AI法 | 연 1~2회 갱신 |

전 소스 합계로도 **1일 수십 요청 수준**이다. 요청 간 1초 간격을 지키면 관공서에 부담이 없고, GitHub Actions 무료 티어로 충분하다.

---

## 6-2. 2026-08-20 추가 — 特定技能 감시 공백 해소 (3건)

`npm run check:links` 복구 후 첫 실행에서 published 기사 2건의 一次情報가 404로 검출된 것이 계기.
**特定技能運用要領이 令和8年8月20日자로 개정되며 본체 PDF의 URL이 바뀌었는데**(001460079 → 001468647),
당시 레지스트리 95건 중 **特定技能 관련 소스가 0건**이어서 감시망에 걸리지 않았다.
育成就労(2027-04 시행)의 이행처이자 기사 클러스터의 중핵인데도 비어 있던 공백이다.

| id | 대상 | 우선도 | 왜 필요한가 |
|---|---|---|---|
| `isa-tokutei-gino-unyo` | 特定技能運用要領 (일람 페이지) | P0/daily | **개정 시 본체 PDF의 URL 자체가 바뀐다.** PDF를 직접 감시하지 않고 일람 페이지를 보는 이유가 이것 — URL 변경을 잡아야 기사의 `legalBasis` 절단을 막는다. 개정 시 신구대조표가 병재되어 차분 파악도 빠르다 |
| `isa-tokutei-gino` | 在留資格「特定技能」 | P0/daily | 特定産業分野 추가·2호 대상분야 확대를 포착 |
| `isa-tokutei-gino-bunya` | 基本方針·分野別運用方針·運用要領 | P1/weekly | 분야별 운용방침은 각의결정 사항. 上乗せ基準告示 개정을 포착 |

3건 모두 실지 취득 확인 완료(본문 각 7,396 / 5,742 / 1,923자). 레지스트리 총 **98건**.

> **교훈**: 「기사를 쓴 제도는 반드시 감시 대상에 넣는다」가 지켜지지 않으면, 링크 절단은 독자가 먼저 발견한다.
> 신규 기사 클러스터를 만들 때 sources.yaml 등록을 발행 체크리스트에 포함할 것.

---

## 7. 미해결 항목 — 재조사 필요

`sources.yaml`의 `todo_verify` 섹션에 기록해 뒀다. 특히 다음은 기사화 전 반드시 확인할 것.

| # | 항목 | 왜 중요한가 |
|---|---|---|
| 1 | **e-Gov 法令API v2 상세 사양** | TASK-01의 전제. Swagger가 SPA라 미취득 |
| 2 | **정관인증 수수료 인하** | 一次情報 확인 실패. **법무성 페이지가 아직 「5만엔」으로 방치 중.** 금액 기사화 전 공증역장 직접 확인 필수 |
| 3 | **GX-ETS** | 본문 취득 전면 실패. 대상 기준·기한·성령 번호 미확정 |
| 4 | ~~育成就労 시행일~~ | ✅ 해소 (2026-08-17): 令和7年政令第340号 원문 확보 — 令和9년 4월 1일 시행 확정. data/sources/ikusei-shuro/ |
| 5 | 도쿄도 계열 사이트 3곳 | 봇 차단(403). 브라우저 확인 필요 |

> **② 정관인증 수수료 건은 그 자체가 기사 앵글이 된다.**
> 「공식 페이지도 따라가지 못하는 제도 변경」 — 一次情報 원칙을 지키는 미디어만 쓸 수 있는 기사다.
