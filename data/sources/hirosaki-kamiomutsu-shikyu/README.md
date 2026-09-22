# 青森県弘前市 ねたきり高齢者等紙おむつ支給事業

## 対象自治体・コード

- 弘前市（青森県）総務省コード **02202**（検査数字込み022021、`regions.ts` 登録済 `hirosaki-shi`）
- `src/config/regions.ts` に `{ code: "02202", slug: "hirosaki-shi", labelJa: "弘前市", prefCode: "02" }` 登録済み（木造耐震記事作成時に追加）

## 原文アーカイブ一覧

| No | ファイル | 取得元URL | 取得日 | 取得方法 |
|---|---|---|---|---|
| 01 | `01_omutsu-shikyu.txt` | https://www.city.hirosaki.aomori.jp/kurashi/todoke/shinsei/2015-0218-1016-32.html | 2026-09-22 | `npm run source` |
| 02 | `02_otosiyori-fukushi.txt` | https://www.city.hirosaki.aomori.jp/fukushi/fukushi/otosiyorinohukusi.html | 2026-09-22 | `npm run source` |
| 03 | `03_koureisha-zaitaku.txt` | https://www.city.hirosaki.aomori.jp/fukushi/fukushi/koureisha_zaitaku.html | 2026-09-22 | `npm run source` |
| 04 | `04_guidebook-page.txt` | https://www.city.hirosaki.aomori.jp/fukushi/fukushi/koureisyakaigohokenhukusigaidobukku.html | 2026-09-22 | `npm run source` |
| 05 | `05_R8.6gaidobook.pdf` / `.txt` | https://www.city.hirosaki.aomori.jp/fukushi/fukushi/R8.6gaidobook.pdf（令和8年6月作成） | 2026-09-22 | curl直接DL + `pdftotext` |
| 06 | `06_omutsu_shinseisyo.pdf` | https://www.city.hirosaki.aomori.jp/kurashi/todoke/shinsei/omutsu_shinseisyo.pdf | 2026-09-22 | curl直接DL |
| 07 | `07_omutsu_shinseisyo_sample.pdf` | https://www.city.hirosaki.aomori.jp/kurashi/todoke/shinsei/omutsu_shinseisyo_sample.pdf | 2026-09-22 | curl直接DL |

## 確認できた主要事実（原文01・05で一次確認）

### 制度名
- ねたきり高齢者等への紙おむつ支給（ガイドブック表記: ねたきり高齢者等紙おむつ支給事業）

### 対象（原文01・05一致）
在宅（自宅）で生活し、次のいずれかに該当する市民:
1. 満65歳以上の寝たきりの方
2. 満65歳以上で要介護4・5に相当する認知症により常時失禁状態にある方
3. 身体障害者手帳1・2級の交付を受けている寝たきりの方
4. 療育（愛護）手帳Aの交付を受けている寝たきりの方

### 対象外（原文01）
- 住民税課税世帯
- 生活保護受給世帯
- 施設入所者
- 長期入院者

※ガイドブック（原文05）は課税世帯・生活保護受給世帯を除外と明記。施設入所・長期入院の除外は申請ページ（原文01）に明記。

### 支給内容（原文01・05一致）
- 年3回（4月・8月・12月）自宅へ業者配送（配送先は弘前市内に限る）
- 品目は次から**一つ**を選択: テープ止めタイプ紙おむつM / L / 尿とりパッド
- 1回あたり枚数: テープ止めタイプ **134枚**、尿とりパッド **320枚**

### 申請（原文01）
- 申請時期: 随時
- 申請者: 親族（主に介護している方）。代理提出は支給対象者の身体状況がわかる人
- 方法: 窓口へ申請書持参（郵送可否は原文に明記なし → 未確認）
- 添付: 身体障害者手帳 / 療育（愛護）手帳A（該当する場合）
- 手数料: 無料
- 窓口: 介護福祉課、岩木・相馬総合支所 民生課
- 問い合わせ: 介護福祉課 高齢福祉係 0172-40-7114

### 制度類型
現物支給型（現金助成ではなく紙おむつ・パッドそのものを配送）

## 同ページ周辺で確認した関連制度（本記事の対象外・別トピック候補）

| 制度 | 概要（一次確認） | 根拠 |
|---|---|---|
| 家族介護慰労金支給事業 | 年額100,000円。介護者・被介護者とも市民税非課税等条件あり | 原文05 p.29 |
| 緊急通報システム事業 | システム・ペンダント貸与。利用料 非課税世帯1,100円/月（税込）等 | 原文05 p.28、申請ページは税別表記 |
| はり・きゅう・マッサージ施術料助成 | 受療券1枚500円×5枚（年度内1回） | 原文05・申請ページ |

## 確認されていない事項（unresearched）

- 申請の郵送可否（原文01は「直接受付窓口へ申請書をご持参ください」とあるが、郵送不可の明記はない）
- 「寝たきり」の判定基準の詳細（寝具丸洗い事業では障害高齢者の日常生活自立度ランクB以上とあるが、紙おむつ事業の原文には同基準の明記なし）
- 支給品のブランド・具体的商品名・サイズ寸法の詳細
- 年度途中申請時の初回配送タイミング（4・8・12月以外の扱い）
- 家族介護慰労金・緊急通報の詳細記事化は未実施（別バッチ候補）
