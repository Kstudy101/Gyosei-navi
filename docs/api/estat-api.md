# e-Stat API 3.0 — 조사 결과 요약

> 조사일: 2026-08-17 / 조사자: Claude Code (TASK-05 사전 조사)
> 출처: https://www.e-stat.go.jp/api/api-info/api-spec , https://www.e-stat.go.jp/api/api-info/e-stat-manual3-0
> ※ appId 미발급 상태라 **실호출 검증은 미실시**. 사용자가 appId 발급 후 `npm run stats -- --search 在留外国人` 로 첫 검증할 것.

## 기본 정보

| 항목 | 값 |
|---|---|
| 현행 버전 | **3.0** (2019-07-26 릴리스) |
| Base URL | `https://api.e-stat.go.jp/rest/3.0/app/` |
| 인증 | **appId 필수** (무료, https://www.e-stat.go.jp/api/ 에서 이용등록 → 「アプリケーションID」 발급) |
| 응답 형식 | XML(기본) / **JSON** (`/json/` 경로) / CSV (`/getSimpleStatsData` 계열) |
| 기타 | HTTPS 지원, gzip, CORS |

## 엔드포인트 (JSON)

| 용도 | URL |
|---|---|
| 통계표 검색 | `GET https://api.e-stat.go.jp/rest/3.0/app/json/getStatsList?appId=…&searchWord=…` |
| 통계 데이터 취득 | `GET https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=…&statsDataId=…` |
| 메타 정보 | `GET …/json/getMetaInfo?appId=…&statsDataId=…` |
| CSV 간이 취득 | `GET https://api.e-stat.go.jp/rest/3.0/app/getSimpleStatsData?appId=…&statsDataId=…` |

## 주요 파라미터

- 공통: `appId` (필수)
- getStatsList: `searchWord` (제목·메타 검색), `statsField` (분야 코드), `statsCode` (정부통계코드 5/8자리), `surveyYears` (yyyy / yyyymm / 범위), `limit`, `startPosition`
- getStatsData: `statsDataId` **또는** `dataSetId` (택1), `lvTab`/`cdTab` (표측), `lvArea`/`cdArea` (지역), `lvTime`/`cdTime` (시간축), `metaGetFlg`, `cntGetFlg`, `limit`, `startPosition`

## 응답 구조

```json
{ "GET_STATS_LIST": { "RESULT": { "STATUS": 0, "ERROR_MSG": "正常に終了しました。", "DATE": "…" },
                      "PARAMETER": {...},
                      "DATALIST_INF": { "NUMBER": n, "TABLE_INF": [ { "@id": "0003…", "STAT_NAME": {...}, "TITLE": {...}, "SURVEY_DATE": …, "OPEN_DATE": "…" } ] } } }
{ "GET_STATS_DATA": { "RESULT": { "STATUS": 0, "ERROR_MSG": "…" },
                      "STATISTICAL_DATA": { "RESULT_INF": {...}, "TABLE_INF": {...}, "CLASS_INF": {...},
                                            "DATA_INF": { "VALUE": [ { "@tab":…, "@cat01":…, "@area":…, "@time":…, "@unit":…, "$": "123" } ] } } } }
```
- `RESULT.STATUS`: **0~2 = 성공, 100 이상 = 오류** (ERROR_MSG에 사유). HTTP 200이어도 STATUS로 실패 판정해야 함.
- `TABLE_INF`는 결과 1건이면 객체, 여러 건이면 배열 (JSON 변환 특성) → 정규화 필요

## 우선 대상 통계 (기사용)

| 통계 | 검색어 후보 | 용도 |
|---|---|---|
| 在留外国人統計 (出入国在留管理庁) | `在留外国人` | 재류자격별 인원 추이 |
| 帰化許可申請者数等の推移 | `帰化許可` (e-Stat 미수록 가능 → 法務省 사이트 확인) | 귀화 기사 |
| 人口推計 / 家計調査 | `人口推計` `家計調査 年間収入` | 세대 평균수입 보조 |

## 구현 메모

- `src/lib/sources/estat.ts`: appId 는 `process.env.ESTAT_APP_ID` 에서만 읽고 미설정 시 안내 메시지와 함께 실패
- 취득 데이터는 `data/stats/{statsDataId}.json` + `.meta.json`(통계명·公表일·URL) 으로 저장 → 기사 인용 가능
