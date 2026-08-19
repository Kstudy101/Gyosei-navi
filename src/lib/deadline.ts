/**
 * 締切カウントダウンの日数計算（JST 固定）。
 *
 * 静的書き出し（output: "export"）のため、ビルド時刻の値がそのまま HTML に焼き付く。
 * 表示のずれを防ぐ設計:
 *   1. サーバ（ビルド時）が算出した状態を初期値として HTML に出す（no-JS / クローラ向け）
 *   2. クライアントはマウント後に再計算して上書きする（DeadlineCountdown 参照）
 *
 * 日本に夏時間は無いので JST は UTC+9 固定でよい。Intl を使わず整数演算で完結させ、
 * サーバ（GitHub Actions = UTC）とブラウザ（任意の TZ）で同じ結果になるようにする。
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** その瞬間が JST で何日目か（1970-01-01 JST = 0）。時差を足してから日で切り捨てる */
export function jstDayIndex(at: Date): number {
  return Math.floor((at.getTime() + JST_OFFSET_MS) / DAY_MS);
}

/** "YYYY-MM-DD"（JST カレンダー日）を日番号に。書式不正は例外にする（黙って 0 にしない） */
export function jstDayIndexOf(date: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new Error(`締切日は YYYY-MM-DD 形式で指定してください: ${date}`);
  const [, y, mo, d] = m;
  return Math.floor(Date.UTC(Number(y), Number(mo) - 1, Number(d)) / DAY_MS);
}

/** 締切までの残り日数（JST のカレンダー日差）。当日は 0、過ぎるとマイナス */
export function daysUntilJst(dueDate: string, now: Date): number {
  return jstDayIndexOf(dueDate) - jstDayIndex(now);
}

export type DeadlinePhase = "before" | "today" | "closed";

export type DeadlineState = {
  phase: DeadlinePhase;
  /** 残り日数。phase が "closed" のときは 0 未満になりうる */
  daysLeft: number;
  /** 見た目の緊急度。docs/10 の監視レポートと同じく D-7 以下を「緊急」とする */
  urgency: "normal" | "soon" | "urgent" | "closed";
};

export type DeadlineLike = {
  /** 必着日（JST カレンダー日, YYYY-MM-DD） */
  dueDate: string;
  /** 受付が閉じる瞬間（オフセット付き ISO8601）。必着日の翌日 0 時であることが多い */
  closesAt: string;
};

/** 締切の現在状態。now を引数で受けてビルド時／マウント後の双方から同じ関数を使う */
export function resolveDeadlineState(deadline: DeadlineLike, now: Date): DeadlineState {
  const closesAt = Date.parse(deadline.closesAt);
  if (Number.isNaN(closesAt)) {
    throw new Error(`closesAt を解釈できません: ${deadline.closesAt}`);
  }
  const daysLeft = daysUntilJst(deadline.dueDate, now);

  if (now.getTime() >= closesAt) {
    return { phase: "closed", daysLeft, urgency: "closed" };
  }
  if (daysLeft <= 0) {
    return { phase: "today", daysLeft: 0, urgency: "urgent" };
  }
  return {
    phase: "before",
    daysLeft,
    urgency: daysLeft <= 7 ? "urgent" : daysLeft <= 14 ? "soon" : "normal",
  };
}
