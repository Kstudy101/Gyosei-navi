# 行政タイムズ

> 프로젝트명 확정: 2026-08-17 (구칭: 行政書士ナビ・ジャーナル)

일본 행정서사(行政書士) 업무 전 분야를 다루는 일본어 종합 정보 미디어.

> **사이트 언어: 일본어 / 개발·기획 문서: 한국어**

## 시작하기

1. **`docs/00_MASTER_PLAN.md` 를 먼저 읽는다.** 모든 판단의 상위 규범.
2. **`docs/06_LEGAL_COMPLIANCE.md` 를 반드시 읽는다.** 자격 취득 전 넘으면 안 되는 선.
3. 기사를 쓸 때는 `docs/04_EDITORIAL_GUIDELINE.md` + `content/_TEMPLATE.mdx`.

## 문서 지도

| 문서 | 내용 |
|---|---|
| `docs/00_MASTER_PLAN.md` | ★ 마스터 기획서 — 전략·시장·로드맵·KPI·리스크 |
| `docs/01_IA_TAXONOMY.md` | 정보구조·분류체계 설계 의도 |
| `docs/02_REPO_STRUCTURE.md` | 디렉토리 구조와 설계 원칙 |
| `docs/03_CONTENT_TEMPLATE.md` | 기사 작성 규격·frontmatter 정의 |
| `docs/04_EDITORIAL_GUIDELINE.md` | 편집 규범·문체·SEO/GEO·품질 게이트 |
| `docs/05_CONTENT_CALENDAR.md` | 90일 콘텐츠 캘린더 |
| `docs/06_LEGAL_COMPLIANCE.md` | ★ 행정서사법 제19조 대응 |

## 코드 정본 (문서보다 우선)

| 파일 | 역할 |
|---|---|
| `src/config/site.ts` | 사이트 기본 설정·면책 문안 |
| `src/config/taxonomy.ts` | 분류체계 (카테고리·태그·noticeLevel) |
| `src/lib/content-schema.ts` | frontmatter zod 스키마 — 빌드 시 강제 검증 |
| `content/_TEMPLATE.mdx` | 기사 템플릿 |

## 개발

```bash
npm install
npm run dev              # 개발 서버
npm run validate:content # 전 기사 frontmatter 검증
npm run check:links      # legalBasis URL 생존 확인
npm run stale            # 6개월 미갱신 기사 리포트
npm run new:article      # 템플릿에서 신규 기사 생성
npm run build
```

> 로컬 환경에 pnpm이 없어 npm으로 운용한다 (2026-08-17). 스크립트는 PM 중립.

## 3대 원칙

1. **一次情報にあたる。** 관공서 원문을 읽지 않은 기사는 쓰지 않는다.
2. **주 2건을 지킨다.** 완벽한 3건보다 꾸준한 2건이 이긴다.
3. **선을 넘지 않는다.** 자격 취득 전에는 개별 상담·서류작성을 절대 하지 않는다.

## 현재 단계

**Phase 0 — 基盤構築 (2026.08~09)**
- [ ] 사이트명·도메인 확정
- [ ] Next.js 초기화 + 렌더링 파이프라인
- [ ] 신뢰 페이지(運営者情報·免責事項·プライバシーポリシー)
- [ ] 런칭 기사 8건 (永住ガイドライン改定 특집)
- [ ] ⏰ **퍼블릭코멘트 기사는 2026-09-04 전 발행**
