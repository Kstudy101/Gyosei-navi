---
description: tags가 빈 기존 published 기사에 태그를 일괄 백필한다 (태그 아카이브·관련기사 매칭 강화)
---

사용자 입력(선택 — 대상 범위 제한: 카테고리, 건수 등):

$ARGUMENTS

---

기존 published 기사 중 `tags: []`인 것에 태그를 백필하는 배치 작업이다. 내부 링크 품질(`src/lib/related.ts`의 관련 기사 매칭)과 태그 아카이브 페이지(`/tag/[tag]`, 기사 2건 이상 태그만 생성)가 이 데이터에 달려 있다.

## 절차

1. `grep -rl 'tags: \[\]' content --include=*.mdx`로 대상을 나열하고, frontmatter `status: "published"`인 것만 남긴다. 사용자 입력에 범위 제한이 있으면 적용한다.
2. **기존 태그 어휘를 먼저 수집한다**: `grep -rh '^tags:' content --include=*.mdx`로 이미 쓰이는 태그 표기를 목록화한다. 백필의 최우선 원칙은 **표기 통일** — 같은 제도는 같은 태그를 쓴다(「エネファーム」와 「家庭用燃料電池」를 섞지 않는다). 기존 어휘에 맞는 표기가 있으면 반드시 그것을 재사용한다.
3. 대상을 20건 안팎으로 묶어, **하나의 메시지에 여러 Task를 담아** 서브에이전트(subagent_type: general-purpose)를 병렬 fan-out한다. 각 에이전트에게:
   - 담당 파일 목록과 2에서 수집한 기존 태그 어휘를 전달한다.
   - 규칙: 태그 3~6개 / 제도명・기기명・제도유형의 일본어 표기 / 지역명 금지(`subsidy.regionCode`가 담당) / 본문・title・targetKeywords에 실제로 등장하는 개념만 사용(새 사실을 만들지 않는다) / frontmatter의 `tags` 배열만 Edit하고 다른 필드・본문은 절대 건드리지 않는다.
4. 전체 완료 후 `npm run validate:content`로 스키마 오류가 없는지 확인한다.
5. `npm run build`로 태그 아카이브 페이지가 정상 생성되는지 확인한다(`out/tag/` 확인).

## 보고

- 백필한 파일 수 / 생성된 고유 태그 수 / 기사 2건 이상이라 아카이브 페이지가 생기는 태그 목록(상위 20개)
- validate・build 결과
- git commit/push는 하지 않는다(이 저장소의 관행 — 사용자가 확인 후 커밋). 커밋 문안만 제안한다.
