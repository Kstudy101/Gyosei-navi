/**
 * 在留資格判定ナビ — ルール検証
 *   npm run test:visa-navi
 *   1) 全リーフが少なくとも1つのフィクスチャで到達できる（到達不能リーフ = 0）
 *   2) ルールが参照する在留資格コードが STATUSES に全て存在する
 *   3) docs/13 §5-1: カタログ上の全在留資格（out を除く）が少なくとも1リーフから参照される
 *   4) docs/13 §5-3 のシナリオが期待する候補を含む
 *   5) 全質問の全選択肢を辿っても evaluate が例外を出さず、候補が最低1件返る（網羅性の機械検証）
 */
import { LEAVES, evaluate } from "../src/lib/tools/visa-navi/rules";
import { STATUSES, type Answers } from "../src/lib/tools/visa-navi/statuses";
import { QUESTIONS, nextQuestion } from "../src/lib/tools/visa-navi/questions";

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error("✖", msg);
};

/* 1+2) リーフ到達性 & コード整合 */
const leafFixtures: Record<string, Answers> = {
  T10: { location: "nostatus" },
  R4: { location: "born" },
  S13: { location: "naturalize" },
  S12: { location: "japan", currentStatus: "shuro", identity: "none", activity: "work", workType: "entertain", wishes: ["eiju"] },
  S1: { location: "abroad", identity: "jp-spouse" },
  S2: { location: "abroad", identity: "jp-child" },
  S3: { location: "japan", currentStatus: "ryugaku", identity: "pr-spouse" },
  S4: { location: "japan", currentStatus: "other", identity: "pr-child" },
  S5: { location: "abroad", identity: "teiju", identityDetail: "nikkei3" },
  S6: { location: "abroad", identity: "teiju", identityDetail: "pr-child-abroad" },
  S7: { location: "abroad", identity: "teiju", identityDetail: "tsureko" },
  S8: { location: "abroad", identity: "teiju", identityDetail: "teiju-spouse" },
  S9: { location: "abroad", identity: "teiju", identityDetail: "nikkei4", age: "18to30", jlpt: "n4" },
  S10: { location: "abroad", identity: "teiju", identityDetail: "zanryu-refugee" },
  S11: { location: "japan", currentStatus: "mibun", identity: "teiju", identityDetail: "divorce" },
  S14: { location: "japan", currentStatus: "other", identity: "teiju", identityDetail: "evacuee" },
  F8: { location: "japan", currentStatus: "kazoku", identity: "teiju", identityDetail: "kazoku-highschool" },
  T8a: { location: "japan", currentStatus: "other", identity: "teiju", identityDetail: "refugee" },
  W1: { location: "japan", currentStatus: "ryugaku", identity: "none", activity: "work", workType: "office", officeKind: "tech", edu: "univ", points: "lt70" },
  W2: { location: "japan", currentStatus: "ryugaku", identity: "none", activity: "work", workType: "office", officeKind: "tech", edu: "senmon" },
  W3: { location: "abroad", identity: "none", activity: "work", workType: "office", officeKind: "tech", edu: "other", exp: "ge10" },
  W4: { location: "abroad", identity: "none", activity: "work", workType: "office", officeKind: "intl", edu: "univ", jlpt: "n2" },
  W5: { location: "abroad", identity: "none", activity: "work", workType: "office", officeKind: "tech", edu: "other", exp: "lt3" },
  W27: { location: "abroad", identity: "none", activity: "work", workType: "office", officeKind: "tech", edu: "univ", points: "ge70" },
  W34: { location: "abroad", identity: "none", activity: "work", workType: "freelance", officeKind: "tech", edu: "univ" },
  W6: { location: "abroad", identity: "none", activity: "work", workType: "transfer", points: "lt70" },
  W6h: { location: "abroad", identity: "none", activity: "work", workType: "transfer", points: "ge80" },
  W7: { location: "abroad", identity: "none", activity: "work", workType: "research-edu", researchKind: "univ", points: "lt70" },
  W7h: { location: "abroad", identity: "none", activity: "work", workType: "research-edu", researchKind: "univ", points: "ge70" },
  W8: { location: "abroad", identity: "none", activity: "work", workType: "research-edu", researchKind: "lab", points: "lt70" },
  W8h: { location: "abroad", identity: "none", activity: "work", workType: "research-edu", researchKind: "lab", points: "ge70" },
  W9: { location: "abroad", identity: "none", activity: "work", workType: "research-edu", researchKind: "school" },
  W10: { location: "abroad", identity: "none", activity: "work", workType: "licensed", licensedKind: "medical" },
  W11: { location: "abroad", identity: "none", activity: "work", workType: "licensed", licensedKind: "legal" },
  W12: { location: "abroad", identity: "none", activity: "work", workType: "licensed", licensedKind: "kaigo" },
  W13: { location: "abroad", identity: "none", activity: "work", workType: "skilled", exp: "ge10" },
  W14: { location: "abroad", identity: "none", activity: "work", workType: "field", sswTest: "ssw1", age: "18to30", nationality: "other" },
  W15: { location: "japan", currentStatus: "ginojisshu", identity: "none", activity: "work", workType: "field", sswTest: "titp2", age: "18to30", nationality: "other" },
  W16: { location: "abroad", identity: "none", activity: "work", workType: "field", sswTest: "ssw2", age: "31to35", nationality: "other" },
  W17: { location: "abroad", identity: "none", activity: "work", workType: "field", sswTest: "none", age: "18to30", nationality: "other" },
  W18: { location: "abroad", identity: "none", activity: "work", workType: "field", sswTest: "ssw1", age: "lt18", nationality: "other" },
  W19: { location: "abroad", identity: "none", activity: "work", workType: "entertain" },
  W20: { location: "japan", currentStatus: "ryugaku", identity: "none", activity: "work", workType: "graduate", graduateKind: "job46", edu: "univ", jlpt: "n1" },
  W21: { location: "japan", currentStatus: "ryugaku", identity: "none", activity: "work", workType: "graduate", graduateKind: "jobhunt" },
  W22: { location: "japan", currentStatus: "ryugaku", identity: "none", activity: "work", workType: "graduate", graduateKind: "naitei" },
  W23: { location: "abroad", identity: "none", activity: "work", workType: "whepa", whepaKind: "wh", age: "18to30", nationality: "wh" },
  W24: { location: "abroad", identity: "none", activity: "work", workType: "whepa", whepaKind: "epa", nationality: "epa" },
  W25: { location: "abroad", identity: "none", activity: "work", workType: "whepa", whepaKind: "housekeeper", nationality: "other" },
  W26: { location: "japan", currentStatus: "ryugaku", identity: "none", activity: "work", workType: "parttime" },
  W28: { location: "abroad", identity: "none", activity: "work", workType: "designated", designatedKind: "amateur" },
  W29: { location: "abroad", identity: "none", activity: "work", workType: "designated", designatedKind: "arbitration" },
  W30: { location: "abroad", identity: "none", activity: "work", workType: "designated", designatedKind: "research-it" },
  W31: { location: "abroad", identity: "none", activity: "work", workType: "designated", designatedKind: "manufacturing" },
  W32: { location: "abroad", identity: "none", activity: "work", workType: "designated", designatedKind: "ski" },
  W33: { location: "japan", currentStatus: "ginojisshu", identity: "none", activity: "work", workType: "designated", designatedKind: "ssw-prep" },
  W35: { location: "japan", currentStatus: "kodo", identity: "none", activity: "work", workType: "office", officeKind: "tech", edu: "univ", points: "ge80" },
  B1: { location: "abroad", identity: "none", activity: "business", businessType: "ready", capital: "ge30m", mgmtBg: "yes", jlpt: "n2", points: "lt70" },
  B2: { location: "abroad", identity: "none", activity: "business", businessType: "ready", capital: "ge30m", mgmtBg: "yes", jlpt: "n1", points: "ge70" },
  B1n: { location: "abroad", identity: "none", activity: "business", businessType: "ready", capital: "lt30m", mgmtBg: "yes", jlpt: "none", points: "lt70" },
  B3: { location: "japan", currentStatus: "ryugaku", identity: "none", activity: "business", businessType: "preparing" },
  B4: { location: "abroad", identity: "none", activity: "business", businessType: "manager" },
  B5: { location: "abroad", identity: "none", activity: "business", businessType: "small" },
  B6: { location: "japan", currentStatus: "keiei", identity: "none", activity: "business", businessType: "renew", capital: "lt30m" },
  B7: { location: "abroad", identity: "none", activity: "business", businessType: "zone" },
  L1: { location: "abroad", identity: "none", activity: "study", studyType: "school" },
  L2: { location: "abroad", identity: "none", activity: "study", studyType: "kenshu" },
  L3: { location: "abroad", identity: "none", activity: "study", studyType: "culture" },
  L4: { location: "abroad", identity: "none", activity: "study", studyType: "titp" },
  L5: { location: "abroad", identity: "none", activity: "study", studyType: "elementary" },
  L6: { location: "abroad", identity: "none", activity: "study", studyType: "intern" },
  F1: { location: "abroad", identity: "none", activity: "family", familySponsor: "work-study" },
  F2: { location: "abroad", identity: "none", activity: "family", familySponsor: "ssw1-titp" },
  F3: { location: "abroad", identity: "none", activity: "family", familySponsor: "ssw2-hsp" },
  F4: { location: "abroad", identity: "none", activity: "family", familySponsor: "designated" },
  F5: { location: "abroad", identity: "none", activity: "family", familySponsor: "jp-pr" },
  F6: { location: "abroad", identity: "none", activity: "family", familySponsor: "parent" },
  F7: { location: "abroad", identity: "none", activity: "family", familySponsor: "wh-short" },
  T1: { location: "abroad", identity: "none", activity: "short" },
  T2: { location: "abroad", identity: "none", activity: "other", otherType: "official" },
  T3: { location: "abroad", identity: "none", activity: "other", otherType: "religion" },
  T4: { location: "abroad", identity: "none", activity: "other", otherType: "media" },
  T5: { location: "abroad", identity: "none", activity: "other", otherType: "art" },
  T6: { location: "abroad", identity: "none", activity: "other", otherType: "medical" },
  T7: { location: "abroad", identity: "none", activity: "other", otherType: "nomad" },
  T8: { location: "abroad", identity: "none", activity: "other", otherType: "refugee" },
  W36: { location: "abroad", identity: "none", activity: "other", otherType: "zone" },
  T9: { location: "abroad", identity: "none", activity: "unknown" },
};

