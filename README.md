# 全国補助金ナビ・ジャーナル (가칭, 리브랜딩 진행 중)

> ⚠️ **2026-09-20 프로젝트 전면 전환.** 이전에는 「行政書士ナビ・ジャーナル」(일본 행정서사 업무 전 분야를 다루는 종합 정보 미디어)였으나, **일본 전국의 국가・지자체 보조금・조성금 정보를 지역별로 비교・안내하는 사이트**로 방향을 바꿨다.
> v1(행정서사 미디어) 시절 문서・코드는 git 이력으로 보존되며, 각 문서 상단에 유산 표시가 붙어 있다. 새 작업은 반드시 v2 문서를 기준으로 할 것.

일본 전국의 보조금・조성금 정보를 지역별로 비교할 수 있게 정리하는 일본어 정보 미디어.

> **사이트 언어: 일본어 / 개발・기획 문서: 한국어**

## 시작하기

1. **`docs/00_MASTER_PLAN.md` (v2) 를 먼저 읽는다.** 모든 판단의 상위 규범.
2. **`docs/06_LEGAL_COMPLIANCE.md` (v2, 완화판) 를 읽는다.** 여전히 지켜야 할 선(개별 신청 대행 금지 등)이 있다.
3. 기사를 쓸 때는 `docs/04_EDITORIAL_GUIDELINE.md` (v2) + `docs/03_CONTENT_TEMPLATE.md` (v2).

## 현재 진행 상태 (2026-09-20)

**완료**:
- 마스터플랜・IA/택소노미・리포구조・콘텐츠템플릿・편집가이드・법적포지셔닝 문서를 v2로 전면 재작성. v1 운영 문서(07~16)에는 유산 표시 삽입.
- v1 콘텐츠(기사 76건)・`prompts/`・v1 전용 라우트/컴포넌트/lib/scripts 삭제.
- `src/config/{site,taxonomy,regions}.ts`, `src/lib/content-schema.ts`를 v2 스키마로 재작성.
- **MDX 콘텐츠 파이프라인 재구축** — `content.ts`・`seo.ts`・`mdx.tsx`・`related.ts` 실제 동작 확인. 신규 라우트 `/subsidy/[category]/[slug]`・`/area/[pref]/[city]`・`/compare/[slug]`・`/news/[slug]` 생성.
- `src/components/article/*` 8종 재작성(신규: 금액・마감을 카드로 보여주는 `SubsidyInfoCard`, 지역 횡단 비교표 `CompareTable`).
- 5개 카테고리(`shussan`・`jutaku`・`sogyo`・`kaigo`・`energy`) 각 Pillar 1건을 draft로 작성해 구조 검증(금액・URL은 실조사 전 플레이스홀더).
- `validate-content`・`check-links`・`stale-report`・`new-article` 스크립트 v2 복원.
- `src/lib/sources/jgrants.ts`, `http.ts` 등은 **보존・재활용** (전국 보조금 API 연동의 핵심 자산).
- v1 `data/` 잔재(원문 아카이브 36건, 관보 텍스트 82MB, 키워드 대장 등) 삭제.
- **5개 카테고리 전부 실제 published 기사 확보** — 전부 공식 정부 사이트(jGrants API・環境省・厚生労働省・経済産業省) 원문을 취득해 작성:
  - `sogyo`: 小規模事業者持続化補助金＜共同・協業型＞（jGrants API）
  - `jutaku`: 先進的窓リノベ2026事業（環境省、窓・ドア断熱改修で最大100万円）
  - `kaigo`: 介護保険の住宅改修費（厚生労働省、生涯20万円まで）
  - `energy`: 給湯省エネ2026事業（経済産業省、エコキュート等で7万円〜17万円）
  - `shussan`: 出産育児一時金（厚生労働省、子1人につき原則50万円）
  - 각 원문은 `data/sources/<slug>/`에 가공 없이 보관(README에 근거표 포함).
