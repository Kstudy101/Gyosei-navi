# 奈良市「譲渡動物不妊去勢手術補助金」— 一次情報 原文

> 取得日: 2026-09-21 / 用途: 奈良県 奈良市 × `pet` カテゴリ。既存の `nara-shi-neko-funinkyosei`（飼い主のいない猫）とは別制度。

## 原文一覧

| # | ファイル | 内容 | 取得方法 | 備考 |
|---|---|---|---|---|
| 01 | `01_press-r8.txt` | 犬猫殺処分ゼロを7年連続で達成しました【市長会見】（令和8年5月14日発表）HTML | `npm run source` | https://www.city.nara.lg.jp/site/press-release/266153.html |
| 02 | `02_press-r7.txt` | 犬猫殺処分ゼロを6年連続で達成（令和7年）HTML | `npm run source` | https://www.city.nara.lg.jp/site/press-release/236353.html（対照用） |
| 03 | `03_press-r8-shiryo.pdf` / `.txt` | 令和8年5月14日 報道資料PDF（概要1枚） | `curl` + `pdftotext` | https://www.city.nara.lg.jp/uploaded/attachment/211231.pdf |
| 04 | `04_press-r8-shiryo2.pdf` / `.txt` | 令和8年5月14日 報道資料PDF（詳細スライド） | `curl` + `pdftotext` | https://www.city.nara.lg.jp/uploaded/attachment/211232.pdf |
| 05 | `05_press-r3.txt` | 【市長会見】犬猫殺処分ゼロを2年連続（令和3年5月）HTML | `npm run source` | https://www.city.nara.lg.jp/site/press-release/110985.html（制度開始経緯の対照） |
| 06 | `06_press-r3-shiryo.pdf` / `.txt` | 令和3年会見資料PDF | `curl` + `pdftotext` | https://www.city.nara.lg.jp/uploaded/attachment/128375.pdf |
| 07 | `07_joto-tetsuzuki.txt` | 犬または猫の譲渡手続き | `npm run source` | https://www.city.nara.lg.jp/soshiki/97/7968.html ※本補助金の申請手順は未記載 |
| 08 | `08_neko-funinkyosei-contrast.txt` | 飼い主のいない猫不妊去勢手術支援事業ページ（対照） | コピー | 既存記事 `nara-shi-neko-funinkyosei` 対象制度 |

## 原文根拠表（記事に使う数値・事実）

| 項目 | 原文の記載 | 出典 |
|---|---|---|
| 制度名 | 譲渡動物不妊去勢手術補助金 | 01 / 04（スライド「③譲渡動物不妊去勢手術補助金」） |
| 開始 | 平成29年5月 | 01・04・05・06 |
| 対象 | 保健所から譲渡した犬猫の不妊去勢手術 | 04 p.18相当「保健所から譲渡した犬猫の不妊去勢手術に対し、上限5,000円まで補助金を交付。」 |
| 補助上限 | 上限5,000円 | 同上（令和7年度実績・令和8年度予算でも同額） |
| 令和7年度実績 | 14頭・支給額70,000円 | 04 |
| 令和8年度 | 継続。予算額350,000円（5,000円／頭・70頭） | 04 |
| 窓口 | 健康医療部 保健所 保健衛生課 Tel 0742-93-8395 | 03・01 |

## 既存記事との差別化

- `nara-shi-neko-funinkyosei` … **飼い主のいない猫（野良猫）**向け。手術券方式・自己負担0円。
- 本トピック … **保健所から譲渡された犬・猫**向け。上限5,000円の補助金。対象動物・制度設計が異なる。

## 確認されていないこと

- 交付要綱・申請様式の公開URL（市公式サイト・例規で専用ページを確認できず）
- 申請期限（手術後何日以内か等）
- 必要書類（領収書・手術証明書の要否など）
- 指定動物病院の有無（飼い主のいない猫事業のような指定協力病院リストは本制度では未確認）
- 譲渡時点で既に不妊去勢済みの個体の扱い
- 飼い犬・飼い猫一般（保健所譲渡以外）は対象外と解されるが、コールセンターFAQ以外の詳細文言は未確認
- `07_joto-tetsuzuki.txt`（譲渡手続きページ）には本補助金の案内が無い

申請手続の詳細は保健衛生課への確認が必要。記事本文では上記未確認事項を推測で埋めない。
