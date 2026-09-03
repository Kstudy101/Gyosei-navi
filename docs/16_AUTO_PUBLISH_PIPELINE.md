# 자동 발행 파이프라인 — 1일 3회 · 전 카테고리 로테이션 (헤드리스 세션용 런북)

> 도입: 2026-09-03 (사용자 지시). 이 문서는 **자동 실행되는 Claude Code 헤드리스 세션이 그대로 따르는 절차서**다.
> 실행 주체: Windows 작업 스케줄러 → `scripts/auto-publish.ps1` → `claude -p` (매일 08:03 / 13:07 / 19:11 JST).
> 정책 근거: docs/04 §7 의 2026-09-03 개정 (자동 발행 + 사후 검수 체제). 절대 규칙(AGENTS.md)은 전부 그대로 적용된다.

---

## 세션이 지켜야 할 대원칙 (위반 시 발행하지 말고 중단)

1. **一次情報 없이 쓰지 않는다.** 이번 기사가 인용할 원문을 `npm run source` / `npm run law` 로 실제 취득하지 못했으면 그 주제는 버리고 다른 주제로 바꾼다. 그래도 안 되면 이번 회차는 「소재 없음」으로 종료한다. **어떤 경우에도 기억에 의존한 수치·조문 인용으로 발행하지 않는다.**
2. **법 19조 선을 넘지 않는다** (docs/06). 개별 사안의 상담·판단을 유도하는 주제 금지. 일반 해설 + 「有資格者に相談」 안내가 원칙.
3. **게이트를 우회하지 않는다.** `validate:content`·`build` 실패 시 고칠 수 없으면 draft 로 남기고 푸시하지 않는다.
4. **막히면 우아하게 실패한다.** 어떤 단계든 진행 불가면 §7 형식으로 결과 파일을 남기고 종료. 다음 회차·사람이 잇는다.

## 0. 사전 점검 (실패 시 즉시 §7 로)

```bash
cd <repo> && git pull --rebase origin main     # 실패(충돌·인증) 시 중단
gh api user -q .login                           # "Kstudy101" 이 아니면 중단 (memory: gh-auth-via-stored-credential)
```

- 같은 날짜의 자동 발행이 이미 3건 있으면 (git log 오늘자 `[auto]` 커밋 수) 중단 — 이중 실행 방지.

## 1. 카테고리 결정

```bash
npm run rotate:next --silent    # 마지막 줄 = 이번 카테고리 코드
```

셔플 덱 방식이라 8회차 안에 전 카테고리가 1번씩 온다. 상태(`data/auto-rotation.json`)는 기사와 함께 커밋.

## 2. 소재 수집 (해당 카테고리에 대해, 이 우선순위로)

| 순위 | 소스 | 방법 |
|---|---|---|
| ① | 미처리 `[監視]` Issue | `gh issue list --label content-opportunity --state open` → 본문에서 이번 카테고리 검지 항목 찾기. **채택 시 해당 Issue 에 채택 코멘트** |
| ② | 官報 아카이브 | `npm run kanpo -- --search <카테고리 키워드>` (키워드는 sources.yaml 해당 카테고리 항목의 keywords·note 참조) |
| ③ | 키워드 대장 | `data/keywords.csv` 에서 해당 카테고리 `our_status=idea` 행 |
| ④ | 커버리지 갭 | 해당 카테고리 기존 기사(특히 pillar)의 미커버 하위 주제 — 기존 기사 목록을 읽고 판단 |

**주제 확정 조건** (전부 충족해야 진행):
- 기존 기사와 비중복 — `grep -ril "<주제어>" content/` 로 확인, slug 중복 불가
- 인용할 一次情報 URL 이 특정돼 있고 취득 가능할 것
- 검색 수요가 상정될 것 (③의 키워드이거나, 제도 변경·마감 등 시의성)
- 채택한 키워드는 `keywords.csv` 의 `our_status` 를 `drafted` 로, `target_slug` 를 기입

## 3. 원문 취득 (절대규칙 5·7)

```bash
npm run source -- --url <URL> --out data/sources/<topic>/01_<이름>.txt   # HTML
npm run law -- --law "<법령명>" --article <조> --legal-basis              # 법령 조문
# PDF: curl -o 후 같은 셸에서 pdftotext (docs/14 §2 와 동일 — PC 자동 암호화 대책)
```

`data/sources/<topic>/README.md` 에 취득일·원본 URL 기록. **수치·요건·기한은 여기서 취득한 원문에서만 인용한다.**

## 4. 집필 (docs/04 규격 전부 적용)