const leafIds = new Set(LEAVES.map((l) => l.id));
for (const id of leafIds) if (!(id in leafFixtures)) fail(`リーフ ${id} のフィクスチャがありません`);
for (const [id, ans] of Object.entries(leafFixtures)) {
  if (!leafIds.has(id)) { fail(`フィクスチャ ${id} に対応するリーフがありません`); continue; }
  const r = evaluate(ans);
  if (!r.leafIds.includes(id)) fail(`リーフ ${id} に到達しません（到達: ${r.leafIds.join(",") || "なし"}）`);
}
for (const l of LEAVES) for (const cnd of l.candidates) if (!STATUSES[cnd.code]) fail(`リーフ ${l.id} が未定義の在留資格コード "${cnd.code}" を参照`);

/* 3) §5-1 全在留資格が参照されている */
const referenced = new Set(LEAVES.flatMap((l) => l.candidates.map((x) => x.code)));
for (const code of Object.keys(STATUSES)) if (STATUSES[code].group !== "out" && !referenced.has(code)) fail(`在留資格 "${code}"（${STATUSES[code].name}）に到達するリーフがありません`);

/* 4) §5-3 シナリオ */
const scenarios: { name: string; a: Answers; expect: string[]; expertExpected?: boolean }[] = [
  { name: "ベトナム人留学生（大学4年・N1）が営業職へ", a: { standpoint: "self", location: "japan", currentStatus: "ryugaku", identity: "none", activity: "work", workType: "office", officeKind: "tech", edu: "univ", points: "lt70", wishes: [] }, expect: ["gijinkoku"] },
  { name: "中国人が日本人と結婚・海外在住", a: { location: "abroad", identity: "jp-spouse" }, expect: ["jp-spouse"] },
  { name: "ネパール人が外食で働きたい・試験未受験", a: { location: "abroad", identity: "none", activity: "work", workType: "field", sswTest: "none", age: "18to30", nationality: "other", wishes: ["family"] }, expect: ["ssw1", "titp"] },
  { name: "技能実習2号修了（建設）→残りたい", a: { location: "japan", currentStatus: "ginojisshu", identity: "none", activity: "work", workType: "field", sswTest: "titp2", age: "18to30", nationality: "other" }, expect: ["ssw1"] },
  { name: "韓国人が資本金500万で起業", a: { location: "abroad", identity: "none", activity: "business", businessType: "ready", capital: "lt30m", mgmtBg: "no", jlpt: "n1", points: "lt70" }, expect: ["keiei-kanri", "sa-startup"] },
  { name: "米国人ITエンジニア 海外子会社勤務1年", a: { location: "abroad", identity: "none", activity: "work", workType: "transfer", points: "ge70" }, expect: ["tenkin", "hsp1"] },
  { name: "フィリピン人 介護福祉士候補者", a: { location: "abroad", identity: "none", activity: "work", workType: "whepa", whepaKind: "epa", nationality: "epa" }, expect: ["sa-epa", "kaigo"] },
  { name: "日系ブラジル人3世", a: { location: "abroad", identity: "teiju", identityDetail: "nikkei3" }, expect: ["teijusha"] },
  { name: "日本人の配偶者と離婚", a: { location: "japan", currentStatus: "mibun", identity: "teiju", identityDetail: "divorce" }, expect: ["teijusha"], expertExpected: true },
  { name: "オーバーステイ", a: { location: "nostatus" }, expect: ["expert"], expertExpected: true },
  { name: "日本で出産", a: { location: "born" }, expect: ["shutoku-kyoka"] },
  { name: "家族滞在で高校卒業", a: { location: "japan", currentStatus: "kazoku", identity: "teiju", identityDetail: "kazoku-highschool" }, expect: ["teijusha"], expertExpected: true },
  { name: "フリーランスデザイナー", a: { location: "abroad", identity: "none", activity: "work", workType: "freelance", officeKind: "intl", edu: "univ", jlpt: "n1" }, expect: ["gijinkoku"], expertExpected: true },
  { name: "高度専門職1号で3年", a: { location: "japan", currentStatus: "kodo", identity: "none", activity: "work", workType: "office", officeKind: "tech", edu: "univ", points: "ge80" }, expect: ["hsp2"] },
  { name: "短期滞在者が就職したい", a: { location: "japan", currentStatus: "tanki", identity: "none", activity: "work", workType: "office", officeKind: "tech", edu: "univ", points: "lt70" }, expect: ["gijinkoku"] },
];
for (const s of scenarios) {
  const r = evaluate(s.a);
  const codes = r.candidates.map((x) => x.code);
  for (const e of s.expect) if (!codes.includes(e)) fail(`シナリオ「${s.name}」: 期待 ${e} が候補にない（候補: ${codes.join(",")}）`);
  if (s.expertExpected && !r.expert) fail(`シナリオ「${s.name}」: expert フラグが立っていない`);
}
// 短期滞在からの変更警告
{
  const r = evaluate(scenarios[scenarios.length - 1].a);
  if (!r.notes.some((n) => n.id === "R2w")) fail("短期滞在からの変更に警告 R2w が出ていない");
}

