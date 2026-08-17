# 정보구조(IA) & 분류체계

> **코드 정본은 `src/config/taxonomy.ts`.** 본 문서는 그 설계 의도와 운용 규칙을 설명한다.
> 둘이 어긋나면 `taxonomy.ts`가 우선하며, 본 문서를 즉시 갱신한다.

## 1. 3층 구조

```
Layer 1  섹션      /news /guide /practice /exam /tools /data
Layer 2  카테고리   guide → 8대 업무분야 / practice → jitsumu·dx·keiei
Layer 3  기사      /guide/nyukan/eiju-guideline-kaitei-2026
```

**설계 의도**: 「독자 유형(누구를 위한 글인가)」을 URL 제1계층으로 올렸다.
- `/guide/` = 절차를 알고 싶은 사람 (B2C·B2B)
- `/practice/` = 실무를 파는 사람 (Pro)

같은 「건설업허가」라도 독자가 다르면 다른 글이며, 다른 경로에 둔다. 이것이 「전 분야 미디어」가 잡탕이 되지 않게 하는 핵심 장치다.

## 2. URL 규칙

```
https://example.jp/guide/nyukan/eiju-guideline-kaitei-2026
                    │      │      └─ 로마자 케밥케이스 슬러그
                    │      └─ 카테고리 코드 (taxonomy.ts와 일치)
                    └─ 섹션
```

| 규칙 | 내용 |
|---|---|
| 슬러그 | 영소문자·숫자·하이픈만. **일본어 URL 금지** (인코딩 깨짐) |
| 길이 | 5단어 이내 권장 |
| 연도 | 제도 개정 기사에는 포함 (`-2026`), 상설 가이드에는 미포함 |
| 변경 | 발행 후 슬러그 변경 금지. 불가피하면 `redirects.json`에 301 등록 |
| 계층 | 4계층 이상 금지 |

## 3. 8대 업무 분야 (guide)

| 코드 | 분야 | 우선도 | 착수 시기 |
|---|---|---|---|
| `nyukan` | 入管業務・国際業務 | **P0** | M1 |
| `houjin` | 法人設立・企業法務 | P1 | M7 |
| `kyoninka` | 建設業・各種許認可 | P1 | M8 |
| `souzoku` | 相続・遺言 | P1 | M9 |
| `hojokin` | 補助金・助成金 | P2 | M13 |
| `jidosha` | 自動車・運輸 | P2 | M14 |
| `keiyaku` | 契約書・民事法務 | P2 | M15 |
| `shinryoiki` | 新領域(ドローン・ペット・IT) | P3 | M16 |

> **P0 단일 집중이 원칙.** 신규 도메인이 8개 분야를 동시에 얕게 다루면 어느 것도 상위에 오르지 못한다.
> `nyukan`에서 「이 사이트는 입관 전문」이라는 시그널을 확립한 뒤 확장한다.

## 4. 횡단 태그 (카테고리와 직교)

| 축 | 태그 | 용도 |
|---|---|---|
| 독자축 | `for-individual` `for-business` `for-pro` `for-exam` | 독자별 아카이브 페이지 |
| 제도축 | `houkaisei-2026` `ikusei-shuro` `eiju-guideline` `denshi-shinsei` `gaikokujin-koyo` | **특집 페이지 단위** — SEO상 가장 강력 |
| 형식축 | `pillar` `cluster` `news` `checklist` `interview` `tool` | 레이아웃 분기 |
| 지역축 | `tokyo` `osaka` `aichi` … | Phase 2 이후 지역 롱테일 |

> **제도축 태그가 곧 특집 페이지가 된다.** `/theme/eiju-guideline` 같은 URL로
> 관련 기사를 한데 모으면, 그 자체가 강력한 허브 페이지로 작동한다.

## 5. 토픽 클러스터 운용

```
Pillar 1개 : Cluster 5~8개 : Tool 0~1개
```

| 역할 | 조건 |
|---|---|
| Pillar | 5,000자+, 전 Cluster로 하향 링크, 상시 갱신 대상 |
| Cluster | 2,500~4,000자, Pillar로 상향 링크 **2회**(상단·말미) |
| Tool | 클러스터 말미에서 유도, 리드 획득 지점 |

**금지**: Pillar 없이 Cluster만 양산하는 것. 클러스터는 반드시 어딘가에 소속된다.

## 6. 초기 Pillar 목록 (M1~M6)

| # | Pillar | 카테고리 | 목표 시기 |
|---|---|---|---|
| 1 | 永住許可 完全ガイド | nyukan/eiju | M1 |
| 2 | 育成就労制度 完全ガイド | nyukan/ikusei | M2 |
| 3 | 技術・人文知識・国際業務 完全ガイド | nyukan/zairyu | M3 |
| 4 | 経営・管理ビザ 完全ガイド | nyukan/zairyu | M3 |
| 5 | 帰化申請 完全ガイド | nyukan/kika | M4 |
| 6 | 外国人雇用 企業向け完全ガイド | nyukan/koyo | M5 |
| 7 | 特定技能 完全ガイド | nyukan/tokutei | M6 |

## 7. 확장 시 규칙

- 새 카테고리 추가 = `taxonomy.ts` 수정 + `content/` 디렉토리 생성 + 본 문서 갱신, **3개 동시**
- 카테고리 신설 조건: **Pillar 1개 + Cluster 3개를 동시에 낼 수 있을 때만.** 빈 카테고리는 만들지 않는다.
