# sendai-taiyoko-to-donyu-kizonkodate

対象自治体: 宮城県仙台市（団体コード 04100／検査数字込み6桁 041009）
対象制度: 太陽光発電等導入補助金（既存戸建住宅向け）
所管: 環境局脱炭素政策課（制度案内）／せんだいエコトク補助金事務局（申請・提出先、022-393-7951）

> 取得日: 2026-09-21 / 用途: `content/subsidy/energy/sendai-taiyoko-to-donyu-kizonkodate.mdx` 執筆

## 原文根拠表

| 項目 | 原文の記載 | 出典ファイル |
|---|---|---|
| 制度名 | 太陽光発電等導入補助金（既存戸建住宅向け） | 01_kizonkodate.txt L134 / 05_kizonyoukou.extracted.txt 表題 |
| ページ更新 | 2026年9月15日（ページID：86551） | 01 L128-L130 |
| 予算額 | 30,900,000円（予算がなくなり次第終了予定） | 01 L212-L214 |
| 補助金額 | 定額30万円／交付要綱第6条「補助金額は300,000円とする」 | 01 L244 / 04_tebiki.extracted.txt L99 / 05 L60 |
| 対象設備 | 新品の太陽光発電システムと蓄電池（太陽光パネル、パワーコンディショナー、蓄電池）を同時設置。出力1kW以上 | 01 L218 |
| 対象者 | 補助対象住宅を所有し常時居住（配偶者・一親等親族の常時居住も可）。市税滞納なし。暴力団等関係なし | 01 L220-L226 |
| 国費補助金 | 国費を財源とする補助金（例：DR補助金）を受けていないこと。宮城県の補助金は併用可能 | 01 L228 / 04 L20-L21,L85 |
| FIT | 国の固定価格買い取り制度（FIT売電）による売電を行わない方。非FIT余剰売電は可能 | 01 L230 / 04 L23-L25 / 06_situmon.extracted.txt L30 |
| 契約時期 | 令和8年4月1日以降に設置工事契約を締結し、着手前であること（契約前申請可） | 01 L234-L236 |
| 耐震等 | 現行耐震基準（2000年基準）建築、または重量増を考慮した構造安全性 | 01 L238 |
| 自家消費 | 導入PVの発電量の30%以上を当該住宅で消費 | 01 L240 / 04 L70 / 05 別表 |
| 申請期間 | 令和8年5月1日から12月15日（必着） | 01 L256-L258 / 04 L88 |
| 実績報告・工事完了 | 令和9年1月29日まで | 01 L257-L258 / 04 L474 |
| 提出先 | 〒980-0811 仙台市青葉区一番町2丁目7-12南町通MKビル3階 カメイ株式会社内 せんだいエコトク補助金事務局あて（郵送） | 01 L292-L294 |
| R8.10.1変更 | 北側屋根パネルは原則防眩仕様必須。屋根形状確認資料追加。旧様式は差替え要請の可能性 | 01 L302-L330 / 04 L137 / 05 別表 |

## 原文ファイル

| ファイル | URL / 取得方法 |
|---|---|
| 01_kizonkodate.txt | https://www.city.sendai.jp/ondanka/kodannetsu/kizonkodate.html （npm run source） |
| 02_taiyoukou-sien.txt | https://www.city.sendai.jp/datsutanso-suishin/taiyoukou/sien.html （npm run source） |
| 03_ouchi-eco-toku.txt | https://www.city.sendai.jp/ondanka/ouchi/zerokarbon.html （npm run source） |
| 04_tebiki.pdf | https://www.city.sendai.jp/ondanka/kodannetsu/documents/tebiki.pdf （直接DL） |
| 05_kizonyoukou.pdf | https://www.city.sendai.jp/ondanka/kodannetsu/documents/kizonyoukou.pdf （直接DL） |
| 06_situmon.pdf | https://www.city.sendai.jp/ondanka/kodannetsu/documents/situmon.pdf （直接DL） |
| 07_sinseisyorui.pdf | https://www.city.sendai.jp/ondanka/kodannetsu/documents/sinseisyorui.pdf （直接DL） |

## 確認されていないこと

- 令和8年度予算の残額・消化状況のリアルタイム値（ページは総額30,900,000円と「予算がなくなり次第終了」のみ）
- リース／PPA利用時の還元方法の個別事例（手引きに原則記載はあるが、案件ごとの扱い詳細は事務局確認が必要）
- 新築戸建・新築共同住宅向け同名補助金の詳細数値（本記事対象外。既存戸建向けのみ精読）
- 記入例中の「補助金額 600,000円（税抜）」は見積・経費計算の例示であり、市の交付額（定額30万円）とは別物

## regions.ts

`{ code: "04100", slug: "sendai", labelJa: "仙台市", prefCode: "04" }` 既存登録済み。再登録不要。