/* 5) 全経路の機械探索: 質問木を DFS で辿り、到達した末端すべてで候補≥1 */
let paths = 0;
let emptyResults = 0;
function dfs(a: Answers, depth: number) {
  const q = nextQuestion(a);
  if (!q) {
    paths++;
    const r = evaluate(a);
    if (r.candidates.length === 0) {
      emptyResults++;
      if (emptyResults <= 10) fail(`候補0件の経路: ${JSON.stringify(a)}`);
    }
    return;
  }
  if (depth > 12) { fail("質問が深すぎます"); return; }
  if (q.multi) {
    dfs({ ...a, [q.key]: [] }, depth + 1);
    dfs({ ...a, [q.key]: q.options.map((o) => o.value) }, depth + 1);
    return;
  }
  for (const o of q.options) dfs({ ...a, [q.key]: o.value } as Answers, depth + 1);
}
dfs({}, 0);
console.log(`経路探索: ${paths} 経路 / 候補0件: ${emptyResults}`);
console.log(`リーフ ${LEAVES.length} 件 / 在留資格カタログ ${Object.keys(STATUSES).length} 件 / 質問 ${QUESTIONS.length} 問`);

if (failures) {
  console.error(`\n検証失敗: ${failures} 件`);
  process.exit(1);
}
console.log("✔ visa-navi ルール検証 OK");
