# 富山県再生可能エネルギー導入促進補助金 — 조사 결과: SKIP（대체후보로 조사, 확보 실패）

> 조사일: 2026-09-22 / 대상: `energy` 카테고리 대체후보（topics-db note 언급）
> 결론: **기사화 skip**（유효 모집중 제도 원문을 확보하지 못함, `toyama-ev-hojo/README.md` 참조）

## 조사 경위

「令和7年度再生可能エネルギー導入促進補助金(富山県)」 페이지 URL `https://www.pref.toyama.jp/1705/kurashi/kankyoushizen/kankyou/saienehojo.html`（검색결과에서 확인된 URL）을 `npm run source`로 시도했으나 **HTTP 404**（원문 소실 확인）.

대신 관련 검색결과로 나온 `https://www.pref.toyama.jp/1705/kurashi/kankyoushizen/kankyou/kj00012391.html`（「富山県再生可能エネルギー等導入推進基金について」）을 취득（`01_kikin.txt`）했으나, 확인 결과 이는:

- 平成24年度・平成26年度 환경省 교부금으로 조성한 기금
- 사업기간: 平成24年度～平成28年度（이미 종료）
- 사업대상: **지역 방재거점인 공공시설**에 재생에너지 발전설비・축전지 등 도입（개인 주택 대상 太陽光・蓄電池 구입보조금이 아님）

즉 topics-db note가 언급한 「太陽光・蓄電池 개인 구입보조 최대60만엔」 제도와는 **별개의, 이미 종료된 공공시설용 기금사업**임이 원문에서 확인됨.

## 취득한 파일（참고용, 기사 근거로는 부적합）

| 파일 | 원본 URL | 상태 |
|---|---|---|
| `01_kikin.txt` | https://www.pref.toyama.jp/1705/kurashi/kankyoushizen/kankyou/kj00012391.html | 취득 성공（단, 개인대상 제도 아님. 平成28年度로 사업기간 종료） |

## 확인되지 않은 것 / skip 사유

- 개인대상 「太陽光発電・蓄電池 최대60만엔」 보조금의 令和8年度 모집 유무 및 현재 유효 URL: **unresearched**.
- 결론: energy 카테고리는 이번 세션에서 원문 확보 실패로 skip. 후속 조사 필요.
