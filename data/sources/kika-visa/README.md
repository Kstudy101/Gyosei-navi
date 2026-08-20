# 帰化申請 完全ガイド — 一次情報 원문

> 취득일: 2026-08-20 / 취득 경로: e-Gov 法令API (`npm run law`, 国籍法 5〜8条 verbatim) + 法務省 통계 PDF 직접 읽기 (verbatim) + 法務局 페이지 (WebFetch, 요약)

## 파일

| 파일 | 원 제목 | 원본 | 취득 상태 |
|---|---|---|---|
| `01_moj-kika-tokei-suii.txt` | 帰化許可申請者数・帰化許可者数・帰化不許可者数の推移（令和3〜7年） | https://www.moj.go.jp/content/001458302.pdf | ✅ verbatim (PDF 직접 읽기로 표 전체 확인) |

## e-Gov 法令API로 확보한 조문 (원문 그대로, `npm run law` 재현 가능)

| 조문 | 내용 | 근거 |
|---|---|---|
| 国籍法 第5条 | 普通帰化 6요건（住所5年・能力18歳・素行善良・生計要件・無国籍または喪失・憲法秩序） | `npm run law -- --law "国籍法" --article 5` |
| 国籍法 第6条 | 簡易帰化①（日本国民だった者の子・日本生まれ・居所10年） — 住所要件緩和 | `npm run law -- --law "国籍法" --article 6` |
| 国籍法 第7条 | 簡易帰化②（日本人の配偶者：婚姻+居住3年、または婚姻3年+居住1年） | `npm run law -- --law "国籍法" --article 7` |
| 国籍法 第8条 | 簡易帰化③（日本人の子・養子・日本国籍喪失者・無国籍で出生し3年居住） | `npm run law -- --law "国籍法" --article 8` |

## ⚠️ 검수 시 원문 재확인 필요 (verbatim 미확보 — WebFetch 요약본만)

| 페이지 | 원본 | 확인된 요지 (verbatim 아님) |
|---|---|---|
| 帰化許可申請（신청창구・수수료・표준처理期間） | https://www.moj.go.jp/ONLINE/NATIONALITY/6-2.html | 관할 법무局/지방법무局 제출. 手数料なし。標準処理期間の明示なし。随時申請可、15歳未満は法定代理人 |
| 帰化手続について（東京法務局） | https://houmukyoku.moj.go.jp/tokyo/page000001_00194.html | 필요서류는 国籍・職業・家族構成별로 상이 → 帰化相談에서 확인 |
| 帰化相談（初回相談） | https://houmukyoku.moj.go.jp/tokyo/page000001_00887.html | 예약제. 제출서류는 원칙 2통(원본1+사본1) |
| 帰化許可申請書類等 | https://houmukyoku.moj.go.jp/tokyo/page000001_00896.html | 신청서 양식 목록 (미열람, URL만 확인) |

## 사용처

- Month 4 #31 「帰化申請 完全ガイド｜要件・流れ・必要書類」 (pillar)
