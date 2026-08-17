# GitHub 프라이빗 리포 생성 + 최초 push (1회용)
# 사전: PowerShell 새 창에서  gh auth login  (GitHub.com / HTTPS / 브라우저 로그인) 완료
# 실행:  powershell -ExecutionPolicy Bypass -File scripts\setup-github.ps1 [-Repo gyosei-portal]
param(
  [string]$Repo = "gyosei-portal",
  [string]$Description = "行政書士ナビ・ジャーナル — 行政書士業務の総合情報メディア（Next.js 静的サイト + 一次情報収集パイプライン）"
)
$ErrorActionPreference = "Stop"
$gh = if (Get-Command gh -ErrorAction SilentlyContinue) { "gh" } else { "C:\Program Files\GitHub CLI\gh.exe" }
Set-Location (Split-Path $PSScriptRoot -Parent)

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) { Write-Error "gh 미인증. 먼저 'gh auth login' 을 실행하세요."; exit 1 }

$existing = git remote get-url origin 2>$null
if ($existing) {
  Write-Host "origin 이미 존재: $existing → push 만 수행"
} else {
  # --private / 소스는 현재 디렉토리 / 원격명 origin
  & $gh repo create $Repo --private --source=. --remote=origin --description $Description --disable-wiki
  if ($LASTEXITCODE -ne 0) { Write-Error "repo create 실패"; exit 1 }
}

git push -u origin main
if ($LASTEXITCODE -ne 0) { Write-Error "push 실패"; exit 1 }

Write-Host ""
Write-Host "완료. 다음 단계:" -ForegroundColor Green
Write-Host "  1) GitHub → Settings → Secrets and variables → Actions 에 다음 등록"
Write-Host "       XSERVER_HOST / XSERVER_USER / XSERVER_PORT / XSERVER_SSH_KEY [/ XSERVER_PASSPHRASE]"
Write-Host "     (선택) Variables: NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_CLARITY_ID"
Write-Host "  2) Settings → Environments → 'production' 생성 (deploy-xserver.yml 이 참조)"
Write-Host "  3) Actions 탭 → 'Deploy to Xserver' → Run workflow (또는 main 에 push)"
Write-Host "  4) Actions 탭 → 'Daily Monitor' → Run workflow (1회차 초기화 확인)"
& $gh repo view --web
