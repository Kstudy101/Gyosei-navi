# 배포 구축 — GitHub(private) → Xserver → gyosei-navi.jp

> 작성: 2026-08-17 / 상위: `docs/00_MASTER_PLAN.md` §6 (원안은 Vercel → **Xserver 정적 호스팅으로 변경**, 사용자 결정 2026-08-17)
> 아키텍처: `main` push → GitHub Actions → `next build`(output: export) → **FTPS로 Xserver public_html 동기화**

## 0. 왜 이 구성인가

| 항목 | 내용 |
|---|---|
| Xserver 렌탈서버는 Node.js 서버를 상시 실행할 수 없음 | → Next.js를 **정적 export**(`out/`)로 빌드해 Apache가 그대로 배신 |
| 이 사이트는 전 페이지 SSG (`generateStaticParams` + `dynamicParams=false`) | → export 가능. 빌드 검증 완료 (97파일 1.8MB) |
| 제약 | API Route(`api/lead`), ISR, 미들웨어는 Xserver에서 **동작하지 않음** → LINE 리드 수집(Phase 1)은 Xserver의 PHP 또는 외부 서버리스(Cloudflare Workers 등)로 별도 설계 |
| Vercel 대비 장점 | 도메인·서버 한 곳(일본 사업자), 비용 고정, `.jp` 관리 일원화 |

코드 측 준비 완료 항목: `next.config.ts`(export/trailingSlash), `public/.htaccess`(HTTPS·www 정규화·캐시·404), `robots/sitemap` force-static, 빈 섹션 플레이스홀더, `deploy-xserver.yml`, `site.ts` url = `https://gyosei-navi.jp`.

## 1. 사용자가 해야 하는 것 (계정 작업 — 순서대로)

### 1-1. GitHub 프라이빗 리포 + 최초 push (5분)
```powershell
# 새 PowerShell 창
gh auth login          # GitHub.com → HTTPS → Login with a web browser
cd "c:\Users\zxasw\행정서사 정보지"
powershell -ExecutionPolicy Bypass -File scripts\setup-github.ps1
```
→ `gyosei-portal` 프라이빗 리포 생성 + `main` push + 브라우저로 리포 열림.
(gh CLI는 winget으로 설치됨 v2.97. 새 창에서 `gh`가 안 잡히면 `"C:\Program Files\GitHub CLI\gh.exe"`)

### 1-2. Xserver 계약 + 도메인 (도메인은 아직 미취득 — 2026-08-17 DNS 부재 확인)
1. **Xserver 레ンタルサーバー** 계약 (スタンダード로 충분). 서버 ID `sv####` 와 서버 번호(호스트 `sv####.xserver.jp`) 확인
2. **gyosei-navi.jp 취득**: Xserver Domain(Xserverアカウント → ドメイン取得)에서 취득하면 네임서버가 자동으로 `ns1〜ns5.xserver.jp` → DNS 설정 불필요.
   - 다른 레지스트라(お名前.com 등)에서 취득한 경우: 네임서버를 `ns1.xserver.jp` … `ns5.xserver.jp` 로 변경 (반영 최대 24〜72h)
