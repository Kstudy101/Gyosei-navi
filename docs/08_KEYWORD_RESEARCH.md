# 키워드 리서치 대장 운용 (TASK-07)

> 상위 문서: `docs/07_DATA_PIPELINE_WORKORDER.md` TASK-07 / `docs/00_MASTER_PLAN.md` §2.3
> 원칙: **감으로 기사를 쓰지 않는다.** 모든 기사는 대장의 키워드 행에 근거를 둔다.

## 파일

`data/keywords.csv` (UTF-8 BOM, Excel/Google Sheets에서 바로 열림)

| 컬럼 | 값 | 기입자 |
|---|---|---|
| keyword | 검색어 (일본어) | 자동/수동 |
| category | 8분야 코드 (`nyukan` 등) | 자동/수동 |
| audience | `for-individual` / `for-business` / `for-pro` / `for-exam` (복수는 `\|`) | 자동/수동 |
| volume_est | 월간 검색량 개산 (キーワードプランナー 범위값 그대로, 예 `100-1000`) | **수동** |
| difficulty | 상위 노출 난이도 1~5 (경쟁 상위3의 도메인 권위 기준 주관 판정) | **수동** |
| intent | `info` / `howto` / `compare` / `local` / `transactional` | 수동 |
| competitor_top3 | 상위 3 도메인 (`;` 구분) | 수동 |
| our_status | `idea` → `planned` → `drafted` → `published` → `rewrite` | 자동(seed/drafted/published)+수동 |
| target_slug | 대응 기사 slug | 자동/수동 |
| memo | 자유 메모 | |
| updated_at | YYYY-MM-DD | 자동/수동 |

## 자동 시드

```bash
npm run keywords:seed
```
- `src/config/taxonomy.ts` 의 `CATEGORIES[].seedKeywords` 전부 + 전 기사 `targetKeywords` 를 **없는 행만 추가** (기존 행의 수동 입력값 보호)
- 기사를 새로 쓰면 다시 실행 → 해당 키워드가 `drafted`/`published` 로 들어옴

## 주간 루틴 (일요일 1h — 마스터 플랜 §8.2)

1. **GSC** (Search Console) → 「検索パフォーマンス」 → 표시 횟수 상위 & 평균 게재순위 5~20위 쿼리를 대장에 추가 (`our_status: rewrite` 후보)
2. **ラッコキーワード** → 주력 KW의 サジェスト·Q&A 를 5~10개 골라 `idea` 로 추가
3. **キーワードプランナー** → 신규 `idea` 행의 `volume_est` 채우기
4. 다음 주 기사 2건 = `volume_est` × (5 − `difficulty`) 가 높은 `idea/planned` 행에서 선택 → `planned` 로 변경, `target_slug` 예약

## 툴 (외부, 코드 불필요)

| 툴 | 비용 | 용도 |
|---|---|---|
| ラッコキーワード | 무료~¥440/월 | サジェスト·Q&A·공지 검색. 일본어 SEO 필수 |
| Google Search Console | 무료 | 자사 실측. **리라이트 우선순위의 유일한 근거** |
| Google キーワードプランナー | 무료 | 검색량 개산 (광고 미집행 시 범위 표시) |

## 금지

- 대장에 없는 키워드로 기사 착수하지 않기 (먼저 행을 만든다)
- `volume_est` 를 추측으로 채우지 않기 (모르면 공란)
