---
description: 감지된 제도 변화(GitHub Issue 등)를 뉴스 기사로 만들어 (조건부) 발행한다
---

사용자 입력(Issue 번호/URL, 또는 변화 내용・지역・제도명 자유 텍스트, 발행 여부):

$ARGUMENTS

---

watch-municipalities(매일 07:00 JST)가 기립한 변화 감지 Issue, 또는 사용자가 직접 전달한 제도 변화를 뉴스 기사(content/news/)로 만드는 파이프라인이다. 뉴스 섹션은 시사성 쿼리와 Google Discover 노출의 핵심이므로 감지→기사화 리드타임을 짧게 유지하는 것이 목적이다.

## 절차

1. 입력이 Issue 번호/URL이면 `gh issue view <n> --json title,body`로 내용을 가져온다. 입력이 없으면 `gh issue list --state open --search "新着キャッチ"`로 미처리 감지 Issue를 나열하고 최신 것부터 다룬다.
2. 각 변화 항목에 대해 시사성(신설・개정・공모 개시・마감 임박)이 있는지 판단한다. 이벤트 고지・채용 등 보조금과 무관한 항목은 skip하고 사유를 기록한다.
3. 기사화 대상마다 순차 실행한다:
   1. **news-writer** Task: 원문 취득・아카이브・draft 작성 (여러 건이면 하나의 메시지에 여러 Task로 병렬 fan-out)
   2. **verifier** Task: data/sources 아카이브와 기사 수치 대조
   3. **editor** Task: 문체・법적 경계선 검수
   4. **publisher** Task: validate・build 후 조건 충족 시에만 published 전환. **published 전환은 사용자가 "발행까지"를 명시했을 때만** 요청한다(publisher.md의 조건 준수). 명시가 없으면 draft까지만.
4. 기사화까지 끝난 Issue는 `gh issue comment`로 기사 경로를 남기고 `gh issue close`한다(draft로 멈춘 경우 close하지 않고 코멘트만).

## 보고

- 처리한 Issue/변화 항목별 결과 표(기사화/skip/실패와 사유, 최종 status)
- 생성된 content/news/, data/sources/ 경로
- 낡은 것으로 판명된 기존 subsidy 기사 목록(news-writer 보고 취합) — 후속 갱신 대상
- git commit/push는 하지 않는다 — 커밋 문안만 제안한다.
