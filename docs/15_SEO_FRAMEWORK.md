# SEO 프레임워크 — 현황 대입표

> 작성: 2026-08-25 / 기준: 기사 61건 published + 도구 2종, 리포 전량 실측 감사
> 범례: ✅ 구현·운용 중 / 🟡 부분 구현 (갭 명시) / ⬜ 미착수 / ➖ 현 단계 비적용 (이유 명시)
> 갱신 규칙: 분기 1회, 또는 ⬜→착수 시 해당 행을 갱신한다. 근거 없는 상태 변경 금지 (파일·수치 인용 필수).

---

## 1. Strategy

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| Keyword Research | 🟡 | `docs/08_KEYWORD_RESEARCH.md` + `data/keywords.csv` (48행, `npm run keywords:seed`) | 대장이 시드 단계 — `volume_est`·`difficulty` 전부 공란. **GSC 데이터 유입 후 주간 루틴(docs/08 §운용)으로 채우는 것이 선결** |
| Search Intent | ✅ | keywords.csv `intent` 열 + `audience`(for-individual/for-business) 이원화. 페르소나 4종(00_MASTER_PLAN §2.3)별 타깃 명시 | — |
| Competitor Analysis | 🟡 | 00_MASTER_PLAN §2.2 경쟁 지형 + §1.3 차별화 3축 (개설 시 1회 분석) | 기사 단위 경쟁 분석 없음. keywords.csv `competitor_top3` 열이 전부 공란 — 리라이트 대상 선정 시부터 기입 |
| Topical Maps | ✅ | `docs/01_IA_TAXONOMY.md` + `src/config/taxonomy.ts` (코드가 정본). nyukan 중심 심화 → hojokin·keiyaku 확장 구조 | — |
| SEO Roadmap | ✅ | 00_MASTER_PLAN §8 Phase 0〜3 (Exit 기준 수치화: M6 10,000세션 / M12 30,000세션) | — |

