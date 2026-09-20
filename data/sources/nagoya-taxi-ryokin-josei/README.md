# 名古屋市 タクシー料金の助成（重度障害者タクシー利用券）— 原文アーカイブ

## 対象制度
- 制度名: タクシー料金の助成（重度障害者福祉タクシー利用券／重度身体障害者リフト付タクシー利用券）
- 所管: 名古屋市 健康福祉局 障害福祉部 障害企画課 福祉担当（TEL 052-972-2587）／コールセンター 052-766-6616
- 制度類型: **現物給付型（利用券方式）** — 現金直接支給ではない。福祉特別乗車券・敬老パス等および福祉券／リフト券は相互選択制。

## 原文根拠表

| No | ファイル | URL | 取得日 | 種別 | 内容 |
|----|---------|-----|--------|------|------|
| 01 | `01_taxi-ryokin-josei.txt` | https://www.city.nagoya.jp/kenkofukushi/shougaisha/1016573/1016575.html | 2026-09-21 | HTML（npm run source） | 市公式の制度入口。詳細はウェルネットしおり・チラシへ誘導。更新日表記: 2026年2月26日 |
| 02 | `02_welnet-josei-taxi.txt` | http://www.kaigo-wel.city.nagoya.jp/view/wel/shiori/social/josei_taxi.html | 2026-09-21 | HTML（npm run source） | 障害者福祉のしおり本体。対象・枚数・上限・窓口・電子更新URL |
| 03 | `03_seido-henkou-chirashi.txt` | https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/016/575/taxiticketseidoannai.txt | 2026-09-21 | TXT直接DL | **令和6年4月制度変更案内**（移行時の枚数: 福祉160等）。現行R8数値とは異なるため記事の主根拠にしない |
| 04 | `04_seido-henkou-chirashi.pdf` | https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/016/575/taxiticketseidoannnai.pdf | 2026-09-21 | PDF直接DL | 03と同内容のPDF |
| 05 | `05_R8-oshirase.txt` | http://www.kaigo-wel.city.nagoya.jp/_files/00152198/R8oshirase_.txt | 2026-09-21 | TXT直接DL | **令和8年度版** 福祉タクシー利用券のお知らせ（主根拠） |
| 06 | `06_faq.txt` | http://www.kaigo-wel.city.nagoya.jp/_files/00136341/shitumon_.txt | 2026-09-21 | TXT直接DL | よくあるご質問（令和6年4月作成） |
| 07 | `07_R8-lift-oshirase.txt` | http://www.kaigo-wel.city.nagoya.jp/_files/00152228/R8liftoshirase_.txt | 2026-09-21 | TXT直接DL | **令和8年度版** リフト付タクシー利用券のお知らせ |
| 08 | `08_R8-oshirase.pdf` | http://www.kaigo-wel.city.nagoya.jp/_files/00152181/R8oshirase.pdf | 2026-09-21 | PDF直接DL | 05のPDF版 |
| 09 | `09_R8-taxi-ichiran.txt` | http://www.kaigo-wel.city.nagoya.jp/_files/00152204/R8ichiran_.txt | 2026-09-21 | TXT直接DL | 利用できる主なタクシー会社一覧 |

## 確認できた核心情報（現行・令和8年度）

### 重度障害者福祉タクシー利用券（05 / 02）
- 1枚上限 **500円**、1乗車あたり最大 **10枚（5,000円）**
- 年間上限 **180枚**（年度途中申請は申請月から年度末までの月数分）
- 人工透析で週3回以上通院: 年間 **220枚**（110枚×2冊）
- 対象: 身体1・2級／愛護1・2度／身体3級かつ愛護3度／精神1級（他自治体療育手帳は窓口確認）。本市住民限定
- 福祉特別乗車券・敬老パス・リフト付タクシー利用券との**選択制**

### 重度身体障害者リフト付タクシー利用券（07 / 02）
- 1枚上限 **2,000円**、1乗車あたり最大 **5枚（10,000円）**
- 年間上限 **140枚**／透析週3回以上: **170枚**
- 対象: 身体1・2級で外出時に車いす等を必要とする方
- AJU自立の家リフトカー運行との**併用不可**（リフトカー希望時は福祉券を選択）

### 共通
- 通用期間（しおり）: 毎年4月1日〜翌年3月31日。更新は原則毎年3月17日頃から
- 迎車料金等は助成対象（FAQ）。有料道路・駐車・ストレッチャー使用料・介助料金は対象外
- 年度途中紛失の再交付不可
- 更新の電子申請（既存交付者・郵送希望）: https://ttzk.graffer.jp/city-nagoya/smart-apply/apply-procedure-alias/taxi-koushin-r8 （令和8年度券は令和8年3月17日以降更新・発送）

## 制度の性格分類
- **給付形態**: 現物給付（利用券）
- **比較上の位置**: 横浜市・福岡市・東京23区の福祉タクシー券と同系列。名古屋は福祉券とリフト券の2系統＋市バス等乗車券との選択制

## 確認できなかった事項
1. 所得制限の有無 — R8案内・しおりに市民税非課税等の記載なし（未記載≠なしと断定しない）
2. 新規申請の標準処理日数・必要書類の詳細リスト（手帳持参の案内のみ）
3. 03のR6変更後枚数（160等）から現行180等へいつ改定されたかの経緯文書

## 総務省コード
- 名古屋市: `23100`（regions.ts 既存登録、再登録不要）
