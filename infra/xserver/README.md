# Xserver SSH デプロイ鍵

> **現状 (2026-08-17)**: 実際に使われているのは **Xserver パネル生成の RSA 鍵**（B案, 指紋 `SHA256:vedDmM…`）。下記 `deploy_key.pub` は未使用（対の秘密鍵はローカルに残っておらず再利用不可）。鍵を差し替える場合のみ下記手順を使う。

- `deploy_key.pub` — GitHub Actions が Xserver へ rsync する際の **公開鍵**（2026-08-17 生成, ed25519, パスフレーズ無し）
  → Xserver サーバーパネル「SSH設定 → 公開鍵登録・設定」にこの内容を貼り付ける
- 秘密鍵は **リポジトリに置かない**。GitHub Secret `XSERVER_SSH_KEY` とローカル `~/.ssh/xserver_gyosei_deploy` のみ
- 鍵を差し替える場合: `ssh-keygen -t ed25519 -N "" -C github-actions-deploy@gyosei-navi.jp -f ~/.ssh/xserver_gyosei_deploy`
  → 公開鍵をここと Xserver に、秘密鍵を `gh secret set XSERVER_SSH_KEY < ~/.ssh/xserver_gyosei_deploy` で更新
- 手順全体: `docs/11_DEPLOY_XSERVER.md`
