/**
 * 자동 발행 파이프라인의 카테고리 로테이션 (docs/16)
 *   npm run rotate:next          # 다음 카테고리를 뽑아 출력하고 상태를 갱신
 *   npm run rotate:next -- --peek  # 상태를 바꾸지 않고 다음 순번만 확인
 *
 * 「전체 카테고리를 랜덤으로 돌아가며」의 구현:
 *   - 셔플한 덱에서 하나씩 뽑는다 → 한 바퀴(8회) 안에 전 카테고리가 정확히 1번씩 나온다
 *   - 덱이 비면 재셔플. 단순 랜덤과 달리 특정 카테고리가 장기간 안 뽑히는 일이 없다
 *   - 상태는 data/auto-rotation.json 에 영속 (기사와 함께 커밋 → 어느 머신에서도 이어짐)
 */
import fs from "node:fs";
import path from "node:path";
import { CATEGORY_CODES } from "../src/config/taxonomy";

const STATE_FILE = path.join(process.cwd(), "data", "auto-rotation.json");

interface RotationState {
  /** 남은 순번 (앞에서 pop) */
  deck: string[];
  /** 뽑은 기록 (최신이 마지막). 무엇이 발행됐는지는 git log 가 정본 */
  history: { at: string; category: string }[];
}

function shuffled(): string[] {
  // Fisher–Yates. Math.random 으로 충분 (보안 용도 아님)
  const a = [...CATEGORY_CODES];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function load(): RotationState {
  if (!fs.existsSync(STATE_FILE)) return { deck: [], history: [] };
  const raw = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")) as unknown;
  // 손상 시 명확히 실패 (절대규칙 6: 조용한 「0건」 처리 금지)
  if (
    typeof raw !== "object" || raw === null ||
    !Array.isArray((raw as RotationState).deck) ||
    !Array.isArray((raw as RotationState).history)
  ) {
    throw new Error(`auto-rotation.json 이 손상되었습니다: ${STATE_FILE} — 삭제하면 재셔플로 복구된다`);
  }
  const st = raw as RotationState;
  // taxonomy 에서 카테고리가 제거된 경우 덱에서도 제거
  st.deck = st.deck.filter((c) => (CATEGORY_CODES as readonly string[]).includes(c));
  return st;
}

const peek = process.argv.includes("--peek");
const st = load();
if (st.deck.length === 0) st.deck = shuffled();

const category = st.deck[0];
if (!peek) {
  st.deck = st.deck.slice(1);
  st.history.push({ at: new Date().toISOString(), category });
  // 기록은 최근 60건(약 20일치)만 유지
  st.history = st.history.slice(-60);
  fs.writeFileSync(STATE_FILE, JSON.stringify(st, null, 2) + "\n", "utf-8");
}

// 마지막 줄의 카테고리 코드만 파싱하면 되도록 출력을 고정
console.log(`남은 덱: ${st.deck.length}장${peek ? " (peek — 상태 미변경)" : ""}`);
console.log(category);
