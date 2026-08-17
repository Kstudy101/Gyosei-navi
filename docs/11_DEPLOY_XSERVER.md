# 배포 구축 — GitHub(private) → Xserver → gyosei-navi.jp

> 작성: 2026-08-17 / 상위: `docs/00_MASTER_PLAN.md` §6 (원안은 Vercel → **Xserver 정적 호스팅으로 변경**, 사용자 결정 2026-08-17)
> 아키텍처: `main` push → GitHub Actions → `next build`(output: export) → **SSH + rsync 로 Xserver public_html 차분 동기화** (FTPS 방식에서 2026-08-17 전환)
> 리포: https://github.com/Kstudy101/Gyosei-navi (private)

## 0. 왜 이 구성인가

| 항목 | 내용 |
|---|---|
| Xserver 렌탈서버는 Node.js 서버를 상시 실행할 수 없음 | → Next.js를 **정적 export**(`out/`)로 빌드해 Apache가 그대로 배신 |
| 이 사이트는 전 페이지 SSG (`generateStaticParams` + `dynamicParams=false`) | → export 가능. 빌드 검증 완료 (97파일 1.8MB) |
| 제약 | API Route(`api/lead`), ISR, 미들웨어는 Xserver에서 **동작하지 않음** → LINE 리드 수집(Phase 1)은 Xserver의 PHP 또는 외부 서버리스(Cloudflare Workers 등)로 별도 설계 |
| Vercel 대비 장점 | 도메인·서버 한 곳(일본 사업자), 비용 고정, `.jp` 관리 일원화 |

코드 측 준비 완료 항목: `next.config.ts`(export/trailingSlash), `public/.htaccess`(HTTPS·www 정규화·캐시·404), `robots/sitemap` force-static, 빈 섹션 플레이스홀더, `deploy-xserver.yml`, `site.ts` url = `https://gyosei-navi.jp`.

## 1. 설정 현황과 남은 작업

### 1-1. GitHub — ✅ 완료 (2026-08-17)
- 리포 `Kstudy101/Gyosei-navi` (private) 생성·push 완료. gh CLI 인증됨 (`gh auth setup-git` 으로 push 비대화형)
- Environment `production` 생성 완료 / Variables: `XSERVER_DEPLOY_DIR = ~/gyosei-navi.jp/public_html`

### 1-2. Secrets (Settings → Secrets and variables → Actions)
| Secret | 상태 | 값 |
|---|---|---|
| `XSERVER_HOST` | ✅ 사용자 등록 | `sv####.xserver.jp` — 원격 실행에서 접속 확인됨 |
| `XSERVER_USER` | ✅ 사용자 등록 | 서버ID |
| `XSERVER_PORT` | ✅ 사용자 등록 | `10022` |
| `XSERVER_PASSPHRASE` | ✅ 사용자 등록 | 키 패스프레이즈 (Xserver 패널 생성 키용. 패스프레이즈 없는 키면 무시됨) |
| `XSERVER_SSH_KEY` | ✅ 사용자 재등록 (2026-08-17 08:59) | Xserver 패널 생성 **RSA 비밀키** (지문 `SHA256:vedDmMmqenJZYcA+K0PqOWwXnVjz4mbPTK8Xu1FzNRs`, 패스프레이즈는 `XSERVER_PASSPHRASE`로 러너 안에서 해제) |
| `XSERVER_KNOWN_HOSTS` | ✅ Claude 등록 (2026-08-17 10:08) | `ssh-keyscan -p 10022` 출력 3종(RSA/ECDSA/ed25519) — 호스트키 고정 완료 |

**키 선택 — ✅ 해결 (2026-08-17 09:01 dry-run 성공)**: **B안 채택**. 사용자가 08:59 에 Xserver 패널 생성 키를 `XSERVER_SSH_KEY` 에 재등록 → 패널 등록 공개키와 일치 확인(지문 `vedDmM…`). Claude 생성 ed25519 키(`infra/xserver/deploy_key.pub`)는 **미사용** (비밀키는 로컬에 없음 — 재사용 불가, 참고용으로만 잔존).

> ⚠️ 10:02 실배포 실패(run 32018144397)의 원인은 키가 아니라 **`ssh-keyscan` 일시 실패 + `bash -e` 즉시 중단** (stderr 가 `/dev/null` 이라 로그 무흔적). → `XSERVER_KNOWN_HOSTS` Secret 등록 + keyscan 재시도 로직으로 해결 (2026-08-17 10:08).

