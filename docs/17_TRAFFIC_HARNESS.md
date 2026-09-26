# 트래픽 하네스 총람 (2026-09-22)

트래픽 유입 요소를 파이프라인・빌드・워크플로에 구조화한 내역과, 자동화할 수 없어 사람 결정이 남은 항목의 백로그. 개별 설계 배경은 각 파일의 주석 참조.

## 1. 자동으로 돌아가는 것 (손대지 않아도 됨)

| 요소 | 구현 | 트리거 |
|---|---|---|
| OG 이미지 자동 생성 | `scripts/generate-og-images.ts` + `src/lib/seo.ts` 폴백 | deploy 시 (Actions 캐시로 증분) |
| compare 정보 이미지 (지도+마감 목록, OG・16:9・4:3・1:1) + Discover `max-image-preview:large` | `scripts/generate-og-images.ts`, `CompareTable.tsx`, `layout.tsx` | deploy 시 (구조화 필드만 사용 — amount 자유문은 그리지 않음) |
| 지역 허브 (시구정촌×카테고리) | `src/app/area/[pref]/[city]/[category]/` | 기사 1건 이상 조합 자동 생성 |
| 지역 허브 (도도부현×카테고리) | `src/app/area/[pref]/[city]/`의 카테고리 분기 | 〃 (`/area/{pref}/{category}`) |
| 태그 아카이브 | `src/app/tag/[tag]/` | 기사 2건 이상 태그 자동 생성 |
| 締切カレンダー | `src/app/calendar/` | 매 배포 재생성 (`subsidy.periodEnd`) |
| sitemap (씬페이지 제외・허브/태그 포함) | `src/app/sitemap.ts` | 매 빌드 |
| RSS / llms.txt | `src/app/feed.xml/`, `src/app/llms.txt/` | 매 빌드 |
| 사이트 내 검색 | postbuild Pagefind + `/search` | 매 빌드 |
| 구조화 데이터 (MonetaryGrant 등) | `src/lib/seo.ts` | 매 빌드 |
| IndexNow 제출 | `scripts/indexnow-submit.mjs` | deploy 후 (변경 published 기사만) |
| 구 v1 URL 301 회수 | `public/.htaccess` (`/guide|practice|exam`) | 상시 |
| 변화 감지 → Issue | `watch-municipalities.yml` | 매일 07:00 JST |
| 링크 생존・노후 기사 → Issue | `weekly-audit.yml` | 매주 월 06:00 JST |

## 2. 커맨드로 돌리는 것 (사람이 트리거, 실행은 자동)

| 커맨드 | 용도 | 비고 |
|---|---|---|
| `/publish-batch` | 기사 일괄 발행 | 저커버리지 도도부현 우선(2-2), 국가 pillar 제안(2-3) 규칙 반영 |
| `/publish-news` | 감지 Issue → 뉴스 기사화 | watch-municipalities Issue를 소화. Discover・시사성 쿼리용 |
| `/backfill-tags` | 기존 기사 tags 백필 | 1회성 부채 해소(published 347건). 완료 후 태그 아카이브가 확장됨 |
| ~~`/translate-articles`~~ | **정지(2026-09-26)** | 신규 번역 중단. 방문자는 브라우저 번역에 맡기고 헤더 언어 탭도 삭제. 기존 `content-i18n/`은 hreflang과 함께 유지하고, GSC 언어별 유입을 보고 존폐를 판단 |

신규 기사 품질 게이트: writer가 tags 3~6개 필수(`writer.md`), seo-researcher가 표기 통일 검수, `validate:content`가 빈 tags를 요약 경고.

## 3. 사람 결정이 남은 백로그 (자동화 불가 또는 비즈니스 판단)

- **GSC 피드백 루프**: Search Console API 자격증명 발급 필요. 연동하면 "노출 있는데 CTR 낮은 페이지" 타이틀 개선과 실유입 쿼리 기반 토픽 선정을 자동화할 수 있다.
- **SNS 자동 포스팅**: X(구 트위터) 계정 개설 + API 키 필요. 발행 커밋 → 새 기사 자동 포스팅 워크플로는 키만 있으면 deploy-xserver.yml에 한 스텝이다.
- **피드 애그리게이터 등록**: `/feed.xml`이 생겼으므로 Feedly는 즉시, SmartNews 등은 매체 심사 신청 필요.
- **E-E-A-T 감수자**: 행정서사 등 감수자 실명 표기. YMYL 인접 영역이라 순위 효과가 크지만 계약이 필요한 비즈니스 결정.
- **보조금 진단 툴**: frontmatter `type: "tool"`이 예약돼 있음. 체류시간・백링크 확보 수단이지만 UX 설계가 선행돼야 함.
- **구 URL 개별 매핑**: 현재는 섹션 단위 301(→ 톱/subsidy). GSC에서 404 유입 상위 URL이 확인되면 개별 매핑을 `.htaccess`에 추가.
