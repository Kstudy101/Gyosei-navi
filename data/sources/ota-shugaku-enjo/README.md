# 大田区 就学援助 — 一次情報 원문

> 취득일: 2026-09-22 / 용도: `content/subsidy/kyoiku/ota-shugaku-enjo.mdx` 집필
> 취득 방법: `npm run source`(cheerio 태그 제거만) / 인덱스・ナビ系は curl + cheerio strip / PDFは curl 直接ダウンロード

| 파일 | 원본 | 취득 방법 |
|---|---|---|
| `01_index.txt` | 就学援助（目次） | curl + cheerio（npm run source 本文短すぎ） |
| `02_enjo_taishosha.txt` | 就学援助の対象者 | `npm run source` |
| `03_shikyugaku.txt` | 就学援助費支給額について | `npm run source` |
| `04_kakeikyuuhen.txt` | 家計が急変した世帯の方へ | `npm run source` |
| `05_r9_nyugaku.txt` | 令和9年度小中学校就学予定者就学援助 | `npm run source` |
| `08_nagare.txt` | 申請から結果通知までの流れ | `npm run source` |
| `09_shikyujiki.txt` | 就学援助費支給時期について | `npm run source` |
| `10_horyu.txt` | 申請結果が【保留】の方へ | `npm run source` |
| `11_shoreihi.txt` | 就学奨励費（別制度・参考） | `npm run source` |
| `12_R8sinseisyo.pdf` | 令和8年度就学援助費受給申請書 | curl |
| `13_horyu_guide.pdf` | 保留にならないための手続き | curl |

원본 URL:
- https://www.city.ota.tokyo.jp/seikatsu/kodomo/kyouiku/gakko/syugaku_enjo/index.html
- https://www.city.ota.tokyo.jp/seikatsu/kodomo/kyouiku/gakko/syugaku_enjo/enjo_taishosha.html （更新日：2026年3月25日）
- https://www.city.ota.tokyo.jp/seikatsu/kodomo/kyouiku/gakko/syugaku_enjo/shikyugaku.html （更新日：2026年4月1日）
- https://www.city.ota.tokyo.jp/seikatsu/kodomo/kyouiku/gakko/syugaku_enjo/tsuchimade_nagare.html （更新日：2026年3月25日）
- https://www.city.ota.tokyo.jp/seikatsu/kodomo/kyouiku/gakko/syugaku_enjo/shikyujiki.html （更新日：2024年9月2日）
- https://www.city.ota.tokyo.jp/seikatsu/kodomo/kyouiku/gakko/syugaku_enjo/kakeikyuuhenn.html （更新日：2026年3月25日）
- https://www.city.ota.tokyo.jp/seikatsu/kodomo/kyouiku/gakko/syugaku/nyuugaku/syuugaku-enjyo.html （更新日：2025年9月25日）
- https://www.city.ota.tokyo.jp/seikatsu/kodomo/kyouiku/gakko/shoreihi.html

## 원문에서 확정한 사실 (기사 근거)

| 항목 | 원문 | 출처 |
|---|---|---|
| 제도명 | 就学援助 | 01・02 |
| 대상 | 小中学生の保護者で大田区在住。要保護（生活保護）または準要保護（前年所得が目安以下） | 02 |
| 所得目安 2人 | 302万円（収入目安433万円） | 02 |
| 所得目安 3人 | 363万円（509万円） | 02 |
| 所得目安 4人 | 407万円（563万円） | 02 |
| 所得目安 5人 | 489万円（666万円） | 02 |
| 所得目安 6人 | 548万円（731万円） | 02 |
| 目安注意 | 認定基準額は家族の年齢構成等で異なる。表はあくまで目安 | 02 |
| 家計急変 | 当年所得見込等の特例審査あり | 02・04 |
| 申請期間 | 4月〜2月26日。3月は受け付けない。年度ごとに申請必要 | 08 |
| 区立配布 | 4月入学式・始業式で申請書一斉配布。希望有無にかかわらず期限までに全員提出 | 08 |
| 区外提出 | ニッセイアロマスクエア5階 学務課へ持参または郵送 | 08 |
| 審査時期 | 当該年度住民税確定の6月中旬以降 | 08 |
| 結果区分 | 要保護 / 準要保護 / 否認定 / 保留 | 08 |
| 定例支給 | 年3回：7月下旬（1学期）・12月下旬（2学期）・3月中旬（3学期） | 09 |
| 新入学用品費 小1 | 57,060円 | 03 |
| 新入学用品費 中1 | 63,000円（小学校6学年または中学校1学年） | 03 |
| 給食費 小 | 月額4,100〜4,950円（学年別・準要保護）。8月分なし | 03 |
| 給食費 中 | 月額5,350円（夜間学級5,700円）。8月分なし | 03 |
| 学用品費 | 区立校・区外校で月額が異なる。8月分なし | 03 |
| 修学旅行 | 限度額68,000円（中） | 03 |
| 要保護注意 | 生活保護費から支給される費目は就学援助では支給しない | 03 |
| 給食無償化 | 他制度で負担なしの場合は就学援助の給食費対象外。物価高騰分加算あり | 03 |
| 私立・国立等 | 国立・都立・私立で食事持参の要保護は給食費支給対象となる場合あり | 03 |
| 問合せ | 学務課学事係 03-5744-1429 / FAX 03-5744-1536 | 02・08 |
| R9入学前 | 新小1・新中1向け入学準備の一部支給。新小申請期日令和8年11月20日など | 05 |
| 就学奨励費 | 特別支援向けの別制度 | 11 |

## ⚠️ 원문에서 확인되지 않은 것 (기사에서 단정 금지)

- 物価高騰分の給食費加算の具体円額（「加算した金額」との記載のみ）
- オンライン電子申請の有無・恒久URL（本文は学校提出・持参・郵送）
- 就学奨励費の最新支給額の詳細を本記事の主対象にすること（別制度として言及のみ）
- 3月受付不可以外の「通常一斉提出の校内締切日」（学校配布時の個別締切は原文に学年横断の単一日なし）
