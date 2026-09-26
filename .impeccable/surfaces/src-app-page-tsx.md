---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/components/layout/Header.tsx","src/components/layout/Footer.tsx"]
---

# Surface brief: ホーム（src/app/page.tsx）

- Scope: トップページ本体と共有シェル（Header/Footer）のトーン合わせ。記事ページは対象外。
- Visitor mode: Operate（生活者が自分の自治体を選び、制度を探し始める）。
- Audience / job: 日本在住の生活者個人・世帯。スマートフォンから「うちの市で使える制度は何が・いつまで」を確かめる。
- First action: 地域を選ぶ（2026-09-26 ユーザー確認）。
- Proof / content: 全記事 frontmatter から算出した掲載件数、締切、更新日。捏造する数値・声はない。
- Constraints: 静的サイト（JS なしで成立）、ダークモード対応、既存ナビ構造維持、広告は記事ページのみ。
- Pinned direction: 「情報誌のような」レイアウト、参照トーン「自治体広報誌・くらしの便利帳」（ユーザー指定）。
  impeccable concept-seed（key 589e7b54, mode operate, ASSIGNED INDEX 7）は実行済みだが、ユーザーの
  ピン留めが常に優先するため、割り当てではなくピン留め世界を採用した。
- Memorable moment: 地域索引のリーダー罫が hover/フォーカスで紺の実線になり、件数が内訳に開く。
- Unresolved: 監修者表記なし（PRODUCT.md）。写真素材なし。

## Direction contract

THESIS: ホームは「制度を売り込むランディング」ではなく「うちの市の制度を引く便利帳の目次・索引」。同一サイズのカードを並べる分類の既定を拒み、罫線とリーダー罫で組んだ一覧に置き換える。

OWN-WORLD: 白い紙地に墨の文字、1px の灰罫と 2px の紺罫（brand-800）で区画。朱（shu-600）は締切間近・速報だけ。角丸・影・アイコンタイルなし。BIZ UDPGothic、等幅数字。全内容を消しても罫と目次の骨格で便利帳と分かる。

STORY: 訪問者は「自分の県」を索引で見つけ、件数で厚みを知り、県ページへ進む。戻ってくれば締切と速報が日付順に並んでいる。信頼は出典と更新日で担保される。

FIRST VIEWPORT: 題字＋発行情報（更新日・掲載件数）の一行、その直下に8地方×47都道府県の索引（モバイル2列・デスクトップ4列）。主要動線＝索引の県リンク。紺のヒーロー箱は撤去。

FORM: くらしの便利帳（ユーザーのピン留め、順位1）。seed key 589e7b54（割り当て index 7 はピン留めに劣後）。

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
