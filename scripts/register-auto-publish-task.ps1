# =====================================================================
# 자동 발행 스케줄 등록 (1회 실행용) — docs/16
#
#   사용자가 PowerShell 에서 직접 실행한다:
#     powershell -ExecutionPolicy Bypass -File scripts\register-auto-publish-task.ps1
#
#   등록 내용: 작업 「GyoseiNavi-AutoPublish」
#     - 매일 08:03 / 13:07 / 19:11 에 scripts\auto-publish.ps1 실행
#     - 꺼져 있던 회차는 부팅 후 보충 (StartWhenAvailable)
#     - 실행 상한 1시간, 겹치면 새 인스턴스 무시
#   해제:  Unregister-ScheduledTask -TaskName GyoseiNavi-AutoPublish -Confirm:$false
#   일시정지: Disable-ScheduledTask -TaskName GyoseiNavi-AutoPublish
# =====================================================================
$ErrorActionPreference = "Stop"
$name = "GyoseiNavi-AutoPublish"
$repo = Split-Path -Parent $PSScriptRoot   # scripts\ 의 부모 = 리포 루트

try { Unregister-ScheduledTask -TaskName $name -Confirm:$false -EA Stop; Write-Host "기존 작업을 제거하고 재등록합니다." } catch {}

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$repo\scripts\auto-publish.ps1`"" `
  -WorkingDirectory $repo
$triggers = @(
  New-ScheduledTaskTrigger -Daily -At 08:03
  New-ScheduledTaskTrigger -Daily -At 13:07
  New-ScheduledTaskTrigger -Daily -At 19:11
)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1) -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $name -Action $action -Trigger $triggers -Settings $settings `
  -Description "行政書士ナビ 자동 기사 발행 (docs/16_AUTO_PUBLISH_PIPELINE.md). 매일 3회 헤드리스 Claude 세션." | Out-Null

Write-Host "등록 완료: $name"
Get-ScheduledTask -TaskName $name | Select-Object TaskName, State | Format-Table -AutoSize
Write-Host "다음 실행: $((Get-ScheduledTaskInfo -TaskName $name).NextRunTime)"
Write-Host ""
Write-Host "지금 1회 시험 실행하려면:  Start-ScheduledTask -TaskName $name"
Write-Host "결과 알림 구독:            https://ntfy.sh/gyosei-navi-alert-7c9682"
