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

> 갱신: 2026-09-20. v1 시절 진행 상황(`published 75기사` 등)은 전부 무효 — 새 콘텐츠는 0건부터 시작한다(published 기준. draft는 아래 참조).

**현황**: 문서 재설계, v1 콘텐츠・코드 정리, v2 스캐폴딩, **MDX 콘텐츠 파이프라인 재구축까지 완료.**
- `content/`(v1 기사 76건)・`prompts/`・v1 전용 라우트/컴포넌트/lib/scripts 삭제.
- `src/config/{site,taxonomy,regions}.ts`・`src/lib/content-schema.ts` v2 스키마로 재작성.
- `src/lib/content.ts`・`seo.ts`・`mdx.tsx`・`related.ts`를 실제 동작하는 로직으로 재구축(섹션: `subsidy`/`compare`/`news`).
- 신규 라우트 4종 생성: `/subsidy/[category]/[slug]`, `/area/[pref]/[city]`, `/compare/[slug]`, `/news/[slug]`.
- `src/components/article/*` 8종 재작성(신규: `SubsidyInfoCard` 금액・마감・모집상태 카드, `CompareTable` 지역 횡단 비교표).
- 5개 카테고리(`shussan`・`jutaku`・`sogyo`・`kaigo`・`energy`) 각 Pillar 1건을 **status: draft**로 작성 — frontmatter/컴포넌트 구조 검증용 플레이스홀더이며 **금액・URL은 실제 조사 없이 채운 자리표시자다.** published 전환 전 반드시 원문 확인 필요(`content/subsidy/*/[slug].mdx` 파일 상단 경고 참조).
- `validate-content`・`check-links`・`stale-report`・`new-article` 스크립트 v2 복원, `package.json`에 재연결.
- `npm run build` 정상 통과(63페이지 색인 확인), draft 기사는 프로덕션 빌드에서 자동 제외됨을 검증.

**다음 우선순위**
1. **실제 콘텐츠 조사 착수** — 5개 draft 중 최소 1건을 실제 지자체・국가 공식 사이트 조사로 채워 `published`로 전환. `sogyo`(창업・사업)는 `npm run subsidies`(jGrants API)로 실데이터 확보가 가장 빠르다.
2. **초기 착수 카테고리 우선순위 압축 검토** — 5개 동시 착수로 확정했으나(2026-09-20), 실제 집필 리소스에 따라 1~2개 우선 완성 후 확장하는 방식도 재검토 가능.
3. **`src/config/regions.ts`에 시구정촌 데이터 추가** — 현재 47도도부현만 등록, `MUNICIPALITIES`는 빈 배열. 기사화할 지자체가 정해지는 대로 추가(`docs/01` §4.1 예시 참조).
4. 실제 기사가 쌓이기 시작하면 `docs/05_CONTENT_CALENDAR.md`를 진행 상황에 맞춰 갱신.

**주의**:
- **draft 기사에 적힌 금액・마감일・URL은 전부 플레이스홀더다.** 절대 그대로 published로 바꾸지 말 것 — AGENTS.md 절대규칙 7(원문 확인 없이 쓰기 금지)・9(AI가 만든 수치 그대로 쓰기 금지) 위반이 된다.
- v1 시절 「기사를 쓴 제도는 감시 등록」 원칙은 보조금 마감・조건 변경 추종에도 유효한 발상이다 — 감시 체계 재구축 시 이 교훈을 계승할 것(`docs/10_MONITORING_REGISTRY.md` 상단 배너 참조). `prompts/monitor/`는 삭제됐으므로 새로 설계해야 한다.
- 일본어 문체 점검 시 `docs/04_EDITORIAL_GUIDELINE.md` §3.4(AI 특유 번역투・상투구 카탈로그, 2026-09-20 신설)를 참고할 것 — `github.com/coji/natural-japanese` 스킬의 검증된 패턴을 요약 반영했다.

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
| `src/components/article/*` | 기사 렌더링 컴포넌트 8종 | **v2 작성 완료**(`SubsidyInfoCard`・`CompareTable` 신규) | 통상 리뷰 |
| `src/lib/sources/jgrants.ts`, `http.ts` | 전국 보조금 API 연동 | **v1 그대로 유효 — 재활용** | 변경 시 통상 리뷰 |

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
7. **제도 원문을 가공해서 「원문」이라고 저장 금지.**
   요약 도구(WebFetch 등)의 출력은 요약이지 원문이 아니다. HTML 페이지는 `npm run source`로
   취득한다(태그만 제거하고 문자는 치환하지 않음). PDF는 직접 다운로드해 읽는다.
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