- **AGENTS.md 절대규칙 7 개정** — 원문 아카이브는 여전히 정본으로 가공 없이 보관하되, 기사 본문은 그 원문을 근거로 독자용으로 요약・재구성해도 된다는 점을 명문화.
- **지역 비교 페이지(`/area/`・`/compare/`) 실제 동작 확인** — `src/config/regions.ts`에 도쿄도 5개 구(千代田・港・品川・世田谷・渋谷)를 등록하고, 각 구의 출산급여를 공식 사이트 원문 취득 후 기사화. 5개 구를 비교하는 첫 `type: compare` 기사(출산축하금・출산비용조성 비교)를 작성. 제도가 「실비연동형(港区・千代田区, 최대31만엔)」「정액형(渋谷区, 상한10만엔)」「국가+구독자 조합형(世田谷区・品川区)」의 3패턴으로 갈리는 것을 확인.
- **헤더에 드롭다운 「特集」 메뉴 신설** — `/compare/`(객관적 비교표)와 별도로 `/tokushu/`(편집부가 순위를 매기는 콘텐츠, 예: 「子育てに手厚い市 TOP5」) 섹션을 만들었다. 카테고리는 향후 계속 추가하는 것을 전제로 별도 체계(`TOKUSHU_CATEGORIES`)로 설계. 순위는 최소 5건 이상이어야 빌드가 통과하도록 게이트를 걸어, 데이터 부족 상태의 추측성 랭킹을 원천 차단. **실제 순위 콘텐츠는 아직 0건** — 비교 가능한 지자체 데이터가 카테고리당 5건 이상 쌓인 뒤 작성하는 방침.
- 웹서버(Xserver) 배포 직후 서버 캐시(10분)로 구버전이 일시적으로 보일 수 있음을 확인 — 재배포 전에 캐시 우회 요청으로 먼저 재확인할 것.
- `npm run build` 정상 통과, published 기사 10건(카테고리별 1건 + shussan 지자체 5건 + compare 1건) 모두 정적 생성・검색 색인됨을 확인.
- **(참考) 이 프로젝트는 여러 세션이 동시에 작업할 수 있다.** 楽天アフィリエイト 연동(`src/lib/ads/`, `src/components/ads/`)은 별도 세션이 병행 작업한 것으로, v2 전환 작업과는 별개 계통이다. 세션별 작업 완료 기록은 `workspace/<날짜>-<주제>/`(gitignore 대상)에 남기는 관례가 있다.

**다음 단계**:
- `jutaku`(주택리폼) 카테고리에 지자체 단위 비교 확장(shussan에서 검증한 패턴 적용).
- `src/config/regions.ts`에 도쿄 23구 잔여 18개 구 및 타 도도부현 데이터 추가.
- `shussan`의 지자체 데이터가 더 쌓이면 첫 特集(순위) 기사 작성 검토.
- 콘텐츠가 쌓이는 대로 `docs/05_CONTENT_CALENDAR.md` 갱신.

## 문서 지도 (v2)

| 문서 | 내용 |
|---|---|
| `docs/00_MASTER_PLAN.md` | ★ 마스터 기획서 v2 — 전략・시장・로드맵・수익화・리스크 |
| `docs/01_IA_TAXONOMY.md` | 정보구조 v2 — 카테고리×지역 이중 축, 비교 페이지 설계 |
| `docs/02_REPO_STRUCTURE.md` | 디렉토리 구조 v2, v1 자산 처리 방침 |
| `docs/03_CONTENT_TEMPLATE.md` | 기사・보조금 레코드 작성 규격 v2 |
| `docs/04_EDITORIAL_GUIDELINE.md` | 편집 규범・문체・SEO/GEO・품질 게이트 v2 |
| `docs/05_CONTENT_CALENDAR.md` | 콘텐츠 캘린더 — 카테고리 확정 대기 중 |
| `docs/06_LEGAL_COMPLIANCE.md` | 법적 포지셔닝 v2 (완화판) |
| `docs/07`~`16` | v1 유산 문서(상단에 경고 배너 있음) — 참고만, 새 작업 근거로 쓰지 말 것 |

## 코드 정본 (문서보다 우선)

| 파일 | 역할 | 상태 |
|---|---|---|
| `src/config/site.ts` | 사이트 기본 설정・면책 문안 | v2 작성 완료 |
| `src/config/taxonomy.ts` | 분류체계 | v2 작성 완료(카테고리 5개 초안) |
| `src/config/regions.ts` | 지역 코드-슬러그 매핑 | v2 작성 완료(도도부현만, 시구정촌 단계적 확대 예정) |
| `src/lib/content-schema.ts` | frontmatter zod 스키마 | v2 작성 완료(subsidy 필드군 포함) |
| `src/lib/content.ts`, `seo.ts`, `mdx.tsx`, `related.ts` | MDX 로딩・렌더링・SEO 헬퍼 | v2 작성 완료 — 실제 동작 |
| `src/components/article/*` | 기사 렌더링 컴포넌트(`SubsidyInfoCard`・`CompareTable`・`TokushuRanking` 등) | v2 작성 완료 |
| `src/components/layout/TokushuNavDropdown.tsx` | 헤더 「特集」 드롭다운 | v2 작성 완료 |
| `src/lib/sources/jgrants.ts`, `http.ts` | 전국 보조금 API 연동 | **계승・재활용** |

## 개발

```bash
npm install
npm run dev
npm run build
npm run validate:content   # 전 기사 frontmatter 검증
npm run new:article -- --section subsidy --category shussan --slug <slug> --type cluster
```

> `npm run build`는 정적 export(out/)로 정상 생성된다. published 기사는 10건(5개 카테고리 각 1건 + shussan 지자체 5건 + 지역비교 1건). 카테고리 개요용 Pillar 5건은 여전히 draft(구조 검증용 플레이스홀더).

## 3대 원칙 (v2)

1. **一次情報にあたる。** 관공서 공식 발표를 확인하지 않은 기사는 쓰지 않는다.
2. **지역 비교가 핵심 가치다.** 단일 지자체 정보 나열이 아니라, 비교 가능한 형태로 재구성한다.
3. **정보 제공과 대행을 혼동하지 않는다.** 개별 신청서류 작성・제출 대행은 하지 않는다(`docs/06`).
