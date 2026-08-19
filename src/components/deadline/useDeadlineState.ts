"use client";

import { useEffect, useState } from "react";
import { resolveDeadlineState, type DeadlineLike, type DeadlineState } from "@/lib/deadline";

/**
 * 締切表示を「ビルド時刻」から「閲覧時刻」に補正するフック。
 *
 * initial はサーバ（ビルド時）が算出した値。これを初期状態にすることで
 * 静的 HTML とハイドレーション直後の描画が一致し、差分警告が出ない。
 * マウント後に実時刻で上書きし、開きっぱなしのタブが日付をまたいでも
 * 追随するよう毎分見直す（1 日 1 回しか値は変わらないので負荷は無視できる）。
 */
export function useDeadlineState(
  deadline: DeadlineLike,
  initial: DeadlineState
): DeadlineState {
  // 依存はオブジェクトではなく日付文字列にする。props のオブジェクトは再レンダーごとに
  // 別物になりうるため、そのまま依存にするとタイマーを張り直し続けることになる。
  const { dueDate, closesAt } = deadline;
  const [state, setState] = useState<DeadlineState>(initial);

  useEffect(() => {
    const sync = () => setState(resolveDeadlineState({ dueDate, closesAt }, new Date()));
    sync();
    const timer = setInterval(sync, 60_000);
    return () => clearInterval(timer);
  }, [dueDate, closesAt]);

  return state;
}
