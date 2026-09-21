# tsu-shugaku-enjo — 原文根拠

- 地域: 三重県津市（regionCode `24201` / slug `tsu`）
- 制度: 就学に必要な費用の援助（就学援助）／新入学用品準備金の入学前支給
- カテゴリ: kyoiku
- 取得日: 2026-09-21（HTML）／2026-09-22（PDF再確認）

## 原文一覧

| # | ファイル | URL | 備考 |
|---|---|---|---|
| 01 | `01_shugaku-enjo.txt` | https://www.info.city.tsu.mie.jp/kosodate_kyouiku/kyouikuiinkai/1002745/1009845/1011005.html | 就学援助本頁（更新日2026年1月30日）。`npm run source` |
| 02 | `02_shinnyugaku-junbikin.txt` | https://www.info.city.tsu.mie.jp/kosodate_kyouiku/kyouikuiinkai/1002745/1009845/1011006.html | 新入学用品準備金の入学前支給（更新日2026年1月7日）。`npm run source` |
| 03 | `03_shugaku-enjo-kosodate.txt` | https://www.info.city.tsu.mie.jp/kosodateouen/shien_josei_enjo/1002876/1002883.html | 子育て応援サイト側の同内容ミラー。`npm run source` |
| 04 | `04_shugaku-index.txt` | https://www.info.city.tsu.mie.jp/kosodate_kyouiku/kyouikuiinkai/1002745/1009845/index.html | 就学・通学区域・転学インデックス。`npm run source` |
| 05 | `05_r8_shinnyugaku_junbikin.pdf` / `.txt` | https://www.info.city.tsu.mie.jp/_res/projects/default_project/_page_/001/002/884/r8sinnnyuugakujunnbikin.pdf | 令和8年度・新小学1年生向け案内PDF（直接DL・pypdf抽出） |
| 06 | `06_r8_shinseisho.pdf` / `.txt` | https://www.info.city.tsu.mie.jp/_res/projects/default_project/_page_/001/002/884/r8sinnyuugaku.pdf | 令和8年度申請書PDF |
| 07 | `07_r8_kinyurei.pdf` / `.txt` | https://www.info.city.tsu.mie.jp/_res/projects/default_project/_page_/001/002/884/r8kinyuurei.pdf | 記入例PDF |

## 確認済みの事実（原文一致）

| 事実 | 根拠 |
|---|---|
| 制度名「就学に必要な費用の援助」 | 01 |
| 対象: 津市内在住で市立・国立の小・中・義務教育学校及び三重県立みえ四葉ヶ咲中学校（学びの多様化学校コースのみ）在籍児童生徒の保護者 | 01 |
| 対象事由: 生活保護停止・廃止／市民税非課税／児童扶養手当受給（児童手当は対象外）／その他経済的困窮（所得審査） | 01 / 05 |
| 所得目安: 2人約200万／3人約260万／4人約310万／5人約330万（目安・世帯構成で異なる） | 01 / 05 |
| 援助費目: 学用品・通学用品費／給食費（実費）／新入学用品費等／新入学用品準備金／校外活動費／修学旅行費（実費）／医療費（学校病）／オンライン学習通信費 | 01 / 05 |
| 新入学用品準備金（入学前）額: 小学校・義務教育学校前期 57,060円／中学校・義務教育学校後期 63,000円 | 02（中学額）／05（小学額57,060円明記） |
| 入学前支給日: 令和8年3月9日（月）予定・保護者口座振込 | 02 / 05 |
| 入学前支給締切: 令和7年12月23日（火） | 02 / 05 |
| 締切後でも令和8年4月10日までに就学援助を申請し4月認定なら入学後に同額の新入学用品費を支給 | 05 |
| 就学援助申請は令和8年4月10日以降も随時受付 | 05 |
| 生活保護受給中は就学援助申請不要（生活保護費で対応）。受給世帯への就学援助は医療費と修学旅行費のみ | 05 |
| 問い合わせ: 学校教育課学務担当 059-229-3245／〒514-0035 津市西丸之内37番8号 | 01 / 02 / 05 |

## 確認されていないこと / 注意

- 学用品・通学用品費・校外活動費・オンライン学習通信費の円単価は公式HTML・当該PDFに「教育委員会が定める額」としかなく未掲載。記事では金額を創作しない。
- 新入学用品準備金の入学前支給の申請締切（令和7年12月23日）は経過済み。ただし本体の就学援助は随時申請可で、4月10日までの申請＋4月認定なら入学後に同額支給あり（05）。
- PDF（05）は新小学1年生向け案内で中学額の記載なし。中学63,000円はHTML（02）のみ。
- 国立・県立学校は援助費目が一部異なる旨が01にあり、詳細は問い合わせ扱い。
- 別制度「ひとり親家庭・低所得子育て世帯の児童に対する学習支援（無償）」は本記事の主対象外（現金給付型の就学援助ではない）。

## Verifier

- 判定: **PASS**（2026-09-22）
- 理由: `npm run source` によるHTML原文＋公式PDF直接DLがあり、記事に使う所得目安・支給額・締切・随時受付・窓口は原文と一致。未掲載の円単価は「未確認」扱い。
