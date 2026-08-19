# 기사 작성 규격

> 실제 템플릿 파일: **`content/_TEMPLATE.mdx`** (신규 기사는 이걸 복사)
> 스키마 정본: **`src/lib/content-schema.ts`** (zod — 빌드 시 강제 검증)

## 1. 기사 생성 절차

```bash
pnpm new:article --category nyukan --slug eiju-guideline-kaitei-2026 --type pillar
# → content/guide/nyukan/eiju-guideline-kaitei-2026.mdx 생성
```

## 2. frontmatter 필드 정의

| 필드 | 필수 | 타입 | 설명 |
|---|:---:|---|---|
| `title` | ● | string(10-60) | 32자 이내 권장. `主軸KW｜差別化・年号` |
| `slug` | ● | kebab-case | 영소문자·숫자·하이픈만 |
| `category` | ● | enum | 8대 분야 코드 |
| `subcategory` | | string | `eiju` `zairyu` `kika` 등 |
| `type` | ● | enum | pillar / cluster / news / checklist / interview / tool |
| `audience` | ● | array | 독자축 태그 1개 이상 |
| `tags` | | array | 제도축·형식축 태그 |
| `description` | ● | string(50-160) | meta description. 결론 우선 |
| `publishedAt` | ● | YYYY-MM-DD | |
| `updatedAt` | ● | YYYY-MM-DD | ≥ publishedAt |
| `author` | ● | string | 기본 `editorial` |
| `reviewedBy` | ● | string\|null | **자격 취득 후 활성화** |
| `status` | ● | enum | draft / review / published / archived |
| `noticeLevel` | ● | enum | enforced / scheduled / draft-proposal / outdated |
| `legalBasis` | ● | array | **published 시 최소 1건 필수** — 없으면 빌드 실패 |
| `relatedSlugs` | | array | 3~5건 |
| `faq` | | array | **3건 이상 강력 권장** (GEO 대응) |
| `ogImage` | | path | `/og/{slug}.png` |
| `targetKeywords` | | array | 내부 관리용 (미출력) |
| `changelog` | | array | 갱신 이력 |

## 3. `noticeLevel` 운용 — 이 프로젝트의 신뢰 장치

| 값 | 표시 배너 | 사용 시점 |
|---|---|---|
| `enforced` | 없음 | 이미 시행 중인 제도 |
| `scheduled` | 「施行予定です。変更の可能性があります」 | 시행일 확정, 미도래 |
| `draft-proposal` | 「改定案に基づく解説です。確定した制度ではありません」 | **퍼블릭코멘트 단계** ← 永住 특집이 여기 |
| `outdated` | 「改正前の制度です。最新記事をご確認ください」 | 구제도 아카이브 |

> 제도 개정을 최속으로 다루는 미디어의 최대 리스크는 **「案」을 「決定」으로 오독시키는 것**이다.
> `noticeLevel`은 그 리스크를 시스템으로 차단하는 장치이며, 동시에 **「이 미디어는 정확하다」는 신뢰 시그널**이다.

## 4. 본문 MDX 컴포넌트

| 컴포넌트 | 용도 |
|---|---|
| `<Callout type="info\|warning\|danger">` | 주의 환기 |
| `<Checklist items={[...]} />` | 필요 서류 등 |
| `<FAQ />` | frontmatter의 `faq` 자동 전개 + JSON-LD 출력 |
| `<Disclaimer />` | **전 기사 말미 필수** — 법19조 대응 정형문 |
| `<NoticeBanner />` | `noticeLevel` 기반 자동 배너 (레이아웃에서 자동 삽입) |
| `<LegalBasisList />` | `legalBasis` 자동 전개 (기사 말미) |
| `<CompareTable />` | 現行 vs 改定案 비교 |
| `<LineCta />` | LINE 유도 (리드 마그넷 연동) |
| `<ConsultCta />` | **Phase C에서만 활성화** — 상담 예약 |
| `<Deadline id="..." />` | 마감 카운트다운. `id`는 `src/config/deadlines.ts`에 등록된 것만 (미등록이면 빌드 실패) |

> `<Deadline />`은 마감이 지나면 자동으로 「受付終了」 표시로 바뀌므로 **방치해도 오보가 되지 않는다.**
> 단 「다음 회차로 갱신」은 사람이 해야 하며, `npm run stale`이 마감 임박(D-7)·경과 건을 알려준다.
> 날짜는 반드시 一次情報 원문에서 확인해 `verifiedAt`과 함께 등록하고, 본문 표기와 일치시킬 것.

## 5. 본문 구조 (고정)

```
リード(2〜3문 — 정의·결론)      ★AI 검색 인용 지점
## この記事の結論                3행 요약
## 1. 制度・手続きの詳細解説      원문 인용 필수
## 2. 実務上の注意点
### IT・オンラインでの解決策      ★전 기사 필수
## 3. 必要書類チェックリスト
## まとめ                        표(費用·期間·申請先·根拠法令)
## よくある質問                  <FAQ />
## 編集長の一言                  1~2문
<LegalBasisList />
<Disclaimer />
```

## 6. 분량 기준

| type | 분량 | 소요 시간 |
|---|---|---|
| news | 1,500~2,500자 | 1.5h |
| cluster | 2,500~4,000자 | 2h |
| pillar | 5,000~10,000자 | 5h+ |
| checklist | 1,000자 + 자료 | 2h |

## 7. 발행 전 확인

→ `04_EDITORIAL_GUIDELINE.md` §5 품질 게이트 체크리스트
