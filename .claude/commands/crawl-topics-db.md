---
description: 원문 조사・기사 작성 없이 topic-scout만 배치로 돌려 data/topics-db를 채운다
---

사용자 입력(자유 텍스트, 대상 지역 범위・카테고리 범위를 포함할 수 있음. 비어 있으면 `src/config/regions.ts`에 등록된 전체 지역 × 전체 카테고리를 대상으로 한다):

$ARGUMENTS

---

당신은 이 요청을 여러 개의 **orchestrator** 서브에이전트 호출로 분해해 병렬/배치 실행한다. 직접 조사하지 않는다.

이것은 **topic 발굴 전용** 배치다. 원문 아카이브(government-researcher)도, 기사 작성(writer)도 하지 않는다 — `data/topics-db/`에 후보를 쌓는 것까지만 한다.

## 절차

1. `data/topics-db/README.md`를 읽어 스키마를 숙지한다.
2. `src/config/regions.ts`를 읽어 등록된 지역(도도부현 전체 + 등록된 시정촌) 목록을 확보한다. 사용자 입력이 범위를 좁혔으면 그 범위만, 비어 있으면 등록된 전체 지역을 대상으로 한다. **미등록 시정촌은 대상에서 제외한다**(topic-scout가 매번 "미등록"이라고 보고하는 것은 낭비다).
3. `src/config/taxonomy.ts`의 `CATEGORIES`에서 카테고리 목록(9개)을 확보한다. 사용자 입력이 카테고리를 좁혔으면 그것만 쓴다.
4. 지역 목록을 10~15개 단위로 배치로 나눈다. 각 배치를 하나의 메시지 안에서 여러 **orchestrator** Task 호출로 병렬 fan-out한다(지역 하나당 orchestrator 호출 하나, 해당 지역의 전체 카테고리를 한 번에 맡긴다). 각 orchestrator 호출 프롬프트에는 반드시 다음을 포함한다:
   - "이것은 topic 발굴 전용 배치다. **topic-scout만 실행하라. government-researcher, verifier, writer, ad-mapper, seo-researcher, editor, publisher는 호출하지 말 것.**"
   - 담당 지역명(슬러그 포함)과 대상 카테고리 목록
   - "topic-scout에게 `data/topics-db/<region-slug>.json`을 먼저 읽혀 이미 처리된 카테고리는 건너뛰게 하고, 결과를 같은 파일에 append하게 하라."
5. 한 배치의 모든 orchestrator 결과가 돌아오면 다음 배치를 시작한다. 배치 사이에 실패한 지역이 있어도 다음 배치를 막지 않는다.
6. 전체 배치가 끝나면 `data/topics-db/*.json`을 훑어 지역별 status 분포를 집계한다.

## 규모 주의

전체 범위(전 지역 × 전 카테고리)는 조합이 많아 시간이 오래 걸릴 수 있다. 사용자가 범위를 지정하지 않았다면, 먼저 몇 개 배치를 처리한 뒤 중간 결과(속도・품질)를 보고하고 계속 진행할지 확인받는 것을 권장한다 — 단, 사용자가 "전부 끝까지"처럼 명시적으로 전량 실행을 지시했다면 중단 없이 배치를 이어간다.

## 보고

배치 전체가 끝나면(또는 중간보고 시점마다) 다음을 한국어로 요약한다:
- 처리한 지역 수 / 전체 대상 지역 수
- `data/topics-db/`에 새로 생기거나 갱신된 파일 목록
- status별 집계(pending / researched / published / rejected 총 건수)
- 확신도(confirmed/unconfirmed) 분포
- 다음 단계 안내: 쌓인 `pending` 토픽으로 실제 기사를 만들려면 `/publish-batch` 또는 `/research-only`를 이어서 실행하면 되고, 이때 topic-scout는 이미 쌓인 DB를 읽어 재탐색 없이 진행한다는 점
