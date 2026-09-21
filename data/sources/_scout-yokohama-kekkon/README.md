# 横浜市 × kekkon 스카우트・검증 결과 (SKIP)

> 갱신: 2026-09-21（재확인 3회차） / orchestrator 배치 단건（神奈川県・横浜市・kekkon）
> 도달 단계: topic-scout → municipality/government 교차확인 → verifier **PASS(미실시 확정)** → writer 이후 **미진행(SKIP)**

## 결론

**SKIP** — 横浜市는 카테고리 `kekkon`의 핵심 제도인「結婚新生活支援事業補助金」（新婚世帯の住居費・引越費用等の現金補助）를 **실시하지 않는다**.
공식 FAQ가 명시하고, こども家庭庁 令和7年度 神奈川県 활용상황 PDF와도 일치한다.
억지로 기사를 쓰지 않는다（AGENTS.md 절대규칙 6・9, article-policy: 원문 없는 published 금지）.
taxonomy.ts `kekkon` 정의: 「結婚新生活支援事業など、新婚世帯の住居費・引っ越し費用を補助する制度。」

## 원문 근거（미실시 확정）

| 파일 | 원본 | 취득 | 핵심 |
|---|---|---|---|
| `01_faq-kekkon-shinseikatsu.txt` | 横浜市 FAQ「結婚新生活支援事業補助金はありますか」 | `npm run source`（2026-09-20） | 「横浜市では実施しておりません。」最終更新日 2024年1月22日。所管: こども青少年局企画部企画調整課（045-671-4281） |
| `02_faq-kekkon-shinseikatsu-recheck.txt` | 동일 URL 재취득 | `npm run source`（2026-09-21） | 문장・갱신일 불변（3199字 동일） |
| `03_faq-kekkon-shinseikatsu-20260921b.txt` | 동일 URL 재취득（배치 재요청） | `npm run source`（2026-09-21） | 「実施しておりません」유지・3199字 동일 |
| `10_r7_kanagawa.pdf`（또는 `data/sources/kekkon-shinseikatsu-shien/08_r7_kanagawa.pdf`） | こども家庭庁「活用状況【神奈川県】」令和7年5月29日現在 | 기존 아카이브 복사 | 「2. 結婚新生活支援事業」표에 **横浜市 없음**. 横浜市는 「1. 地域少子化対策重点推進事業」（マッチング・情報発信等）에만 등재（総事業費5,000千円） |
| `14_cfa-r7-top.txt` | こども家庭庁 令和7年度 交付金 톱 | `npm run source`（2026-09-21） | 교부금 프레임 확인용（실시주체는 시정촌 임의） |

FAQ URL: https://www.city.yokohama.lg.jp/faq/kukyoku/kodomo/kodomo-kikaku/20240122.html  
神奈川県 PDF URL: https://www.cfa.go.jp/assets/contents/node/basic_page/field_ref_resources/0fbe8d61-313a-4946-9dfa-b4c1b39644e7/9b6fb4ad/20250611_policies_shoushika_koufukin_r7_17.pdf

## 대체 후보 검토（채택하지 않음）

| 후보 | 조사 | 판단 |
|---|---|---|
| 横浜市「地域少子化対策重点推進事業」（出会い・マッチング） | CFA 神奈川 PDF에 등재 | `kekkon` 카테고리 정의（新婚世帯の住居費・引越費用補助）와 성격이 다름 → 기사화하지 않음 |
| 空家活用・子育て世代家賃補助 등 주택계 | `11_jutaku-top.txt` | 子育て/住宅 축이지 結婚新生活 축이 아님 → 별 카테고리 대상 |
| 神奈川県 주도 結婚新生活支援（横浜市民 수급） | CFA PDF「2.」표는 厚木・愛川・清川・海老名・座間・綾瀬 등 시정촌 실시분 | 横浜市 주민이 시 제도로 받는 현금보조는 확인되지 않음 |

## 기존 기사・regions

- `content/subsidy/kekkon/`에 横浜市 기사 **없음**（중복 skip 아님 — 제도 미실시로 skip）
- `src/config/regions.ts`: `yokohama` / code `14100` **등록済み・재등록 금지**

## verifier 판정

- **PASS（사실: 미실시）**: FAQ 원문 문장과 CFA 神奈川 PDF「2. 結婚新生活支援事業」비등재가 일치
- **기사 published 전환: 해당 없음**（쓸 제도가 없음）

## 파이프라인 상태

```
topic-scout → SKIP 확정
municipality/government 교차확인 → FAQ 재취득(3회) + CFA PDF 대조 완료
verifier → PASS（미실시）
writer / ad-mapper / seo / editor / publisher → 미호출
```

## 확인되지 않은 것

- FAQ 최종갱신일（2024-01-22）이후 横浜市가 **신규로** 結婚新生活支援事業을 시작했을 가능성: 2026-09-21 FAQ 재취득 3회 모두 「実施しておりません」유지. 다만 令和8年度 이후 신규 실시는 정기 재스카우트 필요.
- 横浜市 独自의 「결혼 축하금」등 명칭이 다른 소액 급부: 공식 子育て・住宅 톱・FAQ 경로에서는 확인되지 않음（미확인 ≠ 없음. 단 현재 공개 FAQ가 핵심 제도에 대해 미실시를 단언하므로 기사화 보류）.
