#!/usr/bin/env bash
# 手動デプロイ（ローカル → Xserver, SSH + rsync）
#   前提: ~/.ssh/config に Host xserver が定義済み（docs/11 §2-4）、rsync が使える環境（WSL / macOS / Linux / Git Bash+rsync）
#   使い方: bash scripts/deploy-xserver.sh [--dry-run]
#   通常は GitHub Actions（deploy-xserver.yml）に任せる。これは緊急時・検証用。
set -euo pipefail
cd "$(dirname "$0")/.."

DEPLOY_DIR="${XSERVER_DEPLOY_DIR:-~/gyosei-navi.jp/public_html}"
DRY=""; [ "${1:-}" = "--dry-run" ] && DRY="--dry-run"

echo "== build (static export) =="
npm run validate:content
npm run build
test -f out/index.html && test -f out/.htaccess

echo "== rsync → xserver:$DEPLOY_DIR $DRY =="
ssh -o BatchMode=yes xserver "mkdir -p $DEPLOY_DIR"
rsync -az --delete $DRY --itemize-changes --stats \
  --exclude '.well-known/' --exclude '.user.ini' \
  ./out/ "xserver:$DEPLOY_DIR/"

echo "== verify =="
curl -s -o /dev/null -w "https://gyosei-navi.jp/ → %{http_code}\n" https://gyosei-navi.jp/ || true
