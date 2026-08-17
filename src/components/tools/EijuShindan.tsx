"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * 永住要件セルフ診断（改定案対応）
 *   - 根拠: 永住許可ガイドライン改定案（e-Gov 案件番号315000140）・現行ガイドライン（令和8年2月24日改訂）
 *   - 入力はすべてブラウザ内で判定し、送信・保存は一切しない（設計原則）
 *   - 「考慮要素」の適用有無は身分（要件の帰属）と申請時期で分岐する
 */

type Status = "spouse" | "child" | "hsp" | "teijusha" | "general";
type Timing = "before" | "after" | "undecided";

const STATUS_OPTIONS: { value: Status; label: string; note: string }[] = [
  {
    value: "spouse",
    label: "日本人・永住者・特別永住者の配偶者",
    note: "配偶者特例（現行: 婚姻3年＋在留1年 → 改定後: 婚姻5年＋在留3年）",
  },
  {
    value: "child",
    label: "日本人・永住者・特別永住者の実子等",
    note: "実子等の特例（現行: 在留1年 → 改定後: 在留3年）",
  },
  {
    value: "hsp",
    label: "高度人材（ポイント70点以上・80点以上・特別高度人材）",
    note: "高度人材特例（70点3年・80点1年・J-Skip1年 — 年数変更なし）",
  },
  {
    value: "teijusha",
    label: "「定住者」の在留資格",
    note: "定住者特例（継続5年 — 変更なし）",
  },
  {
    value: "general",
    label: "その他（就労資格等で在留）",
    note: "原則ルート（継続10年・うち就労資格等5年 — 変更なし）",
  },
];

/** 身分別の年数質問 */
const YEAR_QUESTIONS: Record<
  Status,
  { key: string; label: string; options: { value: string; label: string }[] }[]
> = {
  spouse: [
    {
      key: "marriage",
      label: "実体を伴った婚姻生活の継続期間",
      options: [
        { value: "lt3", label: "3年未満" },
        { value: "3to5", label: "3年以上5年未満" },
        { value: "ge5", label: "5年以上" },
      ],
    },
    {
      key: "stay",
      label: "引き続き日本に在留している期間",
      options: [
        { value: "lt1", label: "1年未満" },
        { value: "1to3", label: "1年以上3年未満" },
        { value: "ge3", label: "3年以上" },
      ],
    },
  ],
  child: [
    {
      key: "stay",
      label: "引き続き日本に在留している期間",
      options: [
        { value: "lt1", label: "1年未満" },
        { value: "1to3", label: "1年以上3年未満" },
        { value: "ge3", label: "3年以上" },
      ],
    },
  ],
  hsp: [
    {
      key: "hspYears",
      label: "ポイント点数と維持期間",
      options: [
        { value: "70ok", label: "70点以上を3年以上維持している" },
        { value: "80ok", label: "80点以上を1年以上維持している" },
        { value: "jskip", label: "特別高度人材（J-Skip）として1年以上在留している" },
        { value: "notyet", label: "点数はあるが維持期間がまだ足りない" },
      ],
    },
  ],
  teijusha: [
    {
      key: "stay",
      label: "「定住者」としての継続在留期間",
      options: [
        { value: "lt5", label: "5年未満" },
        { value: "ge5", label: "5年以上" },
      ],
    },
  ],
  general: [
    {
      key: "stay",
      label: "継続在留期間（うち就労資格等での在留）",
      options: [
        { value: "lt10", label: "10年未満" },
        { value: "ge10w5", label: "10年以上（うち就労資格等で5年以上）" },
        { value: "ge10", label: "10年以上（ただし就労資格等が5年未満）" },
      ],
    },
  ],
};

const TIMING_OPTIONS: { value: Timing; label: string }[] = [
  { value: "before", label: "2027年3月31日までに申請したい" },
  { value: "after", label: "2027年4月1日以降になりそう" },
  { value: "undecided", label: "まだ決めていない（両方知りたい）" },
];

/** 年数判定: [現行基準を満たすか, 改定後基準を満たすか] */
function judgeYears(status: Status, ans: Record<string, string>): [boolean, boolean] {
  switch (status) {
    case "spouse": {
      const m = ans.marriage;
      const s = ans.stay;
      const current = (m === "3to5" || m === "ge5") && (s === "1to3" || s === "ge3");
      const revised = m === "ge5" && s === "ge3";
      return [current, revised];
    }
    case "child": {
      const s = ans.stay;
      return [s === "1to3" || s === "ge3", s === "ge3"];
    }
    case "hsp": {
      const ok = ans.hspYears !== "notyet";
      return [ok, ok]; // 特例年数は改定で変更なし
    }
    case "teijusha": {
      const ok = ans.stay === "ge5";
      return [ok, ok];
    }
    case "general": {
      const ok = ans.stay === "ge10w5";
      return [ok, ok];
    }
  }
}

