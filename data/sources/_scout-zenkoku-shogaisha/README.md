# scout: 全国（regionCode 00000）× shogaisha

調査日: 2026-09-24

## 候補

| 優先 | 制度 | URL | 判断 |
|---|---|---|---|
| 1 | 身体障害者補助犬（盲導犬・介助犬・聴導犬）育成事業 | https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/hojoken/index.html | 原文確保済み（`01_mhlw_hojoken_index.txt`）。ページは制度趣旨・啓発資料・研究成果へのリンク集が中心で、個人が「いくら・どう申請すれば無償貸与を受けられるか」という金額・申請手続きの具体情報がこの一次情報だけでは確認できなかった（自治体担当窓口一覧PDFへの導線はあるが窓口は都道府県・指定都市ごとに異なる）。また別途取得したリーフレット（`もっと知ってほじょ犬`テキスト版）も補助犬の衛生・マナー啓発が主旨で、支給要件・金額の確認には使えなかった。AGENTS.md 絶対規則9（金額・条件の原文対照100%）を満たせないため**今回は不採用・スキップ**。 |
| 2 | 特別児童扶養手当 | https://www.mhlw.go.jp/bunya/shougaihoken/jidou/huyou.html | **採用** → `content/subsidy/shogaisha/tokubetsu-jido-fuyo-teate.mdx`。20歳未満の障がい児を養育する父母等への国の現金給付（月額1級58,450円／2級38,930円、令和8年4月より適用）。既存published記事（特別障害者手当＝20歳以上本人向け、補装具費支給制度）と対象・受給者が重複しないことを確認済み。原文は `data/sources/tokubetsu-jido-fuyo-teate/` にアーカイブ。 |

## 副次的な技術メモ

候補2の一次情報ページ（`huyou.html`）は HTML meta で `charset=shift_jis` のレガシーページだったが、`npm run source`（`scripts/fetch-source.ts`）が UTF-8 固定デコードだったため文字化けした。`fetch-source.ts` に Content-Type／meta charset 判定処理を追加して修正済み（詳細は `data/sources/tokubetsu-jido-fuyo-teate/README.md` 参照）。今後、同様の官公庁レガシーページを扱う際もこの修正が有効。
