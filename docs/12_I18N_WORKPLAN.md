# 다국어화(i18n) 작업 계획서 — 외국인 독자 대응

> 작성일: 2026-08-19 / 상태: **보류 (2026-08-19 사용자 결정 — 착수 시점 미정, 콘텐츠 축적 우선)**
> 상위 문서: [00_MASTER_PLAN.md](00_MASTER_PLAN.md) — ※ 마스터 플랜의 "사이트 100% 일본어" 원칙을 **일부 개정**하는 작업임(§0 참조)
> 배포 제약: [11_DEPLOY_XSERVER.md](11_DEPLOY_XSERVER.md) — 정적 export(Apache)이므로 서버 사이드 처리 불가

---

## 0. 전제와 결정 사항

| 항목 | 결정 | 근거 |
|---|---|---|
| 감지 방식 | **브라우저 언어(`navigator.languages`) 감지 → 제안 배너** (강제 리다이렉트 금지) | IP 강제 리다이렉트는 Google 비권장·오판정 많음. 정적 호스팅이라 서버 IP 감지 자체가 불가 |
| IP 기반 감지 | Phase 4 옵션 (Cloudflare 프록시 도입 시에만) | Xserver에는 GeoIP 모듈 없음 |
| 1차 지원 언어 | **en / zh(간체) / vi / ko** (일본 체류 외국인 국적 상위: 중국·베트남·한국 + 영어) | 2차(pt/ne/tl)는 트래픽 확인 후 |
| URL 구조 | `/{lang}/...` 프리픽스. 기존 일본어 URL은 무변경 | SEO 자산 보존 |
| 번역 범위 | UI 전체 + **入管(nyukan) 분야 기사 우선** 선별 번역 | 외국인 당사자 수요가 집중된 분야. 전 기사 4개 언어 유지보수는 비현실적 |
| 미번역 폴백 | 일본어 원문 표시 + 해당 언어로 안내 문구 | |

---

## Phase 1 — i18n 인프라 (URL 구조·UI 사전·언어 스위처)

- [ ] **I18N-01** 언어 설정 모듈 `src/config/i18n/` 신설
  - 지원 언어 목록(`ja` 기본 + `en/zh/vi/ko`), 언어명 표기, locale 매핑 상수
  - UI 문자열 사전(헤더·푸터·카테고리명·공통 라벨) 언어별 파일 분리
- [ ] **I18N-02** `src/app/[lang]/` 라우트 세그먼트 추가
  - `generateStaticParams`로 4개 언어 전 페이지 정적 생성 (`dynamicParams=false` 유지 — export 필수 조건)
  - 기존 `src/app/` 일본어 루트는 그대로 유지
- [ ] **I18N-03** Header/Footer 등 공통 컴포넌트를 사전 기반으로 리팩터링 + 언어 전환 드롭다운 추가
  - AC: 어떤 페이지에서든 언어 전환 시 동일 페이지의 해당 언어판(없으면 그 언어의 톱)으로 이동
- [ ] **I18N-04** SEO 배선
  - 전 페이지 `hreflang` 상호 링크(`x-default` 포함), [sitemap.ts](../src/app/sitemap.ts)에 언어별 URL 추가, `lang` 속성·OG locale 반영 ([seo.ts](../src/lib/seo.ts) 확장)
  - AC: `next build` 후 out/에 언어별 HTML 생성 + hreflang 상호 참조 검증

## Phase 2 — 언어 자동 감지 + 제안 배너

- [ ] **I18N-05** 클라이언트 감지 스크립트 (`src/components/i18n/LangSuggestBanner.tsx`)
  - 첫 방문 시 `navigator.languages`와 지원 언어 매칭 → 상단 배너를 **해당 언어로** 표시 ("View this site in English?")
  - 수락/거부 결과를 `localStorage`에 저장, 재방문 시 배너 미노출·선택 언어 자동 적용
  - AC: 강제 리다이렉트 없음 / 거부 후 재노출 없음 / JS 미실행 환경에서 사이트 정상 동작
- [ ] **I18N-06** 언어 선택 기억과 내부 이동 일관성 (일본어판 ↔ 번역판 왕복 시 선택 유지)

## Phase 3 — 콘텐츠 번역 파이프라인

- [ ] **I18N-07** MDX frontmatter 스키마 확장 ([validate-content.ts](../scripts/validate-content.ts))
  - `lang`(기본 ja), `translationOf`(원문 slug) 필드 추가, zod 검증·상호 참조 무결성 체크
- [ ] **I18N-08** 콘텐츠 디렉터리 규약 확정 (`content/{lang}/guide/...` 방식) + [mdx.tsx](../src/lib/mdx.tsx) 로더 대응
- [ ] **I18N-09** 1차 번역 대상 선정 및 번역 (편집 결정 필요)
  - 후보: nyukan 분야 — 永住 시리즈(8건), 育成就労 시리즈(8건), 特定技能 관련
  - 우선 **영어 1개 언어 × 5~8건**으로 파일럿 → 품질·공수 검증 후 zh/vi/ko 확대
  - AC: 번역 기사에 원문 링크 + "번역판" 표시, 법령 용어는 일본어 원어 병기
- [ ] **I18N-10** 미번역 페이지 폴백 UI (일본어 본문 상단에 해당 언어 안내 문구)
- [ ] **I18N-11** stale-report에 번역판 추적 추가 — 원문 개정 시 번역판 갱신 필요 목록 출력 ([stale-report.ts](../scripts/stale-report.ts))

## Phase 4 — (옵션) Cloudflare 도입 시 IP 국가 감지

- [ ] **I18N-12** 도메인 DNS를 Cloudflare 프록시로 전환 (호스팅은 Xserver 유지)
- [ ] **I18N-13** `CF-IPCountry` 헤더 기반 언어 제안을 Worker로 구현 (Phase 2 배너의 보조 신호로만 사용, 강제 리다이렉트는 계속 금지)
- 착수 조건: Phase 2 방식의 감지 정확도가 실측으로 부족하다고 판단될 때만

---

## 의존 관계와 착수 순서

```
I18N-01 ─→ I18N-02 ─→ I18N-03 ─→ I18N-04   (Phase 1: 한 묶음으로 배포 가능)
                          │
                          ▼
                      I18N-05 ─→ I18N-06     (Phase 2)
I18N-07 ─→ I18N-08 ─→ I18N-09 ─→ I18N-10 ─→ I18N-11   (Phase 3: Phase 1 완료 후 병행 가능)
I18N-12 ─→ I18N-13   (Phase 4: 독립, 보류)
```

- **Phase 1+2까지 완료하면** 번역 기사가 0건이어도 "UI 다국어 + 자동 언어 제안"이 동작한다.
- **미결 사항(사용자 결정 대기)**: ① 1차 언어 4종(en/zh/vi/ko) 확정 여부 — 영어 단독 파일럿으로 축소 가능, ② I18N-09 번역 대상 기사 선정.
