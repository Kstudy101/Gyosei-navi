# AGENTS.md — 코딩 에이전트용 프로젝트 규범

> Cursor / GitHub Copilot / Claude Code 공통. 작업 시작 전 이 파일을 먼저 읽을 것.

## 프로젝트 개요

**行政書士ナビ・ジャーナル (gyosei-portal)** — 일본 행정서사(行政書士) 업무 전 분야를 다루는 **일본어** 종합 정보 미디어.
（※ 2026-08-17 「行政タイムズ」안 검토 후 원안 유지로 확정. 문서에 行政タイムズ/gyosei-times 표기가 남아 있으면 이 명칭으로 읽을 것）

- 사이트 언어: **일본어 100%**
- 코드 주석·문서·커밋 메시지: 한국어 또는 일본어 (혼용 가능)
- 사용자와의 대화: **한국어**

## 지금 해야 할 일

👉 **`docs/07_DATA_PIPELINE_WORKORDER.md`** — 자료수집 파이프라인 구축 작업지시서.
**2026-08-17 TASK-01/02/03/06 완료, TASK-04/05/07 골격 완료** (완료 보고는 `docs/07_COMPLETION_REPORT.md`).
다음 우선순위: 런칭 기사 2건의 원문 대조 검수 → 발행 (⏰ パブコメ 締切 **2026-09-04 0時** = 9/3 중).

## 문서 우선순위

작업 전 반드시 읽을 것:

| 순위 | 문서 | 내용 |
|---|---|---|
| 1 | `docs/00_MASTER_PLAN.md` | 마스터 기획서 — 모든 판단의 상위 규범 |
| 2 | `docs/06_LEGAL_COMPLIANCE.md` | ★ 행정서사법 제19조 대응 — **넘으면 안 되는 선** |
| 3 | `docs/07_DATA_PIPELINE_WORKORDER.md` | 현재 작업지시서 |
| 4 | `docs/04_EDITORIAL_GUIDELINE.md` | 기사를 쓸 때 |
| 5 | `docs/02_REPO_STRUCTURE.md` | 파일을 어디에 둘지 모를 때 |

## 코드 정본 (문서보다 우선)

| 파일 | 역할 | 변경 시 |
|---|---|---|
| `src/config/site.ts` | 사이트 설정·면책 문안 | **승인 필요** |
| `src/config/taxonomy.ts` | 분류체계 정본 | **승인 필요** + `docs/01` 동시 갱신 |
| `src/lib/content-schema.ts` | frontmatter zod 스키마 | **승인 필요** |
| `content/_TEMPLATE.mdx` | 기사 템플릿 | 승인 필요 |

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
4. **엔드포인트를 추측으로 쓰지 말 것.** 공식 문서/Swagger를 열어 확인하고, 알아낸 스펙은 `docs/api/` 에 기록한다.
5. **관공서 서버에 초당 1회 이상 요청 금지.** User-Agent를 명시한다.
6. **파싱 실패를 「0건」으로 처리 금지.** 명확히 실패시킨다.
7. **법령 원문을 가공해서 「원문」이라고 저장 금지.**
   요약 도구(WebFetch 등)의 출력은 요약이지 원문이 아니다. HTML 페이지는 `npm run source`로
   취득한다(태그만 제거하고 문자는 치환하지 않음). PDF는 직접 다운로드해 읽는다.
   `src/lib/sources/monitor.ts`의 `extract()`는 差分검지용으로 날짜를 `<DATE>`로 치환하므로 원문 저장에 쓰지 말 것.
8. **`legalBasis` 없는 기사는 published 불가** — zod 스키마가 빌드를 막는다. 우회하지 말 것.

## 법적 제약 (중요)

운영자는 **행정서사 유자격자가 아니다.** 따라서 사이트에:

- ❌ 개별 상담·서류작성 대행을 시사하는 기능·문구
- ❌ 「行政書士」를 자칭하거나 오인시키는 표현
- ❌ 결과 보증 표현 (「必ず」「確実に」)

를 넣어서는 안 된다. 상세는 `docs/06_LEGAL_COMPLIANCE.md`.
CTA 컴포넌트는 `src/components/cta/` 에 격리하고, 자격 취득 후 교체할 수 있게 만든다.

## 커맨드

```bash
npm run dev
npm run build
npm run validate:content   # 전 기사 frontmatter 검증
npm run check:links        # legalBasis URL 생존 확인
npm run stale              # 6개월 미갱신 기사 리포트
npm run new:article        # 템플릿에서 기사 생성
npm run law -- --law "行政書士法" --article 19   # 법령 조문 취득 (e-Gov 法令API v2)
npm run source -- --url <URL> --out data/sources/<topic>/NN_<name>.txt   # 一次情報 페이지 원문 취득
npm run monitor            # 一次情報 변경 감지 (prompts/monitor/sources.yaml)
npm run pubcomment         # e-Gov パブコメ 신착 감시
npm run stats              # e-Stat 통계 (ESTAT_APP_ID 필요)
npm run keywords:seed      # 키워드 대장 시드
```

API 스펙은 `docs/api/*.md` 에 조사 결과가 있다. **엔드포인트를 새로 쓸 때는 반드시 거기부터 읽고, 없으면 공식 문서를 열어 확인 후 추가한다.**

## 작업 완료 시

`docs/07_DATA_PIPELINE_WORKORDER.md` §5의 완료 보고 양식에 맞춰 보고할 것.
