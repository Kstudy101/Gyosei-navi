# 小規模事業者持続化補助金＜共同・協業型＞第3回公募 — 一次情報 원문

> 취득일: 2026-09-20 / 용도: `content/subsidy/sogyo/jizokuka-hojokin-kyodo-kyogyo.mdx` 집필
> 취득 방법: `src/lib/sources/jgrants.ts` `fetchSubsidyDetail()`(jGrants 公開API v2)

| 파일 | 원본 | 취득 방법 |
|---|---|---|
| `01_jgrants-v2-detail-a0WJ200000CDcQOMA1.json` | jGrants v2 詳細API 応答（加工なし） | `GET https://api.jgrants-portal.go.jp/exp/v2/public/subsidies/id/a0WJ200000CDcQOMA1` |

※ JSON 내 `detail` 필드는 HTML 태그를 포함한 API 원응답 그대로다(가공・요약하지 않음 — AGENTS.md 절대규칙 7).

## 원문에서 확정한 사실 (기사 근거)

| 항목 | 원문 | 출처(JSON 필드) |
|---|---|---|
| 정식명칭 | 小規模事業者持続化補助金＜共同・協業型＞ 第３回公募 | `title` |
| 실시기관 | 小規模事業者持続化補助金＜共同・協業型＞事務局 | `institution_name` |
| 대상지역 | 全国 | `workflow[0].target_area_search` |
| 모집시작 | 2026-08-14T06:00Z（JST 2026-08-14 15:00） | `workflow[0].acceptance_start_datetime` |
| 모집마감 | 2026-09-30T08:00Z（JST 2026-09-30 17:00） | `workflow[0].acceptance_end_datetime` |
| 사업종료기한 | 2027-12-10T14:59Z（JST 2027-12-10 23:59） | `workflow[0].project_end_deadline` |
| 보조상한액 | 参画事業者10者以上: 3,000万円 / 5〜9者: 2,000万円 | `subsidy_max_limit`(3000万円=3000万として登録) + `detail` 본문 |
| 보조율 | 定額、または2/3 | `subsidy_rate` |
| 대상자 | 地域振興等機関が5者以上の参画事業者（小規模事業者）を支援する共同・協業の取組 | `detail` 「■対象者」 |
| 대상업종 | 建設業・製造業・情報通信業 등 대부분(詳細は`industry`) | `industry` |
| 종업원수 제약 | 従業員数の制約なし | `target_number_of_employees` |
| 문의처 | 03-6634-8730 / kkr6@kyodokyogyohojokin.info（평일 9:30-12:00, 13:00-17:00） | `detail` 「■問合せ先」 |
| 공식 상세페이지 | https://www.jgrants-portal.go.jp/subsidy/a0WJ200000CDcQOMA1 | `front_subsidy_detail_page_url` |
| 공모요령 원문 | https://r6.kyodokyogyohojokin.info/doc/r6_koubover6_kk3.pdf | `detail` 내 링크 |

## ⚠️ 원문에서 확인되지 않은 것 (기사에서 단정 금지)

- 개별 참가사업자(소규모사업자)가 받는 **직접 지원금액**은 원문에 없음. 이 제도는 지역진흥기관에 지급되는 보조금이며, 참가사업자에게 직접 보조금을 지급하는 게 아니라고 명시돼 있다(`detail` 「※参画事業者に対して直接補助金を支出することはできない」).
- 채택률・경쟁률 등 심사 통계는 이 API 응답에 없음.
- 신청 방법 상세(필요서류 등)는 공모요령 PDF(위 링크)에 있으나, 본 세션에서는 PDF 본문을 직접 취득하지 않았다 — 기사에서 「공모요령 참조」로 안내하고 단정하지 않을 것.
