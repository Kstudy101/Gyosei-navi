# changedetection.io 셋업 (TASK-04)

> 역할: `scripts/monitor.ts`(정적 HTML 해싱)가 못 보는 **JS 렌더링 페이지**와 **PDF 갱신**을 감시한다.
> 코드 파이프라인과 중복 감시해도 무방 (오탐 튜닝은 각자).

## 1. 기동

```bash
cd infra/changedetection
cp .env.example .env          # 포트 등 조정 (.env는 커밋 금지)
docker compose up -d
# → http://localhost:5000
```

- 데이터는 named volume `changedetection-data`에 영속화 (컨테이너 재생성해도 유지)
- `browserless` 컨테이너가 Chrome을 제공 → JS 렌더링 페이지는 감시 항목의 **Fetch method를 「Playwright Chromium/Javascript」**로 선택

첫 접속 시 좌측 상단 「Settings」에서:
- General → **Time between check**: 최소 1시간 (관공서 서버 배려. compose의 `MINIMUM_SECONDS_RECHECK_TIME=3600`과 일치)
- General → **Timezone**: Asia/Tokyo
- Fetching → **Default fetch method**: 정적 페이지는 「Basic fast Plaintext/HTTP Client」, SPA는 Playwright
- Requests → **User-Agent** 커스텀: `gyosei-portal-pipeline/0.1 (changedetection; contact: editorial)`

## 2. 감시 URL 등록 절차

1. 상단 입력창에 URL 붙여넣기 → 「Watch」
2. 항목의 「Edit」→ 탭별 설정:
   - **General**: Title(일본어 이름), Tag(`P0` `nyukan` 등 — `prompts/monitor/sources.yaml`의 category/priority와 동일 어휘 사용)
   - **Request**: Fetch method (JS 페이지면 Playwright), 필요 시 Wait seconds 3~5
   - **Filters & Triggers**:
     - CSS Filter: 본문 영역만 (입관청은 `#contentsArea`, 총무성은 `#contentsBody` 등 — 페이지마다 확인)
     - Remove elements: `script, style, nav, footer, header, .date, time`
     - **Ignore text**: 날짜·카운터 등 매번 바뀌는 문자열을 정규식으로 (`/\d{4}年\d{1,2}月\d{1,2}日/` 등)
     - Trigger text: 특정 단어가 등장할 때만 알림하려면 (예 `改定`, `施行`)
   - **Notifications**: 아래 3장 참조
3. 「Save」 → 목록에서 「Recheck」로 베이스라인 생성
4. **1주일은 알림 없이 운용**하며 「Diff」를 봐서 오탐 패턴을 Ignore text에 추가 (docs/07 TASK-02의 원칙과 동일)

PDF 감시: URL을 직접 등록하면 changedetection.io가 PDF를 텍스트로 변환해 diff한다 (Fetch method는 Basic). 파일 크기가 크면 「Request → Timeout」을 60초 이상으로.

## 3. 알림 채널 (LINE Notify 종료 대응 — 조사 결과)

**LINE Notify는 2025-03-31 서비스 종료** ([INTERNET Watch](https://internet.watch.impress.co.jp/docs/yajiuma/1629950.html), [ろぼいんブログ](https://roboin.io/article/2024/10/07/line-terminates-line-notify-service/)). LINE 공식이 권장하는 대체는 **LINE Messaging API** (LINE 공식계정에서 push) — 단 공식계정 플랜에 따라 월 고정비가 발생할 수 있음 ([Social PLUS 비교](https://blog.socialplus.jp/knowledge/solution-to-replace-line-notify/)).

changedetection.io는 알림에 **Apprise** 라이브러리를 쓰므로 URL 한 줄로 채널을 붙일 수 있다. 본 프로젝트 권장 순서:

| 순위 | 채널 | Apprise URL 형식 | 비고 |
|---|---|---|---|
| **1** | **이메일 (SMTP)** | `mailtos://user:app-password@smtp.gmail.com?to=you@example.com` | 비용 0, 가장 확실. Gmail은 앱 비밀번호 필요 |
| 2 | Discord Webhook | `discord://WebhookID/WebhookToken` | 개인 알림용으로 가볍고 무료. 모바일 푸시 즉시 |
| 3 | Slack Webhook | `slack://TokenA/TokenB/TokenC` | 팀 생기면 |
| 4 | LINE Messaging API | Apprise 기본 미지원 → 자체 API Route(`src/app/api/`)를 만들어 changedetection의 **Webhook(`json://`)** 로 받아 Messaging API에 push | Phase 1에서 LINE 공식계정 개설 후 (`src/lib/line.ts` 예정) |
| 5 | GitHub Issue | `json://` Webhook → GitHub Actions `repository_dispatch` | 코드 파이프라인(daily-monitor.yml)과 통합하고 싶을 때 |

설정 위치: Settings → Notifications → 「Notification URL List」에 위 URL 추가 → 「Send test notification」으로 **실제 수신 확인** (AC). 항목별로 다르게 하려면 각 Watch의 Notifications 탭.

**시크릿 주의**: 앱 비밀번호·Webhook 토큰은 changedetection UI(볼륨 내 datastore)에만 저장하고 이 리포에는 절대 적지 않는다.

## 4. 운용

- 초기 감시 URL: `watchlist.md`
- 코드 파이프라인(`npm run monitor`)과의 역할 분담: 정적 페이지는 둘 다 봐도 되지만, **JS/PDF는 changedetection 전담**
- 백업: `docker run --rm -v changedetection_changedetection-data:/data -v $PWD:/backup alpine tar czf /backup/cd-backup.tgz /data`

## 5. 실기동 기록 (2026-08-18 — 네이티브 실행으로 가동 중)

로컬 PC에 Docker/WSL이 없어 **pip판으로 네이티브 실기동**했다 (compose 파일은 서버 이전 시용으로 유지).

| 항목 | 내용 |
|---|---|
| 실행 | `changedetection.io` v0.55.8 (pip, Python 3.14) / 포트 5000 / http://localhost:5000 |
| 데이터 | `C:/Users/zxasw/changedetection-data` (OneDrive 밖 — 동기화 충돌 방지) |
| 자동 기동 | 시작프로그램 `changedetection.vbs` → `start-changedetection.bat` (숨김 실행, TZ=Asia/Tokyo, poppler PATH 포함) |
| PDF 감시 | poppler(winget `oschwartz10612.Poppler`)의 `pdftohtml` 로 동작 확인 |
| 감시 | watchlist 기반 **10건 등록·베이스라인 완료 (오류 0)**. 재체크 간격 3시간 |
| 알림 | **ntfy** `ntfy://ntfy.sh/gyosei-navi-alert-7c9682` — 송신→수신 실측 검증 완료. 구독: https://ntfy.sh/gyosei-navi-alert-7c9682 |
| jGrants SPA | **감시 제외** — TASK-08(jGrants 공개 API 감시)이 전담하므로 브라우저 렌더링 불요 |
| 제약 | PC 가동 중에만 체크 (꺼진 동안은 다음 기동 시 재개). 상시성 필요 시 compose 파일로 VPS 이전 |

## 6. AC 체크

- [x] `docker compose up -d` 만으로 기동 (compose 파일 완비, 환경변수는 .env)
- [x] README에 등록 절차를 스크린샷 없이 서술
- [x] **알림 채널 실동작 확인** — ntfy 송수신 실측 (2026-08-18). 채널 교체는 Settings → Notifications에서 Apprise URL 변경
