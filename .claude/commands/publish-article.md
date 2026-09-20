---
description: 기사 1건을 조사부터 (조건부) 발행까지 orchestrator에게 지시한다
---

사용자 입력(자유 텍스트, 대상 지역・카테고리・목적・발행 여부 등을 포함할 수 있음):

$ARGUMENTS

---

당신은 이 요청을 **orchestrator** 서브에이전트(`.claude/agents/orchestrator.md`)에게 그대로 위임한다. 직접 조사・집필하지 않는다.

Task 도구로 `orchestrator`를 호출하되, 다음을 프롬프트에 포함시켜라:

- 위 사용자 입력 전문
- "이것은 **단건 기사** 요청이다 — 하나의 지역×카테고리(또는 사용자가 지정한 좁은 범위) 하나만 다룬다. 여러 지역을 동시에 광범위하게 처리하지 말 것."
- "사용자 입력에 '발행'/'published'/'공개' 등 명시적인 발행 지시가 있는지 확인하고, 있다면 publisher 단계에서 published 전환을 시도하도록, 없다면 draft까지만 진행하고 결과를 보고하도록 명확히 전달할 것."
- orchestrator가 파이프라인(topic-scout→government/municipality-researcher→verifier→writer→seo-researcher→editor→publisher)을 순서대로 실행하고 최종 요약을 보고하게 할 것.

orchestrator의 최종 보고를 받으면, 사용자에게 한국어로 간결하게 요약해 전달한다(무엇을 조사했고, 원문을 어디에 저장했고, 기사가 draft/published 중 무엇인지, 다음에 사용자가 결정할 사항).
