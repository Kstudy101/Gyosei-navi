# 木造住宅の耐震診断・改修・除却の費用助成（大田区） — 一次情報 원문

> 취득일: 2026-09-22 / 용도: `content/subsidy/jutaku/ota-mokuzo-taishin-kaishu.mdx`

| 파일 | 원본 | 취득 방법 |
|---|---|---|
| `01_mokudou.txt` | 木造住宅の耐震診断・改修・除却の費用を助成します｜大田区 | `npm run source` |
| `02_taishin_shimekiri.txt` | 令和8年度耐震化助成申請締切日について｜大田区 | `npm run source` |
| `03_08mokuzou_panfu.pdf` / `.txt` | 耐震化助成事業パンフレット（令和8年度・木造） | 직접 다운로드 + `pdftotext` |
| `04_mokuzoujokyaku.txt` | 木造住宅除却工事助成事業｜大田区（除却 전용 안내） | `npm run source` |

원본 URL(제도개요): https://www.city.ota.tokyo.jp/seikatsu/sumaimachinami/bousai_machidukuri/mokudou.html
원본 URL(締切): https://www.city.ota.tokyo.jp/seikatsu/sumaimachinami/bousai_machidukuri/taishin-ka-josei_r05_shimekiri.html
원본 URL(パンフPDF): https://www.city.ota.tokyo.jp/seikatsu/sumaimachinami/bousai_machidukuri/mokudou.files/08mokuzou_panfu.pdf
원본 URL(除却): https://www.city.ota.tokyo.jp/seikatsu/sumaimachinami/bousai_machidukuri/mokuzoujokyaku_taishinka-josei.html

## 원문에서 확정한 사실

| 항목 | 원문 |
|---|---|
| 제도명 | 木造住宅の耐震診断・改修・除却の費用助成（耐震化助成事業） |
| 소관 | 防災まちづくり課（03-5744-1349） |
| 페이지갱신 | 제도개요・締切 모두 2026年4月1日 |
| 대상자 | 구내 건축물 소유 개인・법인（공유는 대표자）. 주민세 체납・대기업・매매목적 부동산업자 등 제외（컨설턴트 파견은 예외 있음） |
| 대상건물(구내진) | 昭和56年5月31日以前 신축착공 목조. 2층 이하 주택(戸建・長屋・共同・점포병용은 과반 주거) |
| 대상건물(신내진) | 昭和56年6月1日〜平成12年5月31日 신축착공 목조주택・在来軸組構法 |
| 스텝 | ①컨설턴트파견(무료) → ②진단 → ③개수설계 → ④개수공사 / 또는 구내진만 除却 |
| 진단(구 등록 진단사) | 80㎡미만: 계약18만/조성15만/자기3만; 80〜120: 21/17.5/3.5; 120㎡이상: 24/20/4 |
| 진단(외부) | 戸建 2/3・상한10만 |
| 개수설계 | 2/3・상한15만（Iw값 1.0 미만 진단 후） |
| 개수공사 | 접도 4m이상 또는 확폭 시 2/3・상한200만; 연도내진화도로 연선 3/4・상한250만; 장애인등 거주 10/10・상한350만; 4m미만・확폭 안 함・미접도는 조성 불가 |
| 요하는 비용 | 실비와 延べ面積×39,900円/㎡ 중 낮은 쪽 |
| 除却 | 구내 중소기업 2/3・상한100만 / 그 외 1/2・상한75만（구내진만・간이진단 등 선행） |
| 令和8 신청마감 | 컨설턴트 2026-12-11 / 개수공사・除却 2027-01-15 / 진단・설계 2027-01-29 |
| 동일연도 규칙 | 각 스텝의 교부신청〜완료보고는 동일연도(4/1〜익년3말) 내 |

## 확인되지 않은 것

- HTML 표의「15,0000円」표기는 자릿수 깨짐으로 보이며, 팸플릿의「15万円」을 정본으로 채택.
- 「沿道耐震化道路」의 구체 노선 목록은 팸플릿/페이지에 상세 지도가 있을 수 있으나 본 기사에서는 창구 확인을 안내.
- 예산 소진에 의한 조기 종료 여부는 締切 페이지에 명시 없음（연도별 신청 마감만 명시）.

## (참고) 조사했으나 본 기사 비채택

- **住宅リフォーム助成事業**（`jyutaku_reform_jyosei.html`, R8 팸플릿）: A/B공사 각 10%・상한20만、窓断熱 포함. 별도 토픽으로 남겨 둠（본 배치는 耐震 우선）.