## 2. On-page SEO

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| Title Tags | ✅ | docs/04 §4.1 규정(32자 이내, `主軸KW｜差別化요소·연호`) + `articleMetadata()`(`src/lib/seo.ts:29`)가 전 기사 출력 | — |
| Meta Descriptions | ✅ | docs/04 §4.2 (50〜160자, 결론 선행, KW 앞 40자) + frontmatter `description` zod 필수 | — |
| Headings | ✅ | docs/04 §4.3 고정 골격(리드→結論 블록→H2 구조→FAQ→編集長の一言) + rehype-slug/autolink | — |
| URL Optimization | ✅ | `/guide/{category}/{slug}` 로마자 슬러그, 계층 = 분류체계. 정적 export 라 트레일링 일관 | — |
| Internal Linking | ✅ | ① `relatedSlugs` **61/61 기사** (3〜5건 규정) ② docs/04 §4.5 Cluster↔Pillar 상호 링크 규칙 ③ 判定ナビ 87리프→관련기사 역링크 (`test:visa-navi` 가 실재·公開 검증) | — |
| Anchor Text | ✅ | docs/04 §4.5 에 설명형 앵커 의무·「こちら」류 금지 명문화 (2026-08-25). 기존 61건 전수 검사 위반 0건 | — |
| Image SEO | ⬜ | OG 이미지 62건뿐. **본문 내 이미지 0건** (도해는 전부 텍스트·표) | 캘린더에 「도해는 이미지로 추후」(Month 1 #6) 부채 있음. 이미지 도해 도입 시 alt 규정을 docs/04 에 신설 |

## 3. Content SEO

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| Content Strategy | ✅ | docs/05 캘린더 (Month 단위 테마 집중) + 주 2건 리듬 + 발행 리듬 주간표 | Month 5 캘린더 미수립 (기존 백로그 — 다음 작업 리스트 #2) |
| Topic Clusters | ✅ | frontmatter `type` 로 구조화: **pillar 9 / cluster 45** / news 3 / checklist 4 / tool 1. Month 별 pillar 1 + cluster 위성 패턴 | — |
| Pillar Content | ✅ | 분야별 pillar 9건 (永住GL改定·育成就労·配偶者ビザ·帰化 등) — Pillar→전 Cluster 목차 링크 규정 | — |
| Evergreen Content | ✅ | noticeLevel 체계(enforced 42/scheduled 9/draft-proposal 11)로 제도 기사의 시효 관리. guide/ 가 evergreen 본체 | — |
| Programmatic SEO | ➖ | — | 대량 템플릿 생성은 一次情報 원칙(전건 원문 대조)과 충돌. 판정ナビ 리프 페이지화 같은 안은 Phase 2 이후 검토 |
| Content Refresh | ✅ | ① `npm run stale` (6개월 미갱신 자동 검출) ② 갱신 정책 (결과공시 48h — **docs/14 런북**) ③ changelog frontmatter ④ 신규3:갱신1 비율 규정 | — |

## 4. Content Optimization

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| Keyword Optimization | ✅ | 기사별 主軸KW 1개 원칙 (캘린더 표에 명시) + 타이틀·description 배치 규정 | — |
| NLP Optimization | 🟡 | docs/04 §4.4: 첫 단락 완결 정의문(「◯◯とは〜」), 표 우선, 기준일 명시 | 규정은 있으나 준수 여부 자동 검사 없음 — 품질 게이트(§5) 수동 체크에 의존 |
| Entity Coverage | ✅ | 법령명·조문·고시번호를 원문 표기로 정확 인용 (절대규칙: 一次情報 대조). legalBasis 203건이 엔티티 그래프 역할 | — |
| Content Expansion | ✅ | 검수 시 원문 재대조로 보강 (예: #32 家族滞在 에 離婚·死別 절차 추가 — dcf0835 이전 커밋) | — |
| CTR Optimization | ⬜ | 타이틀 연호·숫자 규정만 존재 | GSC 유입 후: 표시 많고 CTR 낮은 쿼리 → 타이틀 리라이트 루틴 (docs/08 §루틴에 이미 설계됨, 데이터 대기) |

## 5. Technical SEO

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| Crawling | ✅ | 정적 HTML 91매 (JS 불요 렌더링) — 크롤러에 최적 형태 | — |
| Indexing | 🟡 | GSC 인증 파일 배포됨 (`public/google156c...html`) | 색인 상태 실측 데이터 미확인 — **GSC 에서 커버리지 리포트 첫 확인 필요** (§10 Analytics 와 동일 선결) |
| Site Structure | ✅ | 3계층 이내 (`/guide/nyukan/slug`), 카테고리 허브 페이지 존재, 빵부스러기 + BreadcrumbList | — |
| XML Sitemaps | ✅ | `src/app/sitemap.ts` — published 만 게재, lastModified=updatedAt. ⚠️ **/tools/visa-navi 누락을 2026-08-25 감사에서 발견·수정** | — |
| RobotsTXT | ✅ | `src/app/robots.ts` — 전체 허용 + sitemap 참조 | — |
| Canonicals | ✅ | `articleMetadata()` 가 전 기사에 canonical 출력 (`seo.ts:35`) | — |
| Schema Markup | ✅ | `src/lib/seo.ts`: Organization + WebSite (layout) / **Article + BreadcrumbList + FAQPage** (전 기사) / **WebApplication** (도구 2종, 2026-08-25 추가 — isAccessibleForFree + canonical 동시 정비) | — |
| Core Web Vitals | 🟡 | 정적 export + First Load JS 103〜133kB — 구조적으로 유리 | 실측 없음. GSC CWV 리포트 or PageSpeed Insights 로 첫 계측 |
| Page Speed | ✅ | 정적 배포(Xserver) + 이미지 없음 + pagefind 지연 로드 | — |

## 6. Off-page SEO

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| Link Building | ⬜ | 없음 | Phase 1 이후. YMYL 이므로 매입·교환 금지, 자연 획득 전제 |
| Digital PR | ⬜ | 없음 | 結果公示 당일 뉴스(docs/14 §6)가 첫 PR 기회 — 업계 최속 보도 실적 축적 |
| Guest Posting | ➖ | — | 무자격 단계에서 명의 기고는 행정서사법 19조 리스크 검토 선행 (docs/06) |
| Broken Link Building | ➖ | — | 리소스 대비 효율 낮음, 채택 안 함 |
| Resource Links | 🟡 | DL 체크리스트 4건(checklist type) + 무료 도구 2종이 피링크 자산 후보 | 배포는 되어 있으나 외부 확산 활동 없음 |
| Linkable Assets | ✅ | **判定ナビ**(87리프)·**永住セルフ診断**·官報 아카이브·통계 데이터(e-Stat 191,475건) — 링크 유인 자산은 이미 보유 | 자산을 소개하는 앵커 페이지(/data 확충) + e-Stat 통계 도해 기사로 인용 유도 |
| Brand Mentions | ⬜ | 지명검색 발생이 12개월 KPI (00_MASTER_PLAN) | 계측만 GSC 로 (쿼리에 사이트명 출현 추적) |

## 7. SaaS SEO → 본 사이트 번안: 도구·BOFU 페이지

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| Feature Pages → 도구 소개 | ✅ | `/tools` 허브 + 각 도구 전용 기사 (#30 判定ナビ 고지 기사) | — |
| Use Case Pages → 상황별 가이드 | ✅ | 「離婚したら在留資格は」「転職時の手続」 등 상황 기점 cluster 다수 | — |
| Integration Pages | ➖ | — | 해당 모델 없음 |
| Alternative Pages | ➖ | — | 해당 모델 없음 |
| Comparison Pages | ✅ | 「永住vs帰化」「技能実習vs育成就労」「1号vs2号」 — 비교표 필수 규정(docs/04 §4.4)과 결합 | 비교 포맷의 횡전개 여지 (특定技能vs技人国 등 — Month 5 후보) |
| Free Tools | ✅ | **判定ナビ**(13,294경로 자동검증) + **永住セルフ診断** — 검색쿼리 「在留資格 診断」 선점용 | 도구 페이지 스키마 (§5 Schema 참조) |
| BOFU Content | ✅ | checklist 4건 = 리드 마그넷 (배포자 DL → Phase 1 에서 LINE 등록 관문으로 전환 예정) | LINE 개설 후 DL 을 등록 유도로 연결 (Phase 1) |

## 8. International SEO

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| Hreflang / Multilingual / Localization / Geo | ⬜ 보류 | `docs/12_I18N_WORKPLAN.md` 에 설계 완료 (en/zh/vi/ko, `/{lang}/` 프리픽스, hreflang 계획 포함) | **2026-08-19 사용자 결정으로 보류** — 콘텐츠 축적 우선. 착수 시 docs/12 를 그대로 실행 |

## 9. AI SEO (GEO/LLMO) — 본 사이트의 차별화 축

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| AI Overviews | ✅ | docs/04 §4.4 체크리스트: 완결 정의문·인용 가능 FAQ 답변·표 구조·기준일 명시 — **FAQ 62/62 기사 100%** + FAQPage JSON-LD | — |
| AI Mode / AI Search | 🟡 | 구조 대응은 완료 (상동). 一次情報 인용(legalBasis 203건)이 AI 인용 신뢰도 근거 | **인용 발생 실측 없음** — KPI 「M0 구조 설계 → 인용 발생 확인」(00_MASTER_PLAN §7)의 후반이 미계측. 월 1회 주요 쿼리를 AI 검색에서 수동 확인하는 루틴 신설 |
| ChatGPT SEO | ✅ | `/llms.txt` **빌드 시 자동 생성** (`src/app/llms.txt/route.ts`, 2026-08-25) — published 기사 61건 전량 + 도구·정책 페이지를 sitemap.ts 패턴으로 생성. 정적 파일이 아니라 기사 증가 시 자동 갱신 | — |

## 10. Analytics

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| Search Console | 🟡 | 인증 파일 배포 완료 | **데이터 확인 실적 없음 — 현 시점 SEO 전체의 최대 병목.** GSC 접속 → sitemap 제출 확인 → 커버리지·쿼리 첫 리포트. keywords.csv·CTR·리라이트 루틴이 전부 여기 의존 |
| Google Analytics | ✅ | GA4 프로덕션 주입 확인 (2026-08-23 실측) — `Analytics.tsx` + GitHub Variables | — |
| Rank Tracking | ⬜ | 없음 | 유료 툴 대신 GSC 평균 게재순위로 대체 (부업 예산 원칙). 主軸KW 목록은 캘린더에 이미 존재 |
| Traffic Analysis | 🟡 | GA4 수집 중 + Clarity **미주입** (Variables 미설정) | `NEXT_PUBLIC_CLARITY_ID` 발급·등록 (기존 백로그) |
| Conversion Tracking | ⬜ | 전환 정의 자체가 미설정 | Phase 1 에서: DL 클릭·LINE 등록을 GA4 이벤트로. `/api/lead` 라우트가 자리만 존재 |
| SEO Reporting | 🟡 | 주간 루틴에 「日: GSC 지표 확인」 설계됨 (docs/05) | GSC 가동 후 실행 개시 |

## 11. SEO Audit

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| Technical Audit | ✅ | CI 매 push: `validate:content`(frontmatter 강제) + build + tsc. 본 문서의 §5 가 수동 감사 결과 (visa-navi sitemap 누락 발견이 그 성과) | — |
| Content Audit | ✅ | `npm run stale` + 締切 마스터 점검 (weekly-audit 매주 자동) | — |
| Backlink Audit | ➖ | 백링크 자체가 0 인 단계 | Phase 1 이후 |
| Competitor Audit | ⬜ | 개설 시 1회뿐 | 반기 1회 경쟁 지형 재점검 (00_MASTER_PLAN §2.2 갱신) |
| Indexing Audit | ⬜ | — | GSC 가동 후: 색인 제외 페이지 원인 분석을 weekly 루틴에 편입 |

## 12. SEO Tools

| 항목 | 상태 | 비고 |
|---|---|---|
| Ahrefs / Screaming Frog / Keywords Everywhere | ➖ | 유료 툴 미도입 — 부업 예산 원칙 (00_MASTER_PLAN §1.3: AI 파이프라인으로 외주비 0 수렴). 필요 기능은 자작 스크립트로 대체 중 |
| Search Console / Google Analytics | 🟡 / ✅ | §10 과 동일 |
| 자작 대체 도구 | ✅ | `check:links`(죽은 링크) / `stale`(콘텐츠 부패) / `validate:content`(온페이지 규격) / `test:visa-navi`(내부링크 실재) / monitor 98소스(신선도 시그널 소스) — Screaming Frog 역할의 상당 부분을 커버 |

## 13. Growth

| 항목 | 상태 | 현재 실체 | 갭 / 다음 액션 |
|---|---|---|---|
| SEO Wins | 🟡 | 발행 37기사(캘린더분)를 4개월치 → 3주에 압축 완료라는 속도 자산 | 검색 성과 실측이 없어 "win" 판정 불가 — GSC 대기 |
| Traffic Growth | ⬜ | KPI: M6 10,000 / M12 30,000 세션 | GA4 데이터 축적 후 월간 리뷰 개시 |
| Content Scaling | ✅ | 파이프라인 확립: 감시(98소스)→Issue→검수→발행→갱신. AI 초고+원문 대조 워크플로 (docs/04 §7) | Month 5 캘린더가 스케일의 다음 연료 |
| SEO Automation | ✅ | 5 워크플로(CI/monitor/kanpo/audit/deploy) + changedetection 11건 + 원문 취득·법령 인용 CLI 군 — **이 항목이 본 프로젝트의 최강점** | — |
| Experimentation | ⬜ | 없음 | 데이터 유입 후: 타이틀 A/B(리라이트 전후 CTR 비교)부터. 실험 기록은 keywords.csv `memo` 열 활용 |

---

## 종합 — 상태 분포와 우선순위

**분포**: ✅ 34 / 🟡 9 / ⬜ 11 / ➖ 8 (62항목 — 2026-08-25 갱신: llms.txt·도구 스키마·앵커 규정 완료)

구조·콘텐츠·기술·자동화(§2〜5, 13)는 상위 수준으로 완비. 남은 갭은 **측정과 확산**에 집중되어 있다:

1. **GSC 가동 확인** — ⬜/🟡 의 절반(CTR·Rank·Indexing·Reporting·keywords.csv·SEO Wins)이 이것 하나에 막혀 있다. 최우선 (계정 접속 필요 — 사용자 작업)
2. **Clarity 주입** — GitHub Variables 1개 (계정 발급 필요 — 사용자 작업)
3. Off-page 는 Phase 1 이후 — 結果公示 뉴스(docs/14 §6)가 첫 Digital PR
