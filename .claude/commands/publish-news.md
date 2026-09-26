---
description: 감지된 제도 변화(GitHub Issue 등)를 뉴스 기사로 만들어 (조건부) 발행한다
---

사용자 입력(Issue 번호/URL, 또는 변화 내용・지역・제도명 자유 텍스트, 발행 여부):

$ARGUMENTS

---

watch-municipalities(매일 07:00 JST)가 기립한 변화 감지 Issue, 또는 사용자가 직접 전달한 제도 변화를 뉴스 기사(content/news/)로 만드는 파이프라인이다. 뉴스 섹션은 시사성 쿼리와 Google Discover 노출의 핵심이므로 감지→기사화 리드타임을 짧게 유지하는 것이 목적이다.

## 절차

### 1. Issue 수집과 정리 (입력이 없을 때)

1. 입력이 Issue 번호/URL이면 `gh issue view <n> --json title,body,createdAt`로 그 Issue만 다루고 2로 간다.
2. 입력이 없으면 `gh issue list --state open --label content-opportunity --json number,title,createdAt --limit 100`으로 미처리 감지 Issue(`[新着キャッチ]`・`[監視]`)를 나열한다.
3. **생성 후 7일이 지난 Issue는 기사화하지 않고 정리한다** — 뉴스는 시의성이 생명이라 1주가 지난 변화는 Discover 가치가 거의 없다. `gh issue comment <n> --body "7日経過のため publish-news の対象外としてクローズ（未処理項目は既存記事の定期更新で扱う）"` 후 `gh issue close <n>`. 닫은 번호는 보고에 남긴다.
4. 남은(7일 이내) Issue를 최신순으로 다룬다.

### 2. 항목 선별 (점수제)

Issue 안의 변화 항목마다 아래 점수를 매겨 표로 남긴다. **4점 이상인 항목 중 상위 N건**(기본 5건, 사용자가 지정하면 그 수)만 기사화한다 — 스팸 정책(대량 생성) 대비, 양보다 질.

| 기준 | 점수 |
|---|---|
| 신설・증액・공모 개시・受付終了・予算到達・마감 30일 이내 | +3 |
| 대상・요건의 실질 개정 | +2 |
| 원문에 금액・날짜・건수 등 구체 수치가 있다 | +2 |
| 같은 제도의 기존 기사가 `content/subsidy/`에 있다(내부 링크・B 갱신 대상) | +1 |
| 문구・링크・주소・창구시간・PDF 용량만 변경, 이벤트・채용 공지 | 0점 → skip |

### 3. 중복 확인 — 후속 소식은 기존 뉴스를 갱신 (A)

기사화 대상마다, 먼저 `content/news/`에서 **같은 제도의 기존 뉴스**를 찾는다(`subsidy.applyUrl`・`sourceLinks` URL・`relatedSlugs`가 겹치고 `subsidy.regionCode`가 같음). 같은 회계연도의 뉴스가 있으면 **새 파일을 만들지 않고 그 뉴스를 갱신**하도록 news-writer에 「갱신 모드」로 지시한다(예: 予算残少 → 受付終了). 새 URL을 늘리지 않아 얇은 중복 페이지를 막고, 한 URL에 최신성이 쌓인다.

### 4. 기사 파이프라인

기사화・갱신 대상마다 실행한다:
1. **news-writer** Task: 원문 취득・아카이브・draft 작성 또는 기존 뉴스 갱신 (여러 건이면 하나의 메시지에 여러 Task로 병렬 fan-out)
2. **verifier** Task: data/sources 아카이브와 기사 수치 대조
3. **editor** Task: 문체・법적 경계선 검수
4. **publisher** Task: validate・build 후 조건 충족 시에만 published 전환. **published 전환은 사용자가 "발행까지"를 명시했을 때만** 요청한다(publisher.md의 조건 준수). 명시가 없으면 draft까지만. 이미 published인 뉴스를 갱신한 경우 status는 그대로 둔다.

### 5. 낡은 subsidy 기사 갱신 루프 (B)

news-writer가 「낡았다」고 보고한 기존 subsidy 기사마다:
1. **verifier** Task: 이번 뉴스의 원문 아카이브(`data/sources/<news-slug>/`)와 그 subsidy 기사를 대조해, **원문으로 확인되는 필드 단위 차이만** 목록으로 낸다(예: `subsidy.status: open → closed`, 본문 「予算残額400万円」 → 삭제/갱신). 원문으로 확인 안 되는 항목은 목록에서 뺀다. 또한 **확인된 변경과 모순되는 기존 문장**도 목록에 넣는다(예: 受付終了인데 「今から申請」 전제의 안내・체크리스트 → 종료 사실을 앞에 명시하거나 문구를 조정). 모순을 남기면 상태 필드와 본문이 어긋난 오정보가 된다.
2. **writer** Task(갱신 모드, writer.md 참조): verifier 목록의 항목만 반영한다. `updatedAt`・`subsidy.verifiedAt`은 오늘, `changelog`에 「〇〇を反映（関連ニュース: /news/<slug>）」를 추가.
3. **editor** Task: 바뀐 문장만 검수.
4. `npm run validate:content`로 확인. status는 바꾸지 않는다(published는 published 그대로 — 새 발행이 아니라 정정이다).

### 6. Issue 마무리

Issue의 모든 항목이 처리(기사화/갱신/skip)되면 `gh issue comment`로 결과 표와 기사 경로를 남긴다. 전부 published까지 끝났으면 `gh issue close`, draft로 멈춘 항목이 있으면 코멘트만 한다.

## 보고

- 처리한 Issue/변화 항목별 결과 표(기사화/skip/실패와 사유, 최종 status)
- 생성된 content/news/, data/sources/ 경로
- 선별 점수표(기사화/skip 사유 포함)와 7일 경과로 닫은 Issue 번호
- 신규 뉴스 vs 기존 뉴스 갱신 구분
- 갱신 루프(B)로 고친 subsidy 기사와 필드별 변경 내용, 원문으로 확인되지 않아 남겨 둔 항목
- git commit/push는 하지 않는다 — 커밋 문안만 제안한다.
