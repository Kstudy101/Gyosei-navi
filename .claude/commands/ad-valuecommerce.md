---
description: ValueCommerce 광고주를 등록/수정/점검하고 published 기사와의 매칭을 확인한다
---

사용자 입력(광고주 URL·이름, 제휴 카테고리/키워드, 또는 "점검"/"목록"):

$ARGUMENTS

---

ValueCommerce(vcdal.js) 연동 관리 커맨드다. 광고주 정의는 `src/lib/ads/valuecommerce/advertisers.ts` **한 곳**에만 둔다. 기사 하단 카드(`ValueCommerceAdvertisers`)는 `ArticleView.tsx`가 published 기사에 자동 삽입하고, 기사별 노출 여부는 `match.ts`가 title/description/tags/본문/category로 자동 판정한다. MDX 본문에 컴포넌트나 어필리에이트 URL을 직접 넣지 않는다.

## 동작 (입력에 따라 선택)

### A. 광고주 등록/수정 (URL·이름이 주어진 경우)
1. `advertisers.ts`를 읽고 이미 등록된 광고주인지 확인한다(도메인 기준). 있으면 수정, 없으면 추가.
2. 항목을 채운다: `id`(영문 kebab, 고유), `name`, `url`(광고주 정식 https URL — vcdal.js가 제휴 승인된 도메인만 변환), `headline`/`description`/`cta`(일본어, 과장·단정 표현 금지), `keywords`(기사에서 실제로 나올 법한 일본어 어휘 5~10개, 일반적이라 오탐이 많은 단어 제외), 필요 시 `categories`(`src/config/taxonomy.ts`의 CATEGORY_CODES).
3. 키워드/카테고리가 불명확하면 추측하지 말고 사용자에게 묻는다.
4. `npm test` 실행 — `match.test.ts`(id 고유·https 검증 포함) 통과 확인. 새 광고주에 대한 매칭 테스트 1~2건을 `match.test.ts`에 추가한다.
5. `npm run ads:vc:report -- --advertiser <id>`로 실제 published 기사 몇 건에 노출되는지 확인한다. 0건이거나 무관한 기사에 과다 매칭되면 keywords를 조정한다.

### B. 점검/목록 (입력이 "점검"/"목록"이거나 비어 있는 경우)
- `npm run ads:vc:report`를 실행해 광고주별 매칭 기사 수를 표로 보고한다.
- 0건 광고주, 과다 매칭(전체 기사의 절반 이상) 광고주를 지적한다.

## 제약
- `vc_pid`(`ValueCommerceScript.tsx`)·플래그(`VALUECOMMERCE_ENABLED`)는 요청 없이 바꾸지 않는다.
- 제휴 미승인 광고주는 링크가 변환되지 않는다 — 등록 전 ValueCommerce 관리화면에서 제휴 승인 여부를 사용자에게 확인한다.
- 새 광고주 추가 시 프라이버시 폴리시(`src/app/policy/privacy/page.tsx` 6조)의 광고주 예시 문구도 필요하면 갱신한다.
- git commit/push는 하지 않는다 — 커밋 문안만 제안한다.

## 보고
- 추가/수정한 광고주와 keywords, 테스트 결과, `ads:vc:report` 매칭 결과(기사 수·대표 예시)