- `npm run new:article` 또는 `content/_TEMPLATE.mdx` 기반, 배치는 `content/guide/<category>/<slug>.mdx`
- 타이틀 32자 이내 `主軸KW｜差別化·연호` / description 50〜160자 결론 선행 / §4.3 본문 골격 / FAQ 3건 이상 / 완결 정의문
- `legalBasis` — 취득한 원문 전건, `accessedAt` 오늘 날짜
- `relatedSlugs` 3〜5건 (실재 slug 만) / `noticeLevel` 정확히 (개정 예정 제도면 scheduled 등)
- 문체는 docs/04 §3 (한국어 화자 부자연스러움 자가 체크 포함)
- 내부 링크: Cluster→Pillar 상단·말미, 앵커는 설명형 (§4.5)

## 5. 검증 게이트 (순서대로, 실패 시 수정 → 그래도 실패면 §7 실패 경로)

```bash
npm run validate:content   # zod 강제 (legalBasis 등)
npm run og                 # 신규 기사 OG 이미지 생성 (없는 것만 생성됨)
npx tsc --noEmit           # 코드 변경이 있을 때
npm run build              # 최종 게이트 (CI 와 동일)
```

## 6. 발행 (커밋·푸시·배포 확인)

```bash
git add <기사·sources·keywords.csv·auto-rotation.json·public/og>
git commit  # 제목: "[auto] <category>: <기사 타이틀> 발행" / 본문에 소재 출처(①〜④ 어느 경로)와 원문 대조 내역
git push origin main       # → CI + Deploy to Xserver 자동
gh run list --limit 2      # 트리거 확인 후 gh run watch 로 Deploy success 까지 확인
curl -s -o /dev/null -w "%{http_code}" https://gyosei-navi.jp/guide/<category>/<slug>/   # 200 확인
```

## 7. 결과 기록 (성공·실패 공통 — 반드시 마지막에 수행)

`.cache/auto-publish/last-result.txt` 에 **1행**으로 기록 (래퍼가 이 내용을 ntfy 로 통지한다):

```
OK <category> <slug> deploy=success        # 성공
SKIP <category> 소재 없음: <한 줄 사유>     # 발행할 것이 없던 정상 종료
FAIL <category> <단계>: <한 줄 사유>        # 실패 (draft 커밋만 하고 push 안 함)
```

실패 시 추가로: 작업물은 `status: "draft"` 로 로컬 커밋(푸시 금지)하고, 커밋 메시지에 `[auto-draft]` 접두사. 사람이 검수 후 발행한다.

---

## 운용 (사람용)

| 항목 | 내용 |
|---|---|
| **최초 등록 (사람이 1회)** | `powershell -ExecutionPolicy Bypass -File scripts\register-auto-publish-task.ps1` — 스케줄 작업 등록은 시스템 변경이라 자동화하지 않고 운영자가 직접 실행한다 |
| 스케줄 | 작업 스케줄러 작업 `GyoseiNavi-AutoPublish` — 매일 08:03 / 13:07 / 19:11 (PC 켜져 있고 로그인 상태여야 함. 꺼져 있던 회차는 부팅 후 보충 실행) |
| 알림 | 매 회차 결과가 ntfy `gyosei-navi-alert-7c9682` 로 푸시 (changedetection 과 동일 토픽) |
| 로그 | `.cache/auto-publish/run-*.log` (로컬 전용, gitignore) |
| 일시 중지 | `Disable-ScheduledTask -TaskName GyoseiNavi-AutoPublish` (재개는 Enable-) |
| 완전 제거 | `Unregister-ScheduledTask -TaskName GyoseiNavi-AutoPublish` |
| 사후 검수 | **주 1회, 그 주의 `[auto]` 커밋 전건을 사람이 검수** (docs/04 §7 개정 조건). 문제 발견 시 즉시 수정 커밋 + 정정 정책(docs/04 §6) 적용 |
| 수동 1회 실행 | `Start-ScheduledTask -TaskName GyoseiNavi-AutoPublish` 또는 `powershell -File scripts/auto-publish.ps1` |

### 알려진 제약

- **품질의 최종 책임은 사후 검수에 있다.** 게이트(zod·build)는 형식을 강제할 뿐 내용의 정확성은 원문 취득 절차 + 주간 검수가 담보한다
- 주 21건 페이스는 docs/00 「주 2건」 원칙의 10배 — 색인 품질·중복 리스크를 월간으로 리뷰하고, 과하면 트리거 수를 줄인다 (작업 스케줄러에서 트리거 삭제)
- 세션이 비정상 종료하면 결과 파일이 없다 → 래퍼가 「결과 없음」으로 통지한다
