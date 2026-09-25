---
description: ValueCommerce 광고주를 등록/수정/점검하고 published 기사와의 매칭을 확인한다
---

사용자 입력(광고주 URL·이름, 제휴 카테고리/키워드, 또는 "점검"/"목록"):

$ARGUMENTS

---

ValueCommerce(vcdal.js) 연동 관리 커맨드다. 광고주 정의는 `src/lib/ads/valuecommerce/advertisers.ts` **한 곳**에만 둔다. 광고(`ValueCommerceAdvertisers`)는 `ArticleView.tsx`가 published 기사에 자동 삽입하며, **기사 내용과 무관하게 등록된 광고주 중 2곳을 랜덤 선정**해(`pick.ts`, 시드=기사 slug+빌드 날짜) 본문 좌우 사이드 배너로 표시한다(xl 미만은 기사 하단 카드로 폴백). MDX 본문에 컴포넌트나 어필리에이트 URL을 직접 넣지 않는다.

## 동작 (입력에 따라 선택)

### A. 광고주 등록/수정 (URL·이름이 주어진 경우, 여러 개도 가능)
1. `advertisers.ts`를 읽고 이미 등록된 광고주인지 확인한다(도메인 기준). 있으면 수정, 없으면 추가.
2. 사이트를 `curl`로 열어 title/description/og:image를 확인하고 항목을 채운다: `id`(영문 kebab, 고유), `name`, `url`(광고주 정식 https URL — vcdal.js가 제휴 승인된 도메인만 변환), `headline`/`description`/`cta`(일본어, 과장·단정 표현 금지), `image`(공식 사이트의 og:image 등을 `public/ads/valuecommerce/`에 저장해 등록, 크기는 실제 파일 기준. 받은 파일이 이미지인지 `file`로 확인, 1MB 초과는 넣지 않는다).
3. 사이트가 열리지 않아 사업 내용을 확인할 수 없으면 추측하지 말고 사용자에게 묻는다.
4. `npm test` 실행 — `pick.test.ts`(id 고유·https·전 광고주가 선정 대상에 포함됨) 통과 확인.
5. `npm run ads:vc:report`로 광고주별 배정 기사 수를 확인한다.

### B. 점검/목록 (입력이 "점검"/"목록"이거나 비어 있는 경우)
- `npm run ads:vc:report`를 실행해 광고주 목록(이미지 유무·URL)과 배정 기사 수를 표로 보고한다.

## 제약
- 광고주별 키워드/카테고리 매칭은 쓰지 않는다(랜덤 선정 방침). 특정 기사에 특정 광고를 고정하고 싶다는 요청은 별도 구현이 필요하니 사용자에게 먼저 확인한다.
- `vc_pid`(`ValueCommerceScript.tsx`)·플래그(`VALUECOMMERCE_ENABLED`)는 요청 없이 바꾸지 않는다.
- 제휴 미승인 광고주는 링크가 변환되지 않는다 — 등록 전 ValueCommerce 관리화면에서 제휴 승인 여부를 사용자에게 확인한다.
- 성인향 등 정부·지자체 정보 사이트에 부적절할 수 있는 광고주는 등록 전에 사용자에게 확인한다.
- 새 광고주 추가 시 프라이버시 폴리시(`src/app/policy/privacy/page.tsx` 6조)의 광고주 예시 문구도 필요하면 갱신한다.
- git commit/push는 하지 않는다 — 커밋 문안만 제안한다.

## 보고
- 추가/수정한 광고주, 테스트 결과, `ads:vc:report` 결과(광고주 수·배정 기사 수)
