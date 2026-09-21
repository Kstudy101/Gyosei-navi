# 越谷市 ゼロカーボン推進補助金（家庭用） — 原文根拠表

> 취득일: 2026-09-21 / 용도: `energy` 카테고리 기사
> 소관: 越谷市 環境経済部 環境政策課（第三庁舎4階、電話048-963-9183、ファクス048-963-9175）

## 制度名
令和8年度 越谷市ゼロカーボン推進補助金（家庭用を主対象。事業者用は同ページで併記）

## 原文ファイル
| # | ファイル | 取得元URL | 取得方法 |
|---|---|---|---|
| 01 | `01_zerocarbon.txt` | https://www.city.koshigaya.saitama.jp/kurashi_shisei/kurashi/kankyo/kankyoseisaku/zerocarbon.html | npm run source |
| 02 | `02_kateiyou_panfu.pdf` | https://www.city.koshigaya.saitama.jp/kurashi_shisei/kurashi/kankyo/kankyoseisaku/files/r8kateiyou_panfu.pdf | PDF直接DL（gitignore対象・ローカルのみ） |
| 03 | `03_kateiyou_youkou.pdf` | https://www.city.koshigaya.saitama.jp/kurashi_shisei/kurashi/kankyo/kankyoseisaku/files/kateiyou_youkou.pdf | PDF直接DL（gitignore対象・ローカルのみ） |

## 確認できた事実（原文根拠あり）
- 制度趣旨: 地球温暖化対策・ゼロカーボンシティ実現のため再エネ設備等導入に補助金（01 L25）
- 前期受付: 令和8年5月21日〜6月5日（受付終了）。抽選は6月10日実施、交付決定通知は6月19日付発送予定（01 L37-51）
- 後期受付: 令和8年10月5日〜10月16日（土日祝除く8:30〜17:15）。電子申請は10月5日公開予定（01 L53-75）
- 設置・納車期限: 令和9年3月15日まで（01 L84, 01 L181）
- 【家庭用】対象者: 市内居住者または申請年度内転入予定者、マンション管理組合。市税等滞納なし。交付決定後に購入・着手（01 L80-90）
- 太陽光: 2万円/kW（小数点第3位以下切捨て）。住宅上限8万円（4kW）、市内事業者契約で上限10万円（5kW）。マンション上限20万円（10kW）。最大出力10kW未満（01 L98-111、02パンフ）
- 定置用リチウムイオン蓄電池: 1件5万円。ポータブルは対象外（01 L115-117）
- V2H: 1件5万円（01 L119-121）
- EV・PHEV: 1件5万円。外部給電機能必須（01 L123-125）
- ZEH: 1件20万円。Nearly ZEH・ZEH Oriented除外。太陽光との併用申請不可（01 L127-131）
- 交付条件: 未使用新品、交付決定日以後の購入・着工、同一設備等は1回限度（01 L173-183）
- 予算超過時は抽選（01 L59）
- 令和8年度家庭用予算（パンフ）: 前期910万円・後期390万円・合計1,300万円（02）
- 受付: 環境政策課窓口 / 郵送 / 電子申請（01 L63-75）

## 確認できなかったこと
- 後期の実際の電子申請URL（ページ上は「令和8年10月5日に公開予定」のみ）
- 前期抽選の個別当選番号詳細（一覧PDFはあるが、本記事では制度概要に留め個別結果は扱わない）
- 国・県補助金との併用可否の明示条項（要綱・本ページに併用可否の直接記載なし → 未確認）
- 事業者用の災害時電力無償提供の具体的な運用細則（本記事は家庭用中心）

## 関連で見つけたが本記事では採用しなかった制度
- 越谷市省エネ家電買換促進補助金（令和8年度）: https://www.city.koshigaya.saitama.jp/kurashi_shisei/kurashi/kankyo/kankyoseisaku/kaden2026.html — 2026-04-22予算超過で受付終了。scout原文は `data/sources/_scout-koshigaya-energy/01_kaden2026.txt`
