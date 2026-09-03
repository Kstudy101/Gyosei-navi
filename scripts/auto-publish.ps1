# =====================================================================
# GyoseiNavi 자동 발행 래퍼 (docs/16)
# 작업 스케줄러(GyoseiNavi-AutoPublish)가 매일 3회 호출한다.
# 역할: 헤드리스 Claude Code 를 기동하고, 결과를 ntfy 로 통지한다.
# 주의: 이 파일은 ASCII-safe 하게 유지할 필요 없음(PowerShell -File 은
#       BOM 있는 UTF-8 을 읽는다). cmd 배치가 아니라 ps1 인 이유다.
# =====================================================================
$ErrorActionPreference = "Continue"
$RepoDir   = "C:\Users\zxaswe\Desktop\gyosei-navi"
$ClaudeExe = "C:\Users\zxaswe\.local\bin\claude.exe"
$NtfyTopic = "gyosei-navi-alert-7c9682"   # changedetection 과 동일 토픽 (infra/changedetection/README.md)
$TimeoutMin = 55                           # 다음 회차와 겹치지 않는 상한

# 도구 PATH (스케줄러 환경은 사용자 PATH 를 물려받지 못할 수 있다)
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;$env:Path"

Set-Location $RepoDir
$LogDir = Join-Path $RepoDir ".cache\auto-publish"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Stamp   = Get-Date -Format "yyyyMMdd-HHmm"
$LogFile = Join-Path $LogDir "run-$Stamp.log"
$ResultFile = Join-Path $LogDir "last-result.txt"
$LockFile   = Join-Path $LogDir "run.lock"

function Notify([string]$title, [string]$body) {
    try {
        # ntfy 는 헤더가 ASCII 한정이라 제목은 본문 첫 줄로 보낸다
        curl.exe -s -m 20 -H "Title: gyosei-navi auto-publish" `
            -d "[$title] $body" "https://ntfy.sh/$NtfyTopic" | Out-Null
    } catch {}
}

# ---- 이중 실행 방지 (이전 회차가 아직 도는 경우) ----
if (Test-Path $LockFile) {
    $age = (Get-Date) - (Get-Item $LockFile).LastWriteTime
    if ($age.TotalMinutes -lt $TimeoutMin) {
        Notify "SKIP" "이전 회차 실행 중 (lock ${([int]$age.TotalMinutes)}분 경과) — 이번 회차 건너뜀"
        exit 0
    }
    Remove-Item $LockFile -Force -EA SilentlyContinue   # 죽은 lock
}
New-Item -ItemType File -Path $LockFile -Force | Out-Null
if (Test-Path $ResultFile) { Remove-Item $ResultFile -Force -EA SilentlyContinue }

$Prompt = @"
당신은 行政書士ナビ・ジャーナル의 자동 발행 세션입니다.
docs/16_AUTO_PUBLISH_PIPELINE.md 를 먼저 읽고, 그 절차(§0〜§7)를 정확히 1회분 수행하세요.
대원칙: 一次情報 원문 없이 쓰지 않는다 / 게이트 실패 시 발행하지 않는다 / 마지막에 반드시 .cache/auto-publish/last-result.txt 를 남긴다.
"@

# ---- 헤드리스 실행 (타임아웃 부착) ----
"[$(Get-Date -Format o)] start" | Out-File $LogFile -Encoding utf8
$proc = Start-Process -FilePath $ClaudeExe `
    -ArgumentList @("-p", $Prompt, "--dangerously-skip-permissions") `
    -WorkingDirectory $RepoDir -NoNewWindow -PassThru `
    -RedirectStandardOutput "$LogFile.out" -RedirectStandardError "$LogFile.err"
$done = $proc.WaitForExit($TimeoutMin * 60 * 1000)
if (-not $done) {
    Stop-Process -Id $proc.Id -Force -EA SilentlyContinue
    "TIMEOUT ${TimeoutMin}분 초과로 강제 종료" | Out-File $ResultFile -Encoding utf8
}
Get-Content "$LogFile.out", "$LogFile.err" -EA SilentlyContinue | Out-File $LogFile -Append -Encoding utf8
Remove-Item "$LogFile.out", "$LogFile.err" -Force -EA SilentlyContinue
"[$(Get-Date -Format o)] exit=$($proc.ExitCode)" | Out-File $LogFile -Append -Encoding utf8

# ---- 결과 통지 ----
if (Test-Path $ResultFile) {
    $result = (Get-Content $ResultFile -Raw).Trim()
} else {
    $result = "NO-RESULT 세션이 결과 파일 없이 종료 (exit=$($proc.ExitCode)) — 로그 확인: $LogFile"
}
Notify "run-$Stamp" $result

# 30일 지난 로그 정리
Get-ChildItem $LogDir -Filter "run-*.log" -EA SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item -Force -EA SilentlyContinue

Remove-Item $LockFile -Force -EA SilentlyContinue
exit 0
