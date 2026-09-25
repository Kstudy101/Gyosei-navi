# _scout-nagasaki-shi-kekkon — 長崎市 × kekkon 토픽 스카우트

조사일: 2026-09-22（取得メタの日付表記は fetch-source の JST 日付）
対象: 長崎市（nagasaki-shi / 42201）× kekkon
regions.ts: 登録済み（energy 記事由来）。本バッチでは regions 未変更。

## 채택 후보

없음（skip）.

## 조사 결과 요약

### 1. 結婚新生活支援事業（新婚世帯の住宅等への補助金）— 長崎市は令和8年度実施リストに無し

一次情報: `01_nagahapi_marriage_support.txt`
出典: 長崎県こども未来課「ながさきハッピーライフデザイン応援サイト」
URL: https://nagahapi.jp/marriage/support/

令和8年度版として列挙されている市町:
諫早市（大草・伊木力・本野／小長井）、平戸市、松浦市、対馬市、壱岐市、五島市、雲仙市、南島原市、東彼杵町、川棚町、波佐見町、長与町。

**長崎市は含まれない。**

第三者ブログ（`tmp_nagasaki_fuku2.html` / nagasaki.fuku-kaihikon.com）の長崎県内対象一覧にも長崎市は無し。
brapla の長崎市エントリ（`06_brapla_nagasaki.txt`）も出産・児童手当等のみで、結婚新生活支援事業・結婚祝い金は無し（雲仙市など他市には掲載あり）。

→ 市公式の結婚新生活（家賃・住宅取得・引越）現金補助ページは確認できず、記事化しない（原典なし＝skip）。

### 2. ながさきカップル応援パスポート — 市主導だが補助金ではない

一次情報:
- `03_couplepass.txt` / `05_couplepass_index.txt` — https://www.city.nagasaki.lg.jp/site/couplepass/
- `08_couplepass_73748.txt` — 事業概要 https://www.city.nagasaki.lg.jp/site/couplepass/73748.html
- `09_couplepass_73749.txt` — 利用者申込 https://www.city.nagasaki.lg.jp/site/couplepass/73749.html
- `12_couplepass_youkou.pdf` — 実施要綱

内容: 長崎市・長与町・時津町が協賛店舗の割引・プレゼント特典を受けられるパスポートを交付する官民連携事業。定額の住居費・引越費の現金補助ではない。

taxonomy `kekkon`（新婚世帯の住居費・引っ越し費用を補助する制度）および既存 kekkon 記事群（現金補助型）と性格が異なるため、本バッチでは記事化しない。

### 3. その他

- `02_mirai_supporters.txt` — ながさき未来サポーターズ概要ページ。トレーディングカード紹介で制度の金額・要件は無し。
- `04_pref_kekkon.txt` — 県の分類ページ。個別制度の金額なし。

## 확인되지 않은 것

- 長崎市が過去年度に結婚新生活支援事業を実施していたか（本調査は令和8年度公式リスト中心）。
- 市独自の結婚祝い金・婚姻記念品の現金／現物給付の有無（市検索・県リストでは未確認。無いと断定しない）。

## 배치 판정

**skip** — 시 독자 결혼신생활（현금・주택비）보조의 공식 원문을 확보하지 못함.
기사 MDX 미생성. regions / i18n / 라쿠텐 kekkon 매핑 미변경. git commit/push 없음.
