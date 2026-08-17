# e-Gov パブリック・コメント — 조사 결과 요약

> 조사일: 2026-08-17 / 조사자: Claude Code (TASK-03 사전 조사)
> 대상: https://public-comment.e-gov.go.jp/
> 검증: 아래 URL·파라미터를 실제 curl로 호출해 응답 확인함

## 결론 — 취득 경로 2종

| 경로 | 장점 | 한계 | 본 구현에서의 역할 |
|---|---|---|---|
| **RSS** `https://public-comment.e-gov.go.jp/rss/pcm_list.xml` | 구조 안정, 파싱 단순, 공식 제공 | **최신 6건만** | 신착 즉시 포착 (매일 실행 시 충분) |
| **목록 서블릿** `POST https://public-comment.e-gov.go.jp/servlet/Public` | 전체 募集中 안건 (20건/페이지, 실측 148페이지) | HTML 구조 의존 | 백필·누락 방지 (앞쪽 N페이지 순회) |

결과 RSS: `https://public-comment.e-gov.go.jp/rss/pcm_result.xml` (의견 결과 공시 — 향후 활용)

**키워드 검색(`keyword` 파라미터)은 세션 상태에 의존해 무상태 POST로는 0건이 반환됨** (실측). → 서버측 검색을 쓰지 않고, 목록을 가져와 **클라이언트측에서 키워드 필터**한다.

## RSS 형식 (RSS 1.0 / RDF)

```xml
<rdf:RDF xmlns="http://purl.org/rss/1.0/" xmlns:dc="..." xmlns:rdf="...">
  <channel> ... <dc:date>2026-08-17T09:01:09+0900</dc:date> </channel>
  <item rdf:about="https://public-comment.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&amp;id=550004392&amp;Mode=0">
    <title>農業近代化資金融通法施行令の一部を改正する政令案についての意見・情報の募集について</title>
    <link>https://public-comment.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&amp;id=550004392&amp;Mode=0</link>
    <description>案の公示日：2026/08/17&lt;br/&gt;受付締切日時：2026/09/06 23:59&lt;br/&gt;カテゴリー：農業&lt;br/&gt;問合せ先（所管省庁・部局名等）：農林水産省経営局金融調整課 ...&lt;br/&gt;</description>
    <dc:date>2026-08-16T15:00:Z</dc:date>
  </item>
</rdf:RDF>
```
- 案件ID = link의 `id=` 값
- description은 `<br/>` 구분: `案の公示日：YYYY/MM/DD` / `受付締切日時：YYYY/MM/DD HH:mm` / `カテゴリー：…` / `問合せ先（所管省庁・部局名等）：…`

## 목록 서블릿

- `POST https://public-comment.e-gov.go.jp/servlet/Public`
- form: `CLASSNAME=PCMMSTLIST&Mode=0&Page={n}&dspcnt=20` (dspcnt=100은 무시되고 20건 고정으로 관측)
- 페이지네이션은 **무상태로 동작** (Page=1과 Page=2가 서로 다른 20건, 중복 0 — 실측)
- 응답 HTML 내 `<input name="totalPage" value="148">`로 총 페이지 수 파악 가능

한 건의 구조 (`<ul class="egovui-list-comment-list"> > <li>`):
```html
<li class="egovui-flex-column">
  <div class="egovui-link-area-cursor" onClick="...action='/pcm/detail?CLASSNAME=PCMMSTDETAIL&amp;id=550004392&amp;Mode=0'...">
    <span class="egovui-badge ...">農業</span>                    ← カテゴリー
    <h2 class="egovui-title-finer"><a ...>農業近代化資金融通法施行令…</a></h2>   ← 標題
    <span class="egovui-comment-status ...">募集中</span>
    <span>案件番号</span><span>550004392</span>
    <span>案の公示日</span>2026年8月17日
    <span>受付締切日時</span><span>2026年9月6日23時59分</span>
    <span>所管省庁</span><span>農林水産省</span>
```
- 상세 URL: `https://public-comment.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id={案件ID}&Mode=0`

## 상세 페이지 (案件詳細)

- URL: `https://public-comment.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id={案件ID}&Mode=0` (GET 으로 열림, 실측 200)
- `<th>案件番号</th><td>…`, `<th>受付締切日時</th><td>2026年9月4日0時0分`, `<th>根拠法令条項</th>` 등 표 형식
- **첨부 PDF**: `<a class="file" href="/pcm/download?seqNo=0000318904">永住許可に関するガイドライン改定案</a>` → `https://public-comment.e-gov.go.jp/pcm/download?seqNo={seqNo}` (GET, application/pdf, 파일명은 Content-Disposition)
  - 意見募集要領 / 命令などの案 / 関連資料 의 3종이 일반적

## 실측 결과 (2026-08-17 첫 실행)

- RSS 6건 + 목록 5페이지 100건 → 중복 제거 95건 / 키워드 일치 5건
- **永住許可ガイドライン改定案 (315000140)** 및 관련 안건 2건(315000141 永住者取消ガイドライン案, 315000139 入管法施行規則改正案) 발견 → 원문 PDF는 `data/sources/pubcomment-315000140/`
- 締切 표기: 목록·RSS는 「YYYY/MM/DD HH:mm」, 상세는 「YYYY年M月D日H時M分」 → `normalizeJpDate` 로 통일. **0時0分 마감이 실재함** (「24時」가 아님)

## 파싱 실패 판정 규칙 (N4: 0건과 파싱 실패의 구분)

- RSS: `<item>` 0건이면서 `<channel>`도 없음 → 실패. `<channel>`은 있는데 item 0건 → 실제 0건(드묾)로 취급하되 경고
- 목록: HTML 200이지만 `egovui-list-comment-list`가 없거나 `totalPage`를 못 찾으면 → **구조 변경으로 판단해 실패**
- 항목 파싱: 案件ID·標題·締切 중 하나라도 못 뽑는 항목이 있으면 그 페이지는 실패로 기록

## 주의

- 사이트에 mPulse(boomerang) 계측 스크립트가 있음 — 무관
- 루트 `/`는 `<meta refresh>`로 `/pcm/1050`으로 이동 (초기 진입 페이지)
- 요청 간 1초 이상 간격 유지 (C5)
