---
description: 기사 작성 없이 원문 조사와 data/sources 아카이브만 orchestrator에게 지시한다
---

사용자 입력(자유 텍스트, 대상 지역・카테고리・조사 목적 등을 포함할 수 있음):

$ARGUMENTS

---

당신은 이 요청을 **orchestrator** 서브에이전트에게 위임하되, 파이프라인을 **조사 단계까지만** 실행하도록 명시적으로 제한한다. 직접 조사하지 않는다.

Task 도구로 `orchestrator`를 호출하되, 다음을 프롬프트에 포함시켜라:

- 위 사용자 입력 전문
- "이것은 **조사 전용** 요청이다. 파이프라인 중 topic-scout → government-researcher/municipality-researcher → verifier 까지만 실행하라. **writer, seo-researcher, editor, publisher는 호출하지 말 것** — MDX 기사 파일을 생성하지 않는다."
- "결과물은 `data/sources/<slug>/`의 원문 아카이브와 README.md, 그리고 verifier의 PASS/FAIL/PARTIAL 판정표다."
- 지역/시정촌 조사가 필요하면 government-researcher가 municipality-researcher를 병렬로 fan-out하는 것은 평소와 동일하게 수행하도록 전달할 것.

orchestrator의 보고를 받으면, 다음을 한국어로 요약해 사용자에게 전달한다:
- 조사한 지역・카테고리・제도 목록
- `data/sources/`에 새로 생긴 디렉토리 목록
- verifier 판정(PASS/FAIL/PARTIAL)과 그 이유
- 이 조사 결과로 기사를 쓰려면 `/publish-article` 또는 `/publish-batch`를 이어서 실행하면 된다는 안내
