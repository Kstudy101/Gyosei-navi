# 기사・보조금 레코드 작성 규격 v2

> 실제 템플릿 파일: `content/_TEMPLATE.mdx` (재작성 시 본 문서 기준으로 갱신)
> 스키마 정본: `src/lib/content-schema.ts` (zod — 빌드 시 강제 검증, 재작성 대상)
> 상위 문서: `00_MASTER_PLAN.md` §6.2, `01_IA_TAXONOMY.md`

## 1. v1과의 핵심 차이 — 「보조금 레코드」 개념 신설

v1은 frontmatter가 **기사(해설 콘텐츠)** 단위였다. v2는 그 위에 **보조금 자체를 구조화 데이터로 표현하는 필드군**을 추가한다. 이래야 카테고리 허브・지역 허브・비교 페이지가 하나의 소스에서 자동 생성될 수 있다.

```
기사(MDX + frontmatter)
 ├─ 해설 콘텐츠 필드 (v1과 유사: title, description, publishedAt 등)
 └─ subsidy 필드 (★신규) — 이 기사가 다루는 보조금의 구조화 정보
     ├─ region: 지역 식별자 (전国地方公共団体코드)
     ├─ amount: 금액・상한
     ├─ period: 모집기간・마감
     ├─ eligibility: 대상 조건
     ├─ applyUrl: 신청처(공식 페이지) URL
     └─ status: 募集中 / 締切 / 終了 / 通年
```

## 2. frontmatter 필드 정의 (설계안 — `content-schema.ts` 작성 시 확정)

### 2.1 공통 기사 필드 (v1 계승・일부 개명)

| 필드 | 필수 | 타입 | 설명 |
|---|:---:|---|---|
| `title` | ● | string(10-60) | 32자 이내 권장 |
| `slug` | ● | kebab-case | 영소문자・숫자・하이픈만 |
| `category` | ● | enum | `docs/01` §3 카테고리 코드(`type: tokushu`는 §3-2의 특집 전용 카테고리) |
| `type` | ● | enum | `pillar` / `cluster` / `compare` / `tokushu` / `news` / `checklist` / `tool` — **`compare`・`tokushu` 신설, v1의 `interview`는 제외(용도 없음)** |
| `description` | ● | string(50-160) | meta description |
| `publishedAt` | ● | YYYY-MM-DD | |
| `updatedAt` | ● | YYYY-MM-DD | ≥ publishedAt |
| `author` | ● | string | 기본 `editorial` |
| `status` | ● | enum | draft / review / published / archived |
| `sourceLinks` | ● | array | **v1의 `legalBasis`를 개명.** 관공서 공식 발표 링크. published 시 최소 1건 필수 — 빌드 실패 게이트 유지 |
| `relatedSlugs` | | array | 관련 기사 |
| `faq` | | array | GEO 대응, 3건 이상 권장 |
| `ogImage` | | path | |
| `changelog` | | array | 갱신 이력 |

### 2.2 `audience` / `noticeLevel` — v1에서 제외

- `audience`(독자축 `for-individual` 등): v2는 독자 유형을 URL 제1계층으로 쓰지 않으므로 **폐지**. 필요하면 횡단 태그로 격하해 재검토.
- `noticeLevel`(改定案/施行済 등): v1은 「법 개정」을 다루는 미디어였기에 핵심 장치였다. v2는 「보조금 모집 상태」가 그 역할을 대신한다 → 아래 `subsidy.status`로 대체.

### 2.3 `subsidy` 필드군 (★신규)

| 필드 | 필수 | 타입 | 설명 |
|---|:---:|---|---|
| `subsidy.regionCode` | ● | string(5자리) | 総務省 전国地方公共団体코드. 전국 공통 제도는 `"00000"` 등 특수값으로 표현(확정 시 결정) |
| `subsidy.regionLabel` | ● | string | 표시용 지역명(예: `東京都渋谷区`) |
| `subsidy.provider` | ● | enum | `national`(국가) / `prefecture`(도도부현) / `municipality`(시구정촌) — 계층 표시용 |
| `subsidy.amount` | | string | 금액・상한(자유 서식, 예: `"最大10万円"`). 정확한 산정식은 본문에 |
| `subsidy.periodStart` | | YYYY-MM-DD | 모집 시작일 |
| `subsidy.periodEnd` | | YYYY-MM-DD | 모집 마감일. 상설 제도는 생략 |
| `subsidy.status` | ● | enum | `open`(募集中) / `closed`(締切) / `ongoing`(通年・상설) / `unresearched`(미조사) |
| `subsidy.applyUrl` | ● | string(url) | 공식 신청・안내 페이지 |
| `subsidy.eligibility` | | string | 대상 조건 요약(1~2문, 상세는 본문) |
| `subsidy.verifiedAt` | ● | YYYY-MM-DD | 원문 확인일 — `sourceLinks`의 `accessedAt`과 별개로, 금액・조건 수치를 최종 확인한 날짜 |

> `subsidy.status: "unresearched"`는 **지역 허브・비교 페이지에서 「데이터 없음」과 「미조사」를 구분하기 위한 핵심 필드**다(`docs/01` §4.2, AGENTS.md 절대규칙 6과 동일 원칙 — 파싱 실패・미조사를 「0건」으로 처리하지 않는다).

