# 津市 × kekkon 調査メモ（記事スキップ）

> 調査日: 2026-09-22（`npm run source` ヘッダは環境日付 2026-09-21 表記）
> 対象: 三重県津市（regions: `tsu` / 24201）× カテゴリ `kekkon`
> 結論: **skip** — 新婚世帯の住居費・引っ越し費用を補助する市独自の「結婚新生活支援」系制度の一次情報を確認できず、記事未作成。

## 調査で確認した公式一次情報

| # | ファイル | URL | 内容 |
|---|---|---|---|
| 01 | `01_kekkon-shien-annai.txt` | https://www.info.city.tsu.mie.jp/shisei/gyouzaiseikaikaku/1009903/1005695/1002689/1002691/1002694.html | 津市「結婚支援に関する事業のご案内」（更新日2026年7月15日）。出会い応援イベント・個別相談・親向けセミナー・みえ結婚支援プロジェクト案内。**金額付きの住居費・転居費補助の記載なし** |
| 60 | `60_mie-pref-kekkon-shinseikatsu.txt` | https://www.pref.mie.lg.jp/SHOSHIKA/HP/m0074300040.htm | 三重県「結婚新生活支援事業」。県内実施は **いなべ市・熊野市・紀北町・紀宝町** の4市町のみと明記。**津市は列挙なし** |
| 80 | `80_teate-josei.txt` | https://www.info.city.tsu.mie.jp/kosodateouen/shien_josei_enjo/1002876/index.html | 子育て「手当・助成」索引。結婚新生活・新婚世帯向け住居費補助の項目なし |
| 81 | `81_deai-ouen-index.txt` | https://www.info.city.tsu.mie.jp/shisei/gyouzaiseikaikaku/1009903/1005695/1002689/1002691/index.html | 「出会い応援」索引。イベント・相談・セミナーのみ |
| 82 | `82_kinenju.txt` | https://www.info.city.tsu.mie.jp/kurashi/lifescene/1002461/1002465.html | 記念樹配布事業（結婚も対象だが苗木配布。現金補助・住居費補助ではない） |

## スキップ理由（編集判断）

1. `kekkon` カテゴリ定義（`taxonomy.ts`）は「新婚世帯の住居費・引っ越し費用を補助する制度」が中心。
2. 津市公式の結婚支援ページは **マッチング・出会い支援** であり、住居費・転居費の補助金ではない。
3. 三重県公式が示す結婚新生活支援事業の実施市町に津市が含まれない。
4. ユーザ指示「市独自の結婚新生活支援等」「原文なければ skip」「数値創作禁止」「国家制度単独禁止」に従い、記事を作らない。

## 未確認・断定しないこと

- 「津市に結婚関連のあらゆる支援が存在しない」とは断定しない（出会い応援・記念樹等は存在する）。
- 将来、市が結婚新生活支援事業を新規実施する可能性は排除しない。再調査時は県の実施市町リストと市公式を再確認すること。

## このバッチで触らなかったもの

- 既存 `content/` 記事
- `src/config/regions.ts` / i18n
- `src/lib/ads/rakuten/mapping.ts` および `data/ads/rakuten/kekkon.json`（既存維持）
- git commit / push / `git add -A`
