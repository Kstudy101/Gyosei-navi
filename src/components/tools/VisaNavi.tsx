"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { QUESTIONS, visibleQuestions, type Question } from "@/lib/tools/visa-navi/questions";
import { evaluate, type Candidate, type Result } from "@/lib/tools/visa-navi/rules";
import { STATUSES, type Answers, type StatusMeta } from "@/lib/tools/visa-navi/statuses";

/**
 * 在留資格判定ナビ（ウィザード）
 *   - 1画面1問・カード選択・自動で次へ（docs/13 §2）
 *   - 入力はブラウザ内でのみ判定し、送信・保存しない
 *   - 結果は「候補」の提示であり可否判定ではない（docs/06 §3.3 文言を結果画面に固定）
 */

type Phase = "wizard" | "result";

const FAMILY_LABEL: Record<StatusMeta["family"], string> = {
  yes: "可",
  no: "原則不可",
  conditional: "条件あり",
  na: "—",
};

export function VisaNavi() {
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<Phase>("wizard");
  const [history, setHistory] = useState<Answers[]>([]);
  const [multiDraft, setMultiDraft] = useState<string[]>([]);

  const visible = useMemo(() => visibleQuestions(answers), [answers]);
  const current = visible.find((q) => answers[q.key] === undefined);
  const answeredCount = visible.filter((q) => answers[q.key] !== undefined).length;
  const total = visible.length;
  const progress = phase === "result" ? 100 : Math.round((answeredCount / Math.max(total, 1)) * 100);

  const result: Result | null = useMemo(() => (phase === "result" ? evaluate(answers) : null), [phase, answers]);

  function commit(next: Answers) {
    setHistory((h) => [...h, answers]);
    setAnswers(next);
    setMultiDraft([]);
    const remaining = visibleQuestions(next).find((q) => next[q.key] === undefined);
    if (!remaining) setPhase("result");
  }
  function select(q: Question, value: string) {
    commit({ ...answers, [q.key]: value } as Answers);
  }
  function back() {
    if (phase === "result") {
      setPhase("wizard");
      // 最後の質問を未回答に戻す
      const last = visible[visible.length - 1];
      if (last) {
        const a = { ...answers };
        delete a[last.key];
        setAnswers(a);
      }
      return;
    }
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setAnswers(prev);
    setMultiDraft([]);
  }
  function reset() {
    setAnswers({});
    setHistory([]);
    setMultiDraft([]);
    setPhase("wizard");
  }
  function jumpTo(key: keyof Answers) {
    // 該当質問以降の回答を消して戻る
    const idx = QUESTIONS.findIndex((q) => q.key === key);
    const a: Answers = {};
    for (const q of QUESTIONS.slice(0, idx)) if (answers[q.key] !== undefined) (a as Record<string, unknown>)[q.key] = answers[q.key];
    setHistory([]);
    setAnswers(a);
    setMultiDraft([]);
    setPhase("wizard");
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Progress */}
      <div className="border-b border-gray-100 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{phase === "result" ? "結果" : `質問 ${answeredCount + 1} / ${total}`}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8">
        {phase === "wizard" && current && (
          <QuestionView
            q={current}
            answers={answers}
            multiDraft={multiDraft}
            onToggleMulti={(v) => setMultiDraft((d) => (d.includes(v) ? d.filter((x) => x !== v) : [...d, v]))}
            onSelect={(v) => select(current, v)}
            onCommitMulti={() => commit({ ...answers, [current.key]: multiDraft } as Answers)}
          />
        )}
        {phase === "result" && result && <ResultView answers={answers} result={result} onJump={jumpTo} />}

        {/* Footer nav */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={back} disabled={history.length === 0 && phase === "wizard"} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
            ← 戻る
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-gray-400 sm:inline">入力内容は送信・保存されません</span>
            <button type="button" onClick={reset} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              最初からやり直す
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Question ───────────────────────── */
function QuestionView({
  q,
  answers,
  multiDraft,
  onSelect,
  onToggleMulti,
  onCommitMulti,
}: {
  q: Question;
  answers: Answers;
  multiDraft: string[];
  onSelect: (v: string) => void;
  onToggleMulti: (v: string) => void;
  onCommitMulti: () => void;
}) {
  const selectedChips = summarize(answers);
  return (
    <div>
      {selectedChips.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {selectedChips.map((c) => (
            <span key={c.key} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
              {c.icon} {c.label}
            </span>
          ))}
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{q.title}</h2>
      {q.subtitle && <p className="mt-1 text-sm text-gray-500">{q.subtitle}</p>}

      <div className={`mt-5 grid gap-3 ${q.options.length > 6 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
        {q.options.map((o) => {
          const active = q.multi ? multiDraft.includes(o.value) : false;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={q.multi ? active : undefined}
              onClick={() => (q.multi ? onToggleMulti(o.value) : onSelect(o.value))}
              className={`group flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-600 ${
                active ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white hover:border-brand-600"
              }`}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {o.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-gray-900 group-hover:text-brand-700">{o.label}</span>
                {o.desc && <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{o.desc}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {q.multi && (
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={onCommitMulti} className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
            {multiDraft.length > 0 ? `選択して結果を見る（${multiDraft.length}）` : "該当なし・結果を見る"}
          </button>
        </div>
      )}
      {q.hint && <p className="mt-3 text-xs text-gray-500">{q.hint}</p>}
    </div>
  );
}

/** 回答済みの要約チップ */
function summarize(a: Answers) {
  const out: { key: string; icon: string; label: string }[] = [];
  for (const q of QUESTIONS) {
    const v = a[q.key];
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      if (v.length) out.push({ key: q.key, icon: "✔", label: v.map((x) => q.options.find((o) => o.value === x)?.label ?? x).join("・") });
      continue;
    }
    const o = q.options.find((x) => x.value === v);
    if (o) out.push({ key: q.key, icon: o.icon, label: o.label });
  }
  return out;
}

/* ───────────────────────── Result ───────────────────────── */
function ResultView({ answers, result, onJump }: { answers: Answers; result: Result; onJump: (k: keyof Answers) => void }) {
  const chips = summarize(answers);
  const [top, ...others] = result.candidates;
  const realTop = top && STATUSES[top.code].group !== "out" ? top : undefined;

  return (
    <div>
      {/* 回答サマリ（クリックで戻る） */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button key={c.key} type="button" onClick={() => onJump(c.key as keyof Answers)} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-brand-50 hover:text-brand-700" title="この回答から変更する">
            {c.icon} {c.label} ✎
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold text-brand-600">公表されている一般的な要件との照合結果</p>
      <h2 className="mt-1 text-2xl font-bold text-gray-900">候補となる在留資格</h2>
      <p className="mt-1 text-sm text-gray-500">
        {result.candidates.filter((c) => STATUSES[c.code].group !== "out").length > 0
          ? "入力内容から候補に挙がる在留資格と、その主な要件を表示しています。許可の可否を判定するものではありません。"
          : "入力内容では、公表されている一般的な要件に当てはまる在留資格が見当たりませんでした。"}
      </p>

      {/* 専門家ブロック */}
      {result.expert && <ExpertBlock />}

      {/* トップ候補 */}
      {top && <CandidateCard cand={top} answers={answers} highlight={!!realTop} rank={1} />}

      {/* ルート */}
      {result.route.title && (
        <section className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold text-gray-500">申請のルート</p>
          <p className="mt-1 font-bold text-gray-900">{result.route.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">{result.route.text}</p>
          {result.route.href && (
            <Link href={result.route.href} className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline">
              📄 {result.route.hrefLabel} →
            </Link>
          )}
        </section>
      )}

      {/* 他の候補 */}
      {others.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-bold text-gray-700">あわせて確認したい候補</h3>
          <div className="mt-2 space-y-3">
            {others.map((cnd, i) => (
              <CandidateCard key={cnd.code} cand={cnd} answers={answers} highlight={false} rank={i + 2} compact />
            ))}
          </div>
        </section>
      )}

      {/* 注記 */}
      {result.notes.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-bold text-gray-700">注意点・あわせて知っておきたいこと</h3>
          <ul className="mt-2 space-y-2">
            {result.notes.map((n) => (
              <li key={n.id} className={`rounded-md border-l-4 p-3 text-sm leading-relaxed ${n.tone === "warn" ? "border-amber-400 bg-amber-50 text-amber-900" : "border-brand-600 bg-brand-50 text-gray-800"}`}>
                {n.text}
                {n.href && (
                  <>
                    {" "}
                    <Link href={n.href} className="font-semibold text-brand-700 underline">
                      {n.hrefLabel ?? "関連記事"}
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* アクション */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/guide/nyukan/gaikokujin-koyo-zairyu-shikaku-hayamihyo" className="rounded-lg border-2 border-brand-600 p-4 text-center font-bold text-brand-700 hover:bg-brand-50">
          📋 在留資格 早見表（29種の一覧）を見る
        </Link>
        <a href="https://www.gyosei.or.jp/members-search/" target="_blank" rel="noopener noreferrer" className="rounded-lg border-2 border-gray-300 p-4 text-center font-bold text-gray-700 hover:bg-gray-50">
          🔎 有資格者を探す（日本行政書士会連合会）↗
        </a>
      </section>

      <p className="mt-6 rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
        ※ 本診断は公表されている一般的な要件との照合結果であり、許可の可否を判定するものではありません。実際の審査は個別事情を総合的に考慮して行われます。
      </p>
    </div>
  );
}

function ExpertBlock() {
  return (
    <div className="mt-4 rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
      <p className="font-bold text-amber-900">⚠️ 個別判断の領域が含まれています</p>
      <p className="mt-1 text-sm leading-relaxed text-amber-900">
        入管庁が一般的な基準を公表していない（告示外・総合判断）領域が含まれるため、本ナビでは候補の提示にとどめています。
        実際の手続にあたっては、行政書士等の有資格者にご相談ください。
      </p>
      <a href="https://www.gyosei.or.jp/members-search/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-amber-900 underline">
        日本行政書士会連合会「行政書士を探す」↗
      </a>
    </div>
  );
}

function CandidateCard({ cand, answers, highlight, rank, compact }: { cand: Candidate; answers: Answers; highlight: boolean; rank: number; compact?: boolean }) {
  const meta = STATUSES[cand.code];
  const [open, setOpen] = useState(!compact);
  const checks = meta.requirements.map((r) => ({ text: r.text, state: r.check ? r.check(answers) : ("unknown" as const) }));
  const ok = checks.filter((c) => c.state === "ok").length;
  const ng = checks.filter((c) => c.state === "ng").length;
  const isOut = meta.group === "out";

  return (
    <section className={`mt-4 rounded-xl border-2 p-5 ${highlight ? "border-brand-600 bg-white shadow-md" : isOut ? "border-gray-300 bg-gray-50" : "border-gray-200 bg-white"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-500">
            {isOut ? "結果" : `候補 ${rank}`}
            {meta.group === "designated" && " ・ 特定活動"}
            {meta.group === "identity" && " ・ 身分による在留資格"}
            {meta.group === "procedure" && " ・ 手続"}
          </p>
          <h3 className={`mt-0.5 font-bold text-gray-900 ${highlight ? "text-xl sm:text-2xl" : "text-lg"}`}>{meta.name}</h3>
          <p className="mt-1 text-sm text-brand-700">{cand.reason}</p>
        </div>
        {compact && (
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-sm text-gray-500 hover:text-brand-700" aria-expanded={open}>
            {open ? "閉じる ▲" : "詳細 ▼"}
          </button>
        )}
      </div>

      {open && (
        <>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">{meta.summary}</p>

          {!isOut && (
            <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-md bg-gray-50 p-3">
                <dt className="text-xs text-gray-500">在留期間</dt>
                <dd className="mt-0.5 font-semibold text-gray-900">{meta.period}</dd>
              </div>
              <div className="rounded-md bg-gray-50 p-3">
                <dt className="text-xs text-gray-500">家族の帯同</dt>
                <dd className="mt-0.5 font-semibold text-gray-900">{FAMILY_LABEL[meta.family]}</dd>
                {meta.familyNote && <dd className="text-xs text-gray-500">{meta.familyNote}</dd>}
              </div>
              <div className="rounded-md bg-gray-50 p-3">
                <dt className="text-xs text-gray-500">就労の範囲</dt>
                <dd className="mt-0.5 font-semibold text-gray-900">{meta.work}</dd>
              </div>
            </dl>
          )}

          {checks.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">公表要件との照合（入力内容から確認できた項目）</p>
                <p className="text-xs text-gray-500">
                  ✓ {ok} ／ 要確認 {checks.length - ok - ng}
                  {ng > 0 && ` ／ 未充足の可能性 ${ng}`}
                </p>
              </div>
              <div className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden>
                <div className="h-full bg-emerald-500" style={{ width: `${(ok / checks.length) * 100}%` }} />
                <div className="h-full bg-rose-400" style={{ width: `${(ng / checks.length) * 100}%` }} />
              </div>
              <ul className="mt-2 space-y-1.5">
                {checks.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${c.state === "ok" ? "bg-emerald-100 text-emerald-700" : c.state === "ng" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.state === "ok" ? "✓" : c.state === "ng" ? "✕" : "△"}
                    </span>
                    <span className="text-gray-800">{c.text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-[11px] text-gray-400">△＝入力内容だけでは判断できない項目（書類で立証）。✕＝入力内容では満たしていない可能性。充足率は許可の見込みを示すものではありません。</p>
            </div>
          )}

          {(meta.articles?.length || meta.sources.length) && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {meta.articles && meta.articles.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500">📄 関連記事</p>
                  <ul className="mt-1 space-y-1">
                    {meta.articles.map((a) => (
                      <li key={a.href}>
                        <Link href={a.href} className="text-sm font-semibold text-brand-600 hover:underline">
                          {a.label} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500">🔗 一次情報</p>
                <ul className="mt-1 space-y-1">
                  {meta.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 underline decoration-gray-300 hover:text-brand-700">
                        {s.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
