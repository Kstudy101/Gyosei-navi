# 北海道函館市 家族介護用品給付事業

## 対象自治体・コード

- 函館市（北海道）総務省コード **01202**（検査数字込み012025、`regions.ts` 登録済 `hakodate`）
- `src/config/regions.ts` に `{ code: "01202", slug: "hakodate", labelJa: "函館市", prefCode: "01" }` 登録済み（地域猫不妊去勢手術費補助金記事作成時に追加）

## 原文アーカイブ一覧

| No | ファイル | 取得元URL | 取得日 | 取得方法 |
|---|---|---|---|---|
| 01 | `01_kaigosha-sasaeru.txt` | https://www.city.hakodate.hokkaido.jp/docs/2014030500049/ | 2026-09-22 | `npm run source` |
| 02 | `02_jigyosha-boshu.txt` | https://www.city.hakodate.hokkaido.jp/docs/2022021500121/ | 2026-09-22 | `npm run source` |
| 03 | `kaigoyouhinyoukouissiki.pdf` / `.txt` | https://www.city.hakodate.hokkaido.jp/docs/2022021500121/file_contents/kaigoyouhinyoukouissiki.pdf | 2026-09-22 | curl直接DL + `pdftotext`（実施要綱） |
| 04 | `R8manual.pdf` / `.txt` | https://www.city.hakodate.hokkaido.jp/docs/2022021500121/file_contents/R8manual.pdf | 2026-09-22 | curl直接DL + `pdftotext`（令和8年度・事業者向け対応マニュアル） |
| 05 | `R8tourokutebiki.pdf` / `.txt` | https://www.city.hakodate.hokkaido.jp/docs/2022021500121/file_contents/R8tourokutebiki.pdf | 2026-09-22 | curl直接DL + `pdftotext`（令和8年度事業者登録の手引き） |
| 06 | `tourokuyouryou.pdf` / `.txt` | https://www.city.hakodate.hokkaido.jp/docs/2022021500121/file_contents/tourokuyouryou.pdf | 2026-09-22 | curl直接DL + `pdftotext`（事業者登録要領） |
| 07 | `R6kazokuomutsuchirashi.pdf` / `.txt` | https://www.city.hakodate.hokkaido.jp/docs/2014030500049/file_contents/R6kazokuomutsuchirashi.pdf | 2026-09-22 | curl直接DL + `pdftotext`（市民向けちらし。ファイル名はR6だが案内ページからリンク） |
| 08 | `R7nagare.pdf` / `.txt` | https://www.city.hakodate.hokkaido.jp/docs/2014030500049/file_contents/R7nagare.pdf | 2026-09-22 | curl直接DL + `pdftotext`（事業の流れ） |
| 09 | `R6taisyousyouhin.pdf` / `.txt` | https://www.city.hakodate.hokkaido.jp/docs/2014030500049/file_contents/R6taisyousyouhin.pdf | 2026-09-22 | curl直接DL + `pdftotext`（対象商品） |
| 10 | `2gousinseisyo.pdf` / `.txt` | https://www.city.hakodate.hokkaido.jp/docs/2014030500049/file_contents/2gousinseisyo.pdf | 2026-09-22 | curl直接DL + `pdftotext`（申請書・別記第2号様式） |
| 11 | `R8-5jigyousyairtiran.pdf` | https://www.city.hakodate.hokkaido.jp/docs/2014030500049/file_contents/R8-5jigyousyairtiran.pdf | 2026-09-22 | curl直接DL（登録事業者一覧 R8.5。PDFはgitignore対象の可能性あり） |
| 12 | `R8kazokuiroukinchirashi.pdf` / `.txt` | https://www.city.hakodate.hokkaido.jp/docs/2014030500049/file_contents/R8kazokuiroukinchirashi.pdf | 2026-09-22 | curl直接DL + `pdftotext`（別制度・家族介護慰労事業ちらし。関連制度メモ用） |

## 確認できた主要事実（一次確認）

### 制度名
- **函館市家族介護用品給付事業**（原文01・03・07）

### 目的・給付形態
- 在宅の要介護者を抱える家族に、介護用品と引き換えできる**利用券**を給付（原文01・07）
- 現金支給ではなく、登録事業者での引換（原文03第6条・原文04）

### 対象（原文01・07・03）
支給対象者は次を**全て**満たす家族:
1. 申請家族および要介護者が本市に住所を有する
2. 申請家族およびその配偶者が市民税非課税世帯
3. 要介護者およびその配偶者が市民税非課税世帯
4. 申請家族および要介護者が、市町村民税課税者の税法上の扶養親族等ではない
5. 要介護者が要介護3・4・5で、かつ介護用品（オムツ等）が必要な状態
6. 在宅で介護（入院・施設入所は対象外）
7. 要介護者が生活保護受給者でないこと

要綱第5条でも介護用品使用者側に生活保護除外・非課税等を明記（原文03）。

### 給付内容
- **月額5,000円を上限**の利用券（原文01・07・03第6条）
- 上限超過分は自己負担（原文01）
- 対象品目: **紙おむつ，尿取りパッド，お尻拭き，使い捨て手袋**（原文03別表・原文08・09）
- 防水シーツ等・床や布団に敷くものは対象外（原文09）
- 利用券は一月に1枚・1回のみ。初月分（ピンク色）のみ翌月使用可。おつり・翌月繰越不可（原文04）
- 代理人による利用券使用は不可。同行購入は可（原文04）

### 申請・窓口（原文01・07）
- 申請書を郵送、または市役所2階高齢福祉課窓口・各支所で受付
- 郵送先: 〒040-8666 函館市東雲町4番13号 函館市保健福祉部高齢福祉課
- 申請後、聞き取り調査の電話あり。おおむね2週間程度で決定/却下通知（原文07）
- 問い合わせ: 高齢福祉課 家族介護支援・認知症担当 TEL 0138-21-3081 / E-Mail kazoku-kaigo@city.hakodate.hokkaido.jp
- 給付可能期間: 申請月から同一年度内の3月まで。3月申請は15日まで（原文03第8条）

### 制度類型
利用券引換型（月額上限5,000円）・紙おむつ等の介護用品

## 確認されていない事項（unresearched）

- 令和8年度市民向けちらしの最新版ファイル名（案内ページのリンクは `R6kazokuomutsuchirashi.pdf` / `R6taisyousyouhin.pdf`。内容は現行案内と整合するが、年度表記の更新有無はページ更新日2026-06-18時点でもファイル名はR6のまま）
- 年度ごとの予算到達による受付終了の有無（原文に先着・予算上限の明文なし）
- 電子申請の可否（原文01・07は郵送・窓口・支所案内）
- 家族介護慰労事業（年10万円）は同ページの別制度。本稿の主対象外（関連として言及可）

## 取得日
- 2026-09-22
