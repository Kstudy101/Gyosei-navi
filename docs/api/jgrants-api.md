# jGrants 公開 API — 実測メモ (TASK-08)

> 調査日: 2026-08-17 / 実装: `src/lib/sources/jgrants.ts` + `scripts/watch-subsidies.ts`
> 公式ドキュメント: https://developers.digital.go.jp/documents/jgrants/api/
> 認証: **不要**。レートリミット: **文書に記載なし** → `http.ts` の全域1秒間隔で保護

## エンドポイント

### v1 一覧

```
GET https://api.jgrants-portal.go.jp/exp/v1/public/subsidies
    ?keyword={2文字以上・必須}&sort=created_date&order=DESC&acceptance=1
```

- `keyword` は**必須**。1文字は 0 件を返す（エラーにならない点に注意）
- **全件を返すパラメータは存在しない** → 広域キーワードの和集合で近似する
  - 実測 (2026-08-17): 事業229 / 補助金212 / 支援190 / 地域83 / 公募73 / 助成71 / 経営44 → **和集合 296件**
- `acceptance=1` で募集中のみ
- `sort`: `created_date` | `acceptance_start_datetime` | `acceptance_end_datetime` / `order`: `ASC` | `DESC`

実測レスポンス:

```jsonc
{
  "metadata": { "type": "https://developers.digital.go.jp/documents/jgrants/api/",
                "resultset": { "count": 212 } },
  "result": [
    {
      "id": "a0WJ200000CDe5zMAD",          // Salesforce 形式 ID。フロント URL に転用可
      "name": "S-00009699",                 // 管理番号
      "title": "【わかやま産業振興財団 】令和８年度_中小企業等海外展開支援…",
      "acceptance_start_datetime": "2026-08-14T00:45:00.000Z",
      "acceptance_end_datetime": "2026-08-24T08:00:00.000Z",   // null あり
      "institution_name": null,             // null が多い（詳細側にも無いことがある）
      "subsidy_max_limit": 3000000,         // 円。null あり
      "target_area_search": "和歌山県",     // 「全国」あり・null あり
      "target_number_of_employees": "300名以下"
    }
  ]
}
```

- フロント詳細ページ: `https://www.jgrants-portal.go.jp/subsidy/{id}`

### v2 詳細

```
GET https://api.jgrants-portal.go.jp/exp/v2/public/subsidies/id/{id}
```

`result` は**要素1の配列**。主なフィールド（実測）:

| フィールド | 型 | 備考 |
|---|---|---|
| `subsidy_catch_phrase` / `detail` | string? | 概要文 |
| `use_purpose` / `industry` | string? | 「 / 」区切りの複数値文字列 |
| `subsidy_rate` | string? | 例「1/2以内」 |
| `granttype` | string \| null | **null が多い** |
| `workflow` | array \| null | 募集回単位。`{ id, target_area_search, target_area_detail, … }` |
| `application_guidelines` `outline_of_grant` `application_form` | array | `{ name, data }` — **⚠ `data` は base64 のファイル本体（docx 等・巨大）。保存・ログ出力しないこと** |
| `front_subsidy_detail_page_url` | string? | フロント URL |

## 監視スクリプトの設計

- 状態: `.cache/subsidies-seen.json`（id → title/deadline/firstSeenAt）
- 初回実行はベースライン記録のみ（既存296件を新着として通知しない — pubcomment と同方針）
- 新規は締切昇順で報告、**D-7 以内は ★緊急**
- 一部キーワードの取得失敗は警告（次回実行で回収）、全滅・0件は明確にエラー
- CI: `daily-monitor.yml` に編入（`--github-issue` で新規時のみ Issue、`priority:P2`）

## 未確認・注意

- デジタル庁公式 MCP サーバ（`digital-go-jp/jgrants-mcp-server`, Python）は本リポ（TS/npm）に組み込まず API 直叩きを採用（docs/10 TASK-08 の想定どおり）
- `institution_name` が一覧・詳細とも null の案件が多い → レポートでは「不明」表示
- 和集合キーワードは将来の取りこぼしがあり得る。`metadata.resultset.count` と和集合サイズの乖離が大きくなったらキーワードを追加すること