### 2.4 `sourceLinks` (v1 `legalBasis` 개명)

```yaml
sourceLinks:
  - label: "渋谷区 出産・子育て支援サイト「出産応援ギフト」"
    url: "https://..."
    accessedAt: "2026-09-20"
```

published 기사는 최소 1건 필수 — zod `refine`으로 빌드 게이트 유지(v1과 동일 메커니즘).

## 3. `type: compare` 전용 필드 (비교 페이지)

`docs/01` §5의 지역 횡단 비교 페이지는 여러 지자체의 `subsidy` 레코드를 참조한다. 설계 방향:

- `compareTargets: string[]` — 참조하는 기사 slug 목록(최소 5건 이상 — §6 품질 게이트)
- 본문은 MDX 컴포넌트 `<CompareTable targets={[...]} />`로 비교표를 렌더링(각 slug의 `subsidy` 필드를 조합)

상세 구현은 `content-schema.ts`・`components/article/CompareTable.tsx` 작성 시 확정한다.

## 3-2. `type: tokushu` 전용 필드 (특집 페이지, 2026-09-20 신설)

`docs/01` §7의 편집적 랭킹 콘텐츠. `compare`와 달리 순위・서열이 있고, 편집부의 판단(누가 1위인가)이 들어간다.

- `category`는 §3의 `subsidy` 목적별 카테고리가 아니라 **`TOKUSHU_CATEGORIES`(taxonomy.ts, 특집 전용)** 를 쓴다.
- `rankings: { rank: number; slug: string; label: string; summary: string }[]` — 순위 목록. `slug`는 근거가 되는 `subsidy` 기사(또는 `compare` 기사)를 가리킨다. **최소 5건**(§7.1의 발행 전제조건과 동일 기준).
- `subsidy` 필드는 불필요(compare와 동일하게 `content-schema.ts`의 refine에서 `tokushu`도 `compare`와 함께 제외 대상).
- 본문은 MDX 컴포넌트 `<TokushuRanking items={[...]} />`로 순위를 렌더링(각 순위별 근거 서술 포함).

> **발행 게이트**: `rankings`가 5건 미만이면 빌드를 막는다(zod refine) — 표본 부족 상태의 추측성 랭킹 발행을 원천 차단한다(`docs/01` §7.1).

## 4. 본문 MDX 컴포넌트 (설계안)

| 컴포넌트 | 용도 |
|---|---|
| `<Callout type="info\|warning\|danger">` | 주의 환기 — v1 계승 |
| `<Checklist items={[...]} />` | 신청서류 등 — v1 계승 |
| `<FAQ />` | frontmatter `faq` 자동 전개 + JSON-LD — v1 계승 |
| `<Disclaimer />` | 기사 말미 정형 면책문 — v1 계승, 문구는 v2로 완화(`docs/06`) |
| `<SubsidyInfoCard />` | ★신규 — `subsidy` 필드를 카드 형태로 요약 표시(금액・마감・상태 배지) |
| `<CompareTable targets={[...]} />` | ★신규 — 비교 페이지 전용 |
| `<TokushuRanking items={[...]} />` | ★신규 — 특집 순위 페이지 전용 |
| `<SourceLinkList />` | `sourceLinks` 자동 전개(v1 `<LegalBasisList />` 개명) |
| `<Deadline id="..." />` | 마감 카운트다운 — v1 계승, `subsidy.periodEnd`와 연동 검토 |

## 5. 본문 구조 (고정, v2)

```
リード(2〜3문 — 이 보조금이 무엇인지 정의・결론)   ★AI 검색 인용 지점
<SubsidyInfoCard />                              금액・마감・신청처 한눈에
## この記事の結論                                  3행 요약
## 1. 対象者・支給条件
## 2. 支給額・計算方法
## 3. 申請方法・必要書類
## 4. よくある質問                                 <FAQ />
## まとめ                                          표(金額・期間・申請先・根拠)
<SourceLinkList />
<Disclaimer />
```

## 6. 분량・품질 기준

| type | 분량 | 비고 |
|---|---|---|
| news | 1,000~2,000자 | 신착・마감임박 속보 |
| cluster | 2,000~3,500자 | 개별 보조금 해설 |
| pillar | 4,000~8,000자 | 카테고리 종합 가이드 |
| compare | — | 표 중심, 비교 대상 5건 이상 필수 |
| tokushu | 2,000~4,000자 | 순위 5건 이상 필수, 순위별 근거 서술 |
| checklist | 800자+ 자료 | 리드마그넷 |

## 7. 발행 전 확인

→ `04_EDITORIAL_GUIDELINE.md` §5 품질 게이트 체크리스트(v2)

## 8. 미확정 사항 (코드 작성 세션에서 결정)

- `subsidy.regionCode`의 전국 공통 제도 표현 방식(특수 코드 vs 별도 boolean 필드)
- `provider` 3단계 외에 「복수 지자체 공동 제도(広域連合 등)」를 어떻게 표현할지
- `type: compare`와 카테고리 허브 자동생성 페이지의 관계(compare는 수동 MDX, 허브는 자동 집계 — 역할 분담 확정 필요)
