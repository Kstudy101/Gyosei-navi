# e-Stat API 3.0 — 조사 결과 요약

> 조사일: 2026-08-17 / 조사자: Claude Code (TASK-05 사전 조사)
> 출처: https://www.e-stat.go.jp/api/api-info/api-spec , https://www.e-stat.go.jp/api/api-info/e-stat-manual3-0
> ✅ 2026-08-17 appId 발급 후 **실호출 검증 완료**: `--search 在留外国人` → 22건 (최신 `0004019020` 国籍・地域別 在留資格別 在留外国人, 調査 202512, 公開 2026-07-10) / `--id 0004019020 --limit 50` → `data/stats/` 저장·메타(appId 마스킹) 확인.

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

## 실측 메모 (2026-08-17)

- `在留外国人統計` 계열은 `SURVEY_DATE`가 0으로 오는 구표(2019 공개)와 최신표가 섞여 있음 → 최신 `OPEN_DATE` 우선
- `getStatsData` 응답 VALUE 는 `{ "@tab","@cat01","@cat02","@area","@time","@unit","$" }` 형태
- **CLASS_INF 매핑은 구현 완료 (2026-08-19)**: `.meta.json`의 `classes.{축id}.items[코드]=명칭` 으로 저장. 예: 0004019020은 cat01=在留資格(43), cat02=国籍・地域(209), time=반기(27)
- `getStatsList`는 광범위 검색어(「帰化」 등)에서 서버 측 30초 초과 실측 → 래퍼가 60초 타임아웃 적용
- 데이터가 큰 표는 `--limit` 로 시험 취득 후 `cdCat01`/`cdTime` 로 좁힐 것

## 우선 대상 통계 (기사용)

| 통계 | 검색어 후보 | 용도 |
|---|---|---|
| 在留外国人統計 (出入国在留管理庁) | `在留外国人` | 재류자격별 인원 추이 |
| 帰化許可申請者数等の推移 | **e-Stat 미수록 확정 (2026-08-19 실측)** — 「帰化」 검색 결과는 戸籍統計 届出事件数 2표뿐. 허가자수 추이는 法務省 민사국 페이지( https://www.moj.go.jp/MINJI/toukei_t_minj03.html )가 정본 → 기사 인용은 그 페이지, 감시는 monitor(diff)로 | 귀화 기사 |
| 人口推計 / 家計調査 | `人口推計` `家計調査 年間収入` | 세대 평균수입 보조 |

## 구현 메모

- `src/lib/sources/estat.ts`: appId 는 `process.env.ESTAT_APP_ID` 에서만 읽고 미설정 시 안내 메시지와 함께 실패
- 취득 데이터는 `data/stats/{statsDataId}.json` + `.meta.json`(통계명·公表일·URL·**classes 코드사전**) 으로 저장 → 기사 인용 가능

## 취득 실적

| statsDataId | 내용 | 조건 | 건수 | 취득일 |
|---|---|---|---|---|
| 0004019020 | 在留外国人統計 国籍別×在留資格別 (2025-12 확정) | `--cdCat02 0000`(국적총수) 전 자격×전 반기 | 943 | 2026-08-19 |

주요 수치 (기사용, 2025年12月末): 総在留外国人 4,125,395人 / 永住者 947,125人 /
技人国 475,790人 / 留学 464,784人 / 技能実習合計 456,618人 / 特定技能合計 390,296人
