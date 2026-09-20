# kurume-kekkon-shinseikatsu-shien — 原文根拠

## 対象制度
- 制度名: 久留米市結婚新生活支援補助金（令和8年度）
- 実施主体: 福岡県久留米市（こども家庭庁・地域少子化対策重点推進交付金）
- 記事slug: `kurume-kekkon-shinseikatsu-shien`
- 地域コード: `40203`（総務省団体コード 402036 の検査数字除去5桁）

## 原文一覧

| # | ファイル | 取得元 | 取得日 | 備考 |
|---|---|---|---|---|
| 00 | `00_fukuoka-pref-area-list.html` | https://kekkon-ouen.pref.fukuoka.lg.jp/fukuoka/contents/area.php | 2026-09-20 | 福岡県「ふく♥こい」実施自治体一覧。久留米市掲載を確認 |
| 01 | `01_kurume-official.txt` | https://www.city.kurume.fukuoka.jp/1060manabi/2010kosodate/3250ouenjigyou/2026-0625-0849-40.html | 2026-09-20 | 継続世帯向け（令和7年度初回交付者）。`npm run source` |
| 02 | `02_kurume-first-time.txt` | https://www.city.kurume.fukuoka.jp/1060manabi/2010kosodate/3250ouenjigyou/2023kekkonsinseikatusienhojyokin.html | 2026-09-20 | **新規申請者向け（記事の主根拠）**。`npm run source` |
| 03 | `03_kurume-faq.txt` | https://www.city.kurume.fukuoka.jp/1060manabi/2010kosodate/3250ouenjigyou/kekkonshinseikatsushienhojyokinfaq.html | 2026-09-20 | よくある質問。`npm run source` |
| 04 | `04_soumu-zenkoku-chihoukoukyoudantai-code.pdf` | 総務省「全国地方公共団体コード」一覧（000925834.pdf） | （既存コピー） | 26ページ目: 402036 福岡県 久留米市 |
| 05 | `05_R8_leaflet.pdf` | https://www.city.kurume.fukuoka.jp/1060manabi/2010kosodate/3250ouenjigyou/files/R8kekkonntirashi.pdf | 2026-09-20 | 令和8年度チラシ。補助上限額を再確認 |
| 06 | `06_R8_setsumei.pdf` | https://www.city.kurume.fukuoka.jp/1060manabi/2010kosodate/3250ouenjigyou/files/R8shinnkisetumeishiryou.pdf | 2026-09-20 | 令和8年度説明資料（新規向け） |

## 原文から確定した数値・条件（記事に使用）

- 補助上限額: 婚姻日の年齢が夫婦ともに29歳以下 → 最大60万円／夫婦ともに39歳以下 → 最大30万円（02・05・06で一致）
- 婚姻日: 令和8年1月1日〜令和9年2月26日
- 所得: 夫婦の合計所得金額500万円未満（奨学金返済額は控除可）
- 定住意思: 今後3年以上
- 対象費用支払期間: 令和8年4月1日〜令和9年2月26日
- 住宅賃借: 家賃・敷金・礼金・共益費・仲介手数料（家賃・共益費は最大5か月分。住宅手当は差し引き）
- 住宅取得: 婚姻日の1年前までに取得した建物部分のみ
- リフォーム: 婚姻日の1年前までの工事（倉庫・外構・家電は対象外）
- 引越: 業者・運送業者への支払
- 締切: 令和9年2月26日（予算上限到達で早期終了）
- 講座受講必須（夫婦とも）: ライフデザイン／プレコンセプション／医療機関相談／共家事・共育て のいずれか
- 申請: 原則窓口持参のみ（郵送・メール原則不可）。子ども未来部子ども政策課（本庁舎15階）TEL 0942-30-9227

## 確認されていないこと

- 令和8年度の予算総額・残額の最新数値（HP本文・チラシに具体額なし。「予算状況は公式HPで確認」と記載）
- 令和9年度の継続実施の有無（FAQ: 「令和9年度の実施は未定」）
- 福岡市は結婚新生活支援を実施していない（県一覧・別セッション調査）。本記事は久留米市のみ対象

## 制度タイプ
現金直接補助型（新婚世帯の住居費・引越費等）。国の交付基準額（29歳以下60万／それ以外30万）をそのまま採用。