### 1-3. Xserver 측
1. **SSH設定 → ON** — ✅ 활성 (dry-run 에서 포트 10022 접속·호스트키 취득 성공)
2. **公開鍵登録** — ✅ 완료 (2026-08-17 09:01 run #32013181975: `ssh ok … rsync=/usr/bin/rsync`, dry-run 차분 = 생성 153 / 삭제 1 / 전송 95파일)
3. **ドメイン設定追加** `gyosei-navi.jp` — ✅ 완료 (HTTPS 200 확인)
4. gyosei-navi.jp 취득·SSL — ✅ 완료 (2026-08-17 라이브 확인)

### 1-4. 첫 배포 — ✅ 완료 (2026-08-17 10:10, run 32018783875)
93파일 전송(1.86MB), `https://gyosei-navi.jp/ → 200`. 도메인·무료 SSL 도 반영 확인.
이후 `main` 에 push할 때마다 자동 배포 (docs/prompts/data 만 바뀐 커밋은 스킵). Secrets 미완이면 빌드만 하고 배포는 스킵(실패 아님).

### 1-5. 배포 후 1회
- Google Search Console 등록 (DNS TXT 또는 HTML 파일 — `public/` 에 두면 배포됨) → `https://gyosei-navi.jp/sitemap.xml` 제출
- GA4 프로퍼티 생성 → 측정 ID를 Variables 에 넣고 재배포
- Actions → **Daily Monitor** → Run workflow 1회 (`.cache` 초기화)

## 2. 운용 규칙

### 2-1. 무엇이 배포되는가
- `out/` 전체 = 정적 HTML/CSS/JS + `public/`(.htaccess, og, downloads 등)
- **`status: published` 기사만** 포함 (draft/review는 빌드에서 제외, 플레이스홀더 404만 생성)
- `rsync -az --delete` 차분 동기화: 바뀐 파일만 전송, **사라진 페이지는 서버에서도 삭제**. `.well-known/`·`.user.ini` 는 보호(제외)
- 실행마다 `--itemize-changes --stats` 로 무엇이 바뀌었는지 로그에 남음

### 2-2. 안전장치
- `StrictHostKeyChecking yes` — `XSERVER_KNOWN_HOSTS` 를 등록하면 호스트키 고정 (미등록 시 실행마다 keyscan)
- 비밀키는 러너의 `~/.ssh/deploy_key` 에만 잠시 존재. 패스프레이즈 키는 `ssh-keygen -p` 로 러너 안에서만 해제
- Environment `production` 에 required reviewers 를 걸면 배포 전 승인 게이트

### 2-3. 롤백
Actions 에서 이전 성공 커밋의 워크플로를 **Re-run** 하거나, `git revert` 후 push. 서버에는 항상 마지막 빌드만 있으므로 Git 이 롤백의 원천.

### 2-4. 로컬에서 수동 배포 / 미리보기
```bash
# ~/.ssh/config に
#   Host xserver
#     HostName sv####.xserver.jp  / User 서버ID / Port 10022
#     IdentityFile ~/.ssh/xserver_gyosei_deploy
bash scripts/deploy-xserver.sh --dry-run   # 차분만 확인
bash scripts/deploy-xserver.sh             # 실제 배포 (WSL/macOS/Linux, rsync 필요)

npm run build && npx serve out             # 로컬 미리보기 http://localhost:3000
```
※ `npm run dev` 는 export 설정과 무관하게 평소대로 동작.

## 3. 검증 체크리스트 (배포 후) — 2026-08-17 검증
- [x] `https://gyosei-navi.jp/` 200, `http://` → `https://` 301, `www.` → 裸ドメイン 301
- [x] `/about/`, `/policy/disclaimer/`, `/sitemap.xml`, `/robots.txt` 200
- [x] 없는 URL → 404 페이지 (Next 의 404.html)
- [x] 푸터 면책문·자격상태 표시 (HTML 에 免責·行政書士 확인)
- [x] `Cache-Control`: CSS `public, max-age=31536000, immutable` / HTML `max-age=600`
- [ ] Search Console 색인 요청 (§1-5 — 사용자 Google 계정 필요)

## 4. 나중에 필요해질 것
- **문의 폼 / LINE 리드**: 정적 사이트라 서버 처리는 Xserver PHP(간단 메일 폼) 또는 Cloudflare Workers/Formspree 류. `src/components/cta/` 는 그대로 두고 백엔드만 외부화
- **검색(Pagefind)**: 정적 인덱스라 export 와 궁합 좋음 — 빌드 후 `npx pagefind --site out` 를 워크플로에 추가하면 됨
- **OG 이미지**: 빌드 시 생성해 `public/og/` 에 두는 방식 (동적 OG 라우트는 export 불가)