/** 考慮要素の適用一覧（身分×時期） */
function factorRows(status: Status, after: boolean) {
  const isSpouseOrChild = status === "spouse" || status === "child";
  const rows: { name: string; applies: string; tone: "on" | "off" | "warn"; note?: string }[] = [];

  // 遡及2項目（改定日の6か月前以降の申請＋審査中案件にも適用される構造）
  rows.push(
    isSpouseOrChild
      ? {
          name: "収入（世帯年収・第2の4(2)）",
          applies: "対象外",
          tone: "off",
          note: "独立生計要件は法律上免除",
        }
      : {
          name: "収入（世帯年収・第2の4(2)）",
          applies: "適用（遡及構造あり）",
          tone: "warn",
          note: "改定日前6か月以降の申請・審査中案件にも適用",
        }
  );
  rows.push({
    name: "公共の負担とならないこと（第2の5(7)）",
    applies: "適用（遡及構造あり）",
    tone: "warn",
    note: isSpouseOrChild
      ? "配偶者・子も世帯の経済状況が考慮され得る（原文ウ）"
      : "改定日前6か月以降の申請・審査中案件にも適用",
  });

  if (after) {
    rows.push(
      isSpouseOrChild
        ? {
            name: "年金（第2の4(3)）",
            applies: "対象外",
            tone: "off",
            note: "独立生計要件は法律上免除",
          }
        : {
            name: "年金（第2の4(3)）",
            applies: "適用",
            tone: "on",
          }
    );
    rows.push(
      status === "hsp"
        ? {
            name: "日本語能力B1相当（第2の5(8)）",
            applies: "免除",
            tone: "off",
            note: "高度人材外国人（第3の6〜8）は考慮要素とされない",
          }
        : {
            name: "日本語能力B1相当（第2の5(8)）",
            applies: "適用",
            tone: "on",
          }
    );
    rows.push({ name: "制度・ルール等への理解（第2の5(9)）", applies: "適用", tone: "on" });
    rows.push({
      name: "学齢期の子の就学（第2の5(10)）",
      applies: "適用",
      tone: "on",
      note: "学齢期の子を養育する場合",
    });
  }
  return rows;
}

const TONE_CLASS = {
  on: "bg-blue-50 text-blue-900",
  off: "bg-gray-50 text-gray-500",
  warn: "bg-amber-50 text-amber-900",
} as const;

