# topics-db

topic-scout가 찾아낸 "기사화 가능 후보(토픽)"를 지역별로 누적 저장하는 DB다. 목적은 같은 지역×카테고리 조합을 매번 다시 WebSearch로 뒤지지 않게 하는 것.

## 파일 구조

지역(도도부현 또는 시정촌) 1개당 파일 1개: `data/topics-db/<region-slug>.json`

`region-slug`는 `src/config/regions.ts`의 슬러그와 동일하게 맞춘다(도도부현이면 도도부현 슬러그, 시정촌이면 시정촌 슬러그).

```json
{
  "region": "akita",
  "regionLabel": "秋田県",
  "updatedAt": "2026-09-22",
  "topics": [
    {
      "category": "jutaku",
      "title": "秋田県あきた安全安心住まい推進事業",
      "officialUrl": "https://www.pref.akita.lg.jp/...",
      "authority": "prefecture",
      "confidence": "confirmed",
      "status": "published",
      "articleSlug": "akita-anzen-anshin-sumai",
      "foundAt": "2026-08-01",
      "checkedAt": "2026-08-01",
      "note": ""
    }
  ]
}
```

### 필드

- `category`: `src/config/taxonomy.ts`의 `CATEGORIES[].code` 중 하나.
- `title`: 제도 공식 명칭.
- `officialUrl`: topic-scout가 확인한 추정 공식 URL(원문 아카이브는 아님 — 그건 `data/sources/`가 정본).
- `authority`: `national` | `prefecture` | `municipality`.
- `confidence`: `confirmed`(공식 사이트에서 실재 확인) | `unconfirmed`(검색 결과만으로 추정).
- `status`: 아래 상태 참고.
- `articleSlug`: `content/subsidy/<category>/<slug>.mdx` 발행 후 연결(없으면 빈 문자열).
- `foundAt`: topic-scout가 최초로 발견한 날짜.
- `checkedAt`: 마지막으로 존재를 재확인한 날짜.
- `note`: 특이사항(선택).

### status 상태값

- `pending` — topic-scout가 후보로 찾았지만 아직 government-researcher가 원문을 조사하지 않음.
- `researched` — writer가 draft MDX를 생성함(`content/`에 status: draft로 존재).
- `published` — publisher가 status: published로 전환함. **이 상태는 topic-scout가 재탐색 대상에서 제외한다.**
- `rejected` — 조사했지만 제도가 실재하지 않거나 기사화 불가로 판정됨(중복 재탐색 방지용으로 남긴다).

## 사용 규칙

- topic-scout는 지역을 맡으면 먼저 해당 `data/topics-db/<region-slug>.json`을 읽는다. `status`가 `published`/`researched`/`rejected`인 카테고리는 건너뛴다. `pending`이거나 파일에 없는 카테고리만 새로 탐색한다.
- 새로 찾은 후보는 이 파일에 `status: "pending"`으로 append한다(덮어쓰지 않고 기존 배열에 추가).
- writer가 draft를 생성하면 해당 topic 항목의 `status`를 `researched`로, publisher가 published 전환하면 `published`로, `articleSlug`를 갱신한다.
- 파일이 없으면 새로 만든다. 동시에 여러 에이전트가 같은 지역 파일을 쓰지 않도록 orchestrator가 지역 단위로 순차/격리해 위임한다(같은 지역을 병렬로 두 번 맡기지 않는다).
