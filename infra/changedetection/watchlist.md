# changedetection.io 초기 감시 URL 목록

> `prompts/monitor/sources.yaml`의 P0/P1 + JS/PDF 전용. Tag는 sources.yaml의 어휘와 동일하게.
> ★ = 코드 파이프라인이 못 보는 것 (changedetection 전담)

| Tag | 이름 | URL | Fetch | CSS Filter | 비고 |
|---|---|---|---|---|---|
| P0 nyukan | 出入国在留管理庁 トップ（新着情報） | https://www.moj.go.jp/isa/ | Basic | `#contentsArea` | |
| P0 nyukan | 永住許可に関するガイドライン | https://www.moj.go.jp/isa/applications/resources/nyukan_nyukan50.html | Basic | `#contentsArea` | 2026-08-04 改定案公表 |
| P0 nyukan | 永住許可申請（入管法第22条） | https://www.moj.go.jp/isa/applications/procedures/eizyuu_00001.html | Basic | `#contentsArea` | |
| ★P0 nyukan | 永住許可ガイドライン改定案 PDF（パブコメ本文） | https://public-comment.e-gov.go.jp/pcm/download?seqNo=0000318904 | Basic (PDF→text) | — | 案件315000140 |
| ★P0 nyukan | パブコメ案件詳細 315000140 | https://public-comment.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id=315000140&Mode=0 | Basic | `.egovui-detail` 등 (要確認) | 締切 2026-09-04 0:00 → 結果公示の検知 |
| P0 | e-Gov パブコメ RSS | https://public-comment.e-gov.go.jp/rss/pcm_list.xml | Basic | — | 코드 파이프라인과 중복 (백업) |
| P1 seido | 総務省 行政書士制度 | https://www.soumu.go.jp/main_sosiki/jichi_gyousei/gyouseishoshi/index.html | Basic | 本文領域 (要確認) | |
| P1 seido | 総務省 行政書士制度 通知・事務連絡 | https://www.soumu.go.jp/main_sosiki/jichi_gyousei/gyouseishoshi/02gyosei07_04000176.html | Basic | 〃 | |
| P1 seido | 日本行政書士会連合会 お知らせ | https://www.gyosei.or.jp/ | Basic | 本文領域 (要確認) | |
| P2 dx | デジタル庁 政策 | https://www.digital.go.jp/policies | Basic | `main` | |
| ★P3 hojokin | jGrants 補助金ポータル | https://www.jgrants-portal.go.jp/ | **Playwright** | `main` (要確認) | Angular SPA — 정적 취득 불가 |
| ★P0 nyukan | 育成就労制度 専用ページ | (URL 未確定 — 入管庁サイト内で確定後追加) | Basic | | 2027-04 施行 |

등록 후 각 항목의 첫 Diff를 보고 CSS Filter / Ignore text를 조정할 것.
