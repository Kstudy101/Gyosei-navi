/**
 * 変更検知の補助金関連度 判定（TypeSafe AI）
 *   市区町村トップページの diff には、イベント告知・職員採用・防災情報など
 *   給付制度と無関係な変更が大量に混ざる（monitor.ts collectMunicipalityWatchTargets 参照）。
 *   追加行を TypeSafe の noul（yes/no 確率）に渡し、しきい値未満を Issue から除外する。
 */
import { TypeSafeClient, noul, APIError } from "@typesafe-ai/sdk";
import type { CheckResult } from "@/lib/sources/monitor";

/** これ未満の確率なら補助金と無関係とみなす */
export const RELEVANCE_THRESHOLD = 0.5;

export interface RelevanceVerdict {
  /** 補助金関連である確率（0〜1） */
  probability: number;
  /** 判定できなかった場合の理由。この場合 probability は 1（除外しない）*/
  error?: string;
}

const QUESTION = noul(
  "この変更は、住民・事業者向けの補助金・助成金・給付金制度の新設、募集開始、内容変更、締切に関するものか？",
  {
    true: "補助金・助成金・給付金の制度そのものに関する変更（新設・募集開始・金額や要件の変更・申請期限）",
    false: "イベント告知、職員採用、防災・気象情報、人事、統計公表など、給付制度とは無関係な変更",
  }
);

/**
 * 変更結果の関連度を判定する。判定できなかったものは probability 1 として扱い、
 * 「AI が落ちたせいで補助金の新着を取りこぼす」ことがないようにする。
 */
export async function judgeRelevance(
  client: TypeSafeClient,
  result: CheckResult
): Promise<RelevanceVerdict> {
  const added = result.diff?.added ?? [];
  if (added.length === 0) return { probability: 1, error: "追加行なし（判定対象外）" };

  try {
    const { answers } = await client.systemOne({
      state: { page: result.target.label, added_lines: added },
      questions: { subsidy: QUESTION },
    });
    return { probability: answers.subsidy.noul };
  } catch (e) {
    const detail = e instanceof APIError ? `HTTP ${e.status}` : e instanceof Error ? e.message : String(e);
    return { probability: 1, error: detail };
  }
}