3. **サーバーパネル → ドメイン設定 → ドメイン設定追加** 에 `gyosei-navi.jp` 추가
   - 「無料独自SSLを利用する」 체크 (Let's Encrypt), 「Xアクセラレータ」 ON 권장
   - 추가 후 서버에 `/gyosei-navi.jp/public_html/` 디렉터리가 자동 생성됨 (초기 index.html 이 들어있어도 배포 시 덮어씀)
4. **SSL 설정** → 반영 확인 (도메인 DNS 반영 후 수십 분). 그 뒤 `https://gyosei-navi.jp` 로 접근 가능
5. **FTP 계정**: サーバーパネル → FTPアカウント設定 → 도메인 선택. 기본은 서버 계정(호스트 `sv####.xserver.jp` / 사용자 = 서버ID / 비밀번호 = 서버 패스워드). **배포 전용 FTP 서브계정**을 만들어 접속 디렉터리를 `/gyosei-navi.jp/public_html/` 로 제한하는 것을 권장 (유출 시 피해 최소화)
   - 그 경우 워크플로의 `server-dir` 를 `/` 로 바꿔야 함 (서브계정은 해당 디렉터리가 루트가 됨) — 아래 2-2 참조

### 1-3. GitHub Secrets / Variables / Environment (3분)
리포 → Settings →
- **Secrets and variables → Actions → New repository secret**
  - `XSERVER_FTP_HOST` = `sv####.xserver.jp`
  - `XSERVER_FTP_USER` = 서버ID 또는 FTP 서브계정명 (`xxxx@gyosei-navi.jp` 형식일 수 있음)
  - `XSERVER_FTP_PASSWORD`
- **Variables** (선택, 계측): `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_CLARITY_ID`
- **Environments → New environment → `production`** (워크플로가 `environment: production` 참조. 여기서 required reviewers를 걸면 배포 전 승인 게이트도 가능)

### 1-4. 첫 배포
Actions → **Deploy to Xserver** → Run workflow. 로그 마지막에 `https://gyosei-navi.jp/ → 200` 이면 성공.
이후 `main` 에 push할 때마다 자동 배포 (docs/prompts/data 만 바뀐 커밋은 스킵).

### 1-5. 배포 후 1회
- Google Search Console 등록 (DNS TXT 또는 HTML 파일 — `public/` 에 두면 배포됨) → `https://gyosei-navi.jp/sitemap.xml` 제출
- GA4 프로퍼티 생성 → 측정 ID를 Variables 에 넣고 재배포
- Actions → **Daily Monitor** → Run workflow 1회 (`.cache` 초기화)

## 2. 운용 규칙

### 2-1. 무엇이 배포되는가
- `out/` 전체 = 정적 HTML/CSS/JS + `public/`(.htaccess, og, downloads 등)
- **`status: published` 기사만** 포함 (draft/review는 빌드에서 제외, 플레이스홀더 404만 생성)
- `.ftp-deploy-sync-state.json` 이 서버에 남아 차분 동기화 (첫 회는 전체 업로드)
- 삭제된 페이지는 서버에서도 삭제됨 (`dangerous-clean-slate` 는 사용하지 않음 → 서버에 직접 올린 다른 파일은 보존)

### 2-2. FTP 서브계정을 쓸 때
`.github/workflows/deploy-xserver.yml` 의 `server-dir: /gyosei-navi.jp/public_html/` → `server-dir: /` 로 변경.

### 2-3. 롤백
Actions 에서 이전 성공 커밋의 워크플로를 **Re-run** 하거나, `git revert` 후 push. 서버에는 항상 마지막 빌드만 있으므로 Git 이 롤백의 원천.

### 2-4. 로컬에서 미리보기
```bash
npm run build          # out/ 생성
npx serve out          # http://localhost:3000 (trailingSlash 동작 확인)
```
※ `npm run dev` 는 export 설정과 무관하게 평소대로 동작.

## 3. 검증 체크리스트 (배포 후)
- [ ] `https://gyosei-navi.jp/` 200, `http://` → `https://` 301, `www.` → 裸ドメイン 301
- [ ] `/about/`, `/policy/disclaimer/`, `/sitemap.xml`, `/robots.txt` 200
- [ ] 없는 URL → 404 페이지 (Next 의 404.html)
- [ ] 푸터 면책문·자격상태 표시
- [ ] 브라우저 개발자도구 Network: JS/CSS 에 `Cache-Control: immutable`, HTML 은 10분
- [ ] Search Console 색인 요청

## 4. 나중에 필요해질 것
- **문의 폼 / LINE 리드**: 정적 사이트라 서버 처리는 Xserver PHP(간단 메일 폼) 또는 Cloudflare Workers/Formspree 류. `src/components/cta/` 는 그대로 두고 백엔드만 외부화
- **검색(Pagefind)**: 정적 인덱스라 export 와 궁합 좋음 — 빌드 후 `npx pagefind --site out` 를 워크플로에 추가하면 됨
- **OG 이미지**: 빌드 시 생성해 `public/og/` 에 두는 방식 (동적 OG 라우트는 export 불가)
