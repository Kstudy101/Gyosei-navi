# data/ads/rakuten/

`npm run ads:rakuten` が生成する楽天商品キャッシュ（カテゴリごとの JSON）。

- 静的 export サイトのため記事ページ表示時に楽天 API は呼ばない。この JSON がビルド時の唯一のデータ源。
- `data/stats/` と違い **コミット対象**（.gitignore していない）。CI の build は API を叩かないため、
  コミットされた JSON が無いカテゴリは商品広告が0件＝非表示のまま。
- 再取得: `.env.local` に `RAKUTEN_APP_ID` / `RAKUTEN_AFFILIATE_ID` を設定 →
  `npm run ads:rakuten`（または `-- --category sogyo` で1件のみ）→ 差分をコミット。
- `deploy-xserver.yml` は `paths-ignore: data/**` のため、この JSON だけの変更では自動デプロイされない。
  反映したい場合は他の変更と一緒にコミットするか、Actions を workflow_dispatch で手動実行する。
