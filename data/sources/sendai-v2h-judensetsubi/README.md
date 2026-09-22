# sendai-v2h-judensetsubi

対象自治体: 宮城県仙台市（団体コード 04100／検査数字込み6桁 041009）
対象制度: 家庭向けV2H充放電設備設置費補助金
所管: 環境局脱炭素政策課（制度案内）／せんだいエコトク補助金事務局（申請・提出先、022-393-7951）

> 取得日: 2026-09-22 / 用途: `content/subsidy/energy/sendai-v2h-judensetsubi.mdx` 執筆
> 既存記事 `sendai-taiyoko-to-donyu-kizonkodate`（既存戸建・太陽光＋蓄電池）とは別制度。重複回避のため本スラッグを採用。

## 原文根拠表

| 項目 | 原文の記載 | 出典ファイル |
|---|---|---|
| 制度名 | 家庭向けV2H充放電設備設置費補助金／交付要綱題名「仙台市家庭向けＶ２Ｈ充放電設備設置費補助金交付要綱」 | 01_v2h.txt L134 / 03_youkou.extracted.txt L1 |
| ページ更新 | 2026年8月7日（ページID：68471） | 01 L128-L130 |
| 予算額 | 2,400,000円 | 01 L170-L172 |
| 補助金額 | 補助対象経費の3分の1と上限20万円の低い方（千円未満切捨て）。別表1・FAQも同旨 | 01 L206-L221 / 02_tebiki.extracted.txt L93-L95 / 03 L211-L221 / 04_faq.extracted.txt L84 |
| 補助対象経費 | V2H購入費＋設置工事費（税抜）。国・県等の補助金がある場合はその額を控除 | 01 L214-L225 / 02 L113-L119 / 03 第7条 |
| 対象者 | 市内戸建に居住または居住予定。市税滞納なし。暴力団等関係なし。同年度内の本補助金未申請。本市他補助金の交付決定なし。工事未着手 | 01 L174-L186 / 03 第3条 |
| 対象設備 | 市内戸建・未使用・非リース・次世代自動車振興センター登録機器・同一住居内で放電電力を使用・太陽光発電システムと連携・交付決定前に工事未着手 | 01 L188-L204 / 03 第6条 |
| 申請期間 | 令和8年5月1日〜12月15日（必着。予算次第で終了。先着） | 01 L257-L265 / 02 L70-L71 |
| 実績報告 | 事業完了から60日以内または令和9年1月29日のいずれか早い日（必着） | 01 L273-L275 / 02 L79-L80 / 03 第14条 |
| 審査 | 書類受理後、不備なければ土日を含まない14日以内に決定通知 | 01 L237 / 02 L76-L77 |
| 提出先 | 〒980-0811 仙台市青葉区一番町2丁目7-12南町通MKビル3階 カメイ株式会社内せんだいエコトク補助金事務局あて（郵送） | 01 L281-L285, L395-L403 |
| 処分制限 | 額確定通知日から5年以内の処分は事前承認。日数按分返還等あり | 03 第20条 |
| 帳簿保存 | 交付を受けた年度の翌年度から5年間 | 03 第21条 |

## 原文ファイル

| ファイル | URL / 取得方法 |
|---|---|
| 01_v2h.txt | https://www.city.sendai.jp/kankyo/energyjiritsu/v2h.html （npm run source） |
| 02_tebiki.pdf / .extracted.txt | https://www.city.sendai.jp/kankyo/energyjiritsu/documents/r8_v2h_tebiki_itaku0728.pdf （直接DL） |
| 03_youkou.pdf / .extracted.txt | https://www.city.sendai.jp/kankyo/energyjiritsu/documents/r8_youkou.pdf （直接DL） |
| 04_faq.pdf / .extracted.txt | https://www.city.sendai.jp/kankyo/energyjiritsu/documents/r8_faq.pdf （直接DL） |
| 05_sinseisyorui.pdf / .extracted.txt | https://www.city.sendai.jp/kankyo/energyjiritsu/documents/r8_sinnseisyorui.pdf （直接DL） |

## 確認されていないこと

- 令和8年度予算2,400,000円の残額・消化状況のリアルタイム値
- 国の令和8年度V2H対象機器一覧の最終版URL更新タイミング（FAQに「国の支援事業詳細公開後に更新予定」とある）
- 店舗兼住宅の個別判定（FAQは原則対象外とし、登記事項証明書等の提出を求める場合ありと案内）

## regions.ts

`{ code: "04100", slug: "sendai", labelJa: "仙台市", prefCode: "04" }` 既存登録済み。再登録不要。