export function EijuShindan() {
  const [status, setStatus] = useState<Status | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timing, setTiming] = useState<Timing | null>(null);

  const questions = status ? YEAR_QUESTIONS[status] : [];
  const yearsAnswered = questions.every((q) => answers[q.key]);
  const showResult = status !== null && yearsAnswered && timing !== null;

  const reset = () => {
    setStatus(null);
    setAnswers({});
    setTiming(null);
  };

  let result: React.ReactNode = null;
  if (showResult && status && timing) {
    const [currentOk, revisedOk] = judgeYears(status, answers);
    const statusDef = STATUS_OPTIONS.find((o) => o.value === status)!;
    const scenarios: { title: string; after: boolean; yearsOk: boolean }[] = [];
    if (timing === "before" || timing === "undecided") {
      scenarios.push({ title: "〜2027年3月31日に申請（現行基準）", after: false, yearsOk: currentOk });
    }
    if (timing === "after" || timing === "undecided") {
      scenarios.push({ title: "2027年4月1日以降に申請（改定後基準）", after: true, yearsOk: revisedOk });
    }
    const deadlineWarning = currentOk && !revisedOk;

    result = (
      <div className="mt-8 space-y-6">
        <div className="rounded-lg border-2 border-brand-600 p-5">
          <p className="text-xs font-semibold text-brand-600">診断結果（参考）</p>
          <p className="mt-1 font-bold text-gray-900">{statusDef.note}</p>

          {deadlineWarning && (
            <div className="mt-4 rounded-md border-l-4 border-red-400 bg-red-50 p-3 text-sm leading-relaxed text-red-900">
              <p className="font-bold">現行基準は満たしますが、改定後基準は満たしません。</p>
              <p className="mt-1">
                特例年数の判定は申請日基準で、遡及はありません。現行基準で申請できるのは
                <strong>2027年3月31日まで</strong>です（改定案第6）。
              </p>
            </div>
          )}

          {scenarios.map((sc) => (
            <div key={sc.title} className="mt-4 rounded-md border border-gray-200 p-4">
              <p className="text-sm font-bold text-gray-900">{sc.title}</p>
              <p
                className={`mt-2 text-sm font-semibold ${sc.yearsOk ? "text-green-700" : "text-red-700"}`}
              >
                {sc.yearsOk
                  ? "年数の要件（在留・婚姻等の期間）を満たしている可能性があります。"
                  : "年数の要件（在留・婚姻等の期間）をまだ満たしていません。"}
              </p>
              <p className="mt-2 text-xs font-semibold text-gray-500">
                このほかに審査で考慮されるもの:
              </p>
              <ul className="mt-1 space-y-1">
                {factorRows(status, sc.after).map((r) => (
                  <li
                    key={r.name}
                    className={`rounded px-2 py-1.5 text-xs leading-relaxed ${TONE_CLASS[r.tone]}`}
                  >
                    <span className="font-semibold">{r.name}</span>
                    <span className="mx-1">—</span>
                    {r.applies}
                    {r.note && <span className="ml-1 opacity-80">（{r.note}）</span>}
                  </li>
                ))}
              </ul>
              {!sc.after && (
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  ※ 日本語能力・年金・制度理解・子の就学は2027年4月1日以降の申請から適用されるため、この時期の申請では考慮されません。
                </p>
              )}
            </div>
          ))}

          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            この結果は、公表されている改定案・現行ガイドラインの年数基準と入力内容を機械的に照合したものです。
            素行善良要件・国益要件などの総合判断は含まれておらず、
            <strong>許可の可否を予測・保証するものではありません</strong>。改定案は意見募集中であり、内容が変わる可能性があります。
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-900">あわせて読む</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/guide/nyukan/eiju-guideline-kaitei-2026" className="text-brand-600 hover:underline">
                永住ガイドライン改定案とは｜変更点の全体像
              </Link>
            </li>
            {status === "spouse" && (
              <li>
                <Link href="/guide/nyukan/eiju-haigusha-tokurei" className="text-brand-600 hover:underline">
                  配偶者ビザからの永住が「5年3年」に｜影響を受ける人・対策
                </Link>
              </li>
            )}
            <li>
              <Link href="/guide/nyukan/eiju-nihongo-b1" className="text-brand-600 hover:underline">
                永住の日本語要件はB1相当｜免除される人と適用時期
              </Link>
            </li>
            <li>
              <Link href="/guide/nyukan/eiju-nenkin-yoken" className="text-brand-600 hover:underline">
                永住の年金要件を図解｜受給年金水準と金融資産での補填
              </Link>
            </li>
            <li>
              <Link href="/news/eiju-pubcomme-2026" className="text-brand-600 hover:underline">
                改定案にパブコメを出す方法（2026年9月3日必着）
              </Link>
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          最初からやり直す
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border-l-4 border-blue-300 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
        入力内容が送信・保存されることはありません。すべてお使いのブラウザの中だけで判定します。
      </div>

      {/* Q1 身分 */}
      <fieldset className="mt-6">
        <legend className="font-bold text-gray-900">Q1. 現在の立場に最も近いものは？</legend>
        <div className="mt-3 space-y-2">
          {STATUS_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                status === o.value ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="status"
                className="mt-0.5"
                checked={status === o.value}
                onChange={() => {
                  setStatus(o.value);
                  setAnswers({});
                }}
              />
              <span>
                <span className="font-semibold text-gray-900">{o.label}</span>
                <span className="mt-0.5 block text-xs text-gray-500">{o.note}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Q2 年数 */}
      {status &&
        questions.map((q, i) => (
          <fieldset key={q.key} className="mt-6">
            <legend className="font-bold text-gray-900">
              Q{2 + i}. {q.label}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.options.map((o) => (
                <label
                  key={o.value}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                    answers[q.key] === o.value
                      ? "border-brand-600 bg-brand-50 font-semibold text-gray-900"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.key}
                    className="sr-only"
                    checked={answers[q.key] === o.value}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.key]: o.value }))}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

      {/* Q3 時期 */}
      {status && yearsAnswered && (
        <fieldset className="mt-6">
          <legend className="font-bold text-gray-900">
            Q{2 + questions.length}. 申請の予定時期は？
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIMING_OPTIONS.map((o) => (
              <label
                key={o.value}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                  timing === o.value
                    ? "border-brand-600 bg-brand-50 font-semibold text-gray-900"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="timing"
                  className="sr-only"
                  checked={timing === o.value}
                  onChange={() => setTiming(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {result}
    </div>
  );
}
