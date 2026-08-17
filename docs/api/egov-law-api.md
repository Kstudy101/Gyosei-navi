# e-Gov 法令API Version 2 — 조사 결과 요약

> 조사일: 2026-08-17 / 조사자: Claude Code (TASK-01 사전 조사)
> 출처: https://laws.e-gov.go.jp/api/2/swagger-ui/ → 실제 스펙 파일 `https://laws.e-gov.go.jp/api/2/swagger-ui/lawapi-v2.yaml` (OpenAPI 3, 약 125KB)
> 검증: 아래 엔드포인트를 실제 curl로 호출해 응답 확인함

## 기본 정보

| 항목 | 값 |
|---|---|
| Base URL | `https://laws.e-gov.go.jp/api/2` |
| 인증 | 불필요 (API 키 없음, 무료) |
| 응답 형식 | `response_format=json` 또는 `xml` (미지정 시 Accept 헤더로 판단, 기본 json) |
| 이용조건 | 단시간 대량 요청 금지 → 본 프로젝트는 **요청 간 1초 이상** 간격 + User-Agent 명시 |

## 엔드포인트 (전 6종)

| 경로 | operationId | 용도 |
|---|---|---|
| `GET /laws` | get-laws | 법령 일람 취득 (검색). 필수 파라미터 없음 |
| `GET /law_revisions/{law_id_or_num}` | get-revisions | 법령 개정 이력 |
| `GET /law_data/{law_id_or_num_or_revision_id}` | get-law_data | **법령 본문 취득** ← 핵심 |
| `GET /attachment/{law_revision_id}` | get-attachment | 첨부파일 |
| `GET /keyword` | get-keyword | 본문 키워드 검색 |
| `GET /law_file/{file_type}/{law_id_or_num_or_revision_id}` | get-law_file | 본문 파일 다운로드 |

## `/laws` 주요 파라미터

- `law_title` — 법령명 (부분 일치)
- `law_id` — 법령ID (부분 일치, 예 `322CO0000000016`)
- `law_num` — 법령번호 (부분 일치, 예 `昭和二十二年政令第十六号`)
- `law_type` — Constitution / Act / CabinetOrder / ... 등
- `asof` — 시점 지정 (YYYY-MM-DD)
- `response_format`

응답: `{ total_count, count, laws: [{ law_info, revision_info, current_revision_info }] }`
- `law_info.law_id`, `law_info.law_num`, `law_info.promulgation_date`
- `revision_info.law_title`, `.law_revision_id`, `.amendment_enforcement_date`, `.current_revision_status` (`CurrentEnforced` 등)

실측 예: `GET /laws?law_title=行政書士法` → total_count 3 (行政書士法 + 시행령·시행규칙), 行政書士法의 `law_id = 326AC1000000004`, `law_num = 昭和二十六年法律第四号`

## `/law_data/{id}` 주요 파라미터

- path: 법령ID / 법령번호 / 법령이력ID (완전 일치)
- `elm` — **본문 일부만 취득**. 요소를 `-`로 결합. **조 지정: `MainProvision-Article_19`**, 항: `MainProvision-Article_19-Paragraph_2`. 附則은 `SupplProvision[1]`, 별표 `AppdxTable[1]`
- `json_format` — `full`(상세, 기본) / `light`(간이 — 파싱 최적화) → 본 프로젝트는 **light 사용**
- `asof` — 시점 지정
- `omit_amendment_suppl_provision` — 개정법 附則 제외
- `law_full_text_format`, `response_format`

응답: `{ attached_files_info, law_info, revision_info, law_full_text }`

`json_format=light` + `elm=MainProvision-Article_19` 실측 응답의 `law_full_text`:
```json
{
  "Article": {
    "ArticleCaption": "（業務の制限）",
    "ArticleTitle": "第十九条",
    "Paragraph": [
      { "ParagraphNum": null, "Num": "1",
        "ParagraphSentence": { "Sentence": ["行政書士又は行政書士法人でない者は、…", "ただし、…"] } },
      { "ParagraphNum": "２", "Num": "2",
        "ParagraphSentence": { "Sentence": ["総務大臣は、…"] } }
    ]
  }
}
```
- 각 Paragraph에 `Item`(号)이 있으면 `Item: [{ ItemTitle, ItemSentence: { Sentence | Column } }]` 형태로 중첩 (light 형식은 요소별 구조가 조금씩 다르므로 zod는 **관대한 스키마 + 재귀 텍스트 추출**로 처리)
- 존재하지 않는 조 지정 시: HTTP 400 + `error_info` (`{ code, message }`)

## e-Gov 法令検索 조문 URL (legalBasis용)

- 법령 페이지: `https://laws.e-gov.go.jp/law/{law_id}`
- 조문 앵커: `https://laws.e-gov.go.jp/law/{law_id}#Mp-At_{조번호}` (예 `#Mp-At_19`, 枝番 `第十九条の三` → `#Mp-At_19_3`)
  ※ 앵커 형식은 法令検索 사이트의 관례. 사이트 개편 시 재확인 필요.

## Version 1 (폴백용, 「当面の間」 유지)

- `GET https://laws.e-gov.go.jp/api/1/lawlists/{category}` / `lawdata/{lawId}` / `articles;lawId=...;article=...` / `keyword`
- 본 구현에서는 v2만 사용 (v2로 전 요건 충족). v1 폴백은 미구현 — 필요 시 추가.

## 조사 중 확인한 주의점

- Swagger UI에서 큰 법령 본문은 에러가 날 수 있다고 안내됨 → `elm`으로 조 단위 취득이 정석
- `law_title` 검색은 부분 일치라 「行政書士法」 검색 시 시행령·시행규칙도 함께 나옴 → **완전 일치 우선 선택** 로직 필요
- 응답의 `updated`/개정 정보는 시각까지 포함 (`2026-05-21T00:47:15+09:00`)
