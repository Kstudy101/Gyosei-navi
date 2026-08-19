/**
 * 在留資格判定ナビ — 質問定義（ウィザード）
 *   - 1画面1問。showIf で不要な質問をスキップ（docs/13 §2）
 *   - 個人を特定する自由入力は置かない（国籍は区分の選択のみ）
 */
import type { Answers } from "./statuses";

export type AnswerKey = keyof Answers;

export interface Option {
  value: string;
  label: string;
  desc?: string;
  icon: string;
}

export interface Question {
  key: AnswerKey;
  /** 画面見出し */
  title: string;
  /** 補足 */
  subtitle?: string;
  options: Option[];
  /** 複数選択（任意回答） */
  multi?: boolean;
  /** 「スキップ」可 */
  optional?: boolean;
  /** 表示条件 */
  showIf: (a: Answers) => boolean;
  /** 画面下部の小さな注記 */
  hint?: string;
}

const has = <K extends AnswerKey>(a: Answers, k: K, ...vals: NonNullable<Answers[K]>[]) =>
  a[k] !== undefined && (vals.length === 0 || (vals as unknown[]).includes(a[k]));

const inJapanOrAbroad = (a: Answers) => a.location === "abroad" || a.location === "japan";
const noIdentity = (a: Answers) => inJapanOrAbroad(a) && a.identity === "none";
const isWork = (a: Answers) => noIdentity(a) && a.activity === "work";
const workIs = (a: Answers, ...t: NonNullable<Answers["workType"]>[]) => isWork(a) && has(a, "workType", ...t);

export const QUESTIONS: Question[] = [
  {
    key: "standpoint",
    title: "どなたの在留資格を調べますか？",
    subtitle: "表示する注記が変わります（判定には影響しません）",
    options: [
      { value: "self", label: "自分・家族のこと", desc: "外国人本人、その家族・友人", icon: "🧑" },
      { value: "employer", label: "受け入れる側", desc: "採用する企業・学校・団体の担当者", icon: "🏢" },
    ],
    showIf: () => true,
  },
  {
    key: "location",
    title: "その方は今どこにいますか？",
    options: [
      { value: "abroad", label: "海外にいる", desc: "これから日本に来る", icon: "✈️" },
      { value: "japan", label: "日本にいる（在留資格あり）", desc: "在留カードまたは短期滞在で滞在中", icon: "🗾" },
      { value: "born", label: "日本で子どもが生まれた", desc: "出生から30日以内の手続", icon: "👶" },
      { value: "naturalize", label: "日本国籍を取りたい", desc: "帰化について知りたい", icon: "🇯🇵" },
      { value: "nostatus", label: "日本にいるが在留資格がない／期限が切れた", desc: "オーバーステイ等", icon: "⚠️" },
    ],
    showIf: () => true,
  },
  {
    key: "currentStatus",
    title: "今の在留資格は？",
    subtitle: "在留カードの「在留資格」欄をご覧ください",
    options: [
      { value: "ryugaku", label: "留学", icon: "🎓" },
      { value: "kazoku", label: "家族滞在", icon: "👨‍👩‍👧" },
      { value: "ginojisshu", label: "技能実習・育成就労", icon: "🏭" },
      { value: "tokutei-gino", label: "特定技能", icon: "🔧" },
      { value: "shuro", label: "就労資格（技人国・技能など）", icon: "💼" },
      { value: "keiei", label: "経営・管理", icon: "📈" },
      { value: "kodo", label: "高度専門職", icon: "⭐" },
      { value: "mibun", label: "日本人の配偶者等・永住者の配偶者等・定住者", icon: "💍" },
      { value: "tanki", label: "短期滞在", icon: "🧳" },
      { value: "other", label: "その他・特定活動", icon: "📄" },
    ],
    showIf: (a) => a.location === "japan",
  },
  {
    key: "identity",
    title: "日本人・永住者との家族関係はありますか？",
    subtitle: "家族関係がある場合、活動内容にかかわらず「身分」による在留資格が候補になります",
    options: [
      { value: "jp-spouse", label: "日本人と結婚している", icon: "💍" },
      { value: "jp-child", label: "日本人の子である", desc: "実子・特別養子・日系2世", icon: "👨‍👧" },
      { value: "pr-spouse", label: "永住者・特別永住者と結婚している", icon: "💑" },
      { value: "pr-child", label: "永住者の子として日本で生まれた", icon: "🍼" },
      { value: "teiju", label: "その他の家族関係・事情がある", desc: "日系3世・4世、連れ子、離婚・死別、難民 など", icon: "🌏" },
      { value: "none", label: "特にない", desc: "日本で行う活動で在留資格が決まります", icon: "➡️" },
    ],
    showIf: inJapanOrAbroad,
  },
  {
    key: "identityDetail",
    title: "どれに近いですか？",
    options: [
      { value: "nikkei3", label: "日系3世", desc: "祖父母が日本人", icon: "🌳" },
      { value: "nikkei4", label: "日系4世", desc: "曽祖父母が日本人", icon: "🌱" },
      { value: "tsureko", label: "日本人・永住者・定住者の配偶者の連れ子", desc: "未成年・未婚で扶養を受ける", icon: "🧒" },
      { value: "teiju-spouse", label: "定住者・日系3世と結婚している", icon: "💞" },
      { value: "pr-child-abroad", label: "永住者の子（海外で生まれた）", icon: "👶" },
      { value: "zanryu-refugee", label: "中国残留邦人等・第三国定住難民", icon: "🕊️" },
      { value: "evacuee", label: "避難民（ウクライナ等）", icon: "🛟" },
      { value: "divorce", label: "日本人と離婚・死別した／日本人の子を養育している", icon: "📄" },
      { value: "kazoku-highschool", label: "家族滞在で来日し、日本の高校を卒業して就職したい", icon: "🏫" },
      { value: "refugee", label: "難民認定を受けた・申請中", icon: "🏳️" },
    ],
    showIf: (a) => inJapanOrAbroad(a) && a.identity === "teiju",
  },
  {
    key: "activity",
    title: "日本で主に何をしますか？",
    options: [
      { value: "work", label: "雇われて働く", desc: "会社・学校・施設などに就職", icon: "💼" },
      { value: "business", label: "会社を経営する・起業する", icon: "📈" },
      { value: "study", label: "学ぶ・研修を受ける", desc: "留学・技能実習・文化研究など", icon: "🎓" },
      { value: "family", label: "日本にいる家族と暮らす", desc: "配偶者・親に扶養される", icon: "👨‍👩‍👧" },
      { value: "short", label: "90日以内の短期滞在", desc: "観光・商用・親族訪問", icon: "🧳" },
      { value: "other", label: "その他", desc: "外交・宗教・報道・芸術・医療滞在・ノマド・難民 など", icon: "📋" },
      { value: "unknown", label: "まだ決まっていない", icon: "🤔" },
    ],
    showIf: noIdentity,
  },
  /* ── work ── */
  {
    key: "workType",
    title: "どんな仕事ですか？",
    subtitle: "一番近いものを選んでください",
    options: [
      { value: "office", label: "専門職・オフィスワーク", desc: "エンジニア・事務・営業・通訳・デザイン・マーケ", icon: "💻" },
      { value: "field", label: "現場の仕事（人手不足分野）", desc: "介護・建設・外食・製造・農業・宿泊・運送 など19分野", icon: "🏗️" },
      { value: "transfer", label: "海外の同じ会社から日本へ転勤", icon: "🔁" },
      { value: "research-edu", label: "研究・教育", desc: "大学・研究所・学校の先生", icon: "🔬" },
      { value: "licensed", label: "日本の国家資格が必要な仕事", desc: "医師・看護師・弁護士・会計士・介護福祉士", icon: "🩺" },
      { value: "skilled", label: "熟練技能の仕事", desc: "外国料理の調理師・パイロット・スポーツ指導者 など", icon: "👨‍🍳" },
      { value: "entertain", label: "芸能・プロスポーツ", desc: "俳優・歌手・ダンサー・プロ選手", icon: "🎤" },
      { value: "graduate", label: "日本の大学等を卒業して就職／就職活動", icon: "🎓" },
      { value: "whepa", label: "ワーキングホリデー／EPA候補者／家事使用人", icon: "🌐" },
      { value: "designated", label: "特別な受入れ制度", desc: "指定機関の研究・IT、国際仲裁、製造業受入れ、スキー指導、アマチュア選手、特定技能の移行準備", icon: "🏷️" },
      { value: "freelance", label: "フリーランス・業務委託で働く", icon: "🧑‍💻" },
      { value: "parttime", label: "留学・家族滞在のままアルバイトしたい", icon: "🕒" },
    ],
    showIf: isWork,
  },
  {
    key: "officeKind",
    title: "仕事の内容はどちらに近いですか？",
    options: [
      { value: "tech", label: "技術・知識を使う仕事", desc: "エンジニア・経理・法務・営業企画・マーケ・設計", icon: "🛠️" },
      { value: "intl", label: "外国の文化・語学を使う仕事", desc: "通訳・翻訳・語学指導・海外取引・デザイン", icon: "🌍" },
    ],
    showIf: (a) => workIs(a, "office", "freelance"),
  },
  {
    key: "edu",
    title: "最終学歴は？",
    subtitle: "専攻と仕事の関連性が審査されます",
    options: [
      { value: "univ", label: "大学卒以上（海外の大学・短大を含む）", icon: "🎓" },
      { value: "senmon", label: "日本の専門学校卒（専門士・高度専門士）", icon: "🏫" },
      { value: "other", label: "それ以外（高卒など）", icon: "📘" },
    ],
    showIf: (a) => workIs(a, "office", "freelance") || (workIs(a, "graduate") && has(a, "graduateKind", "job46")),
  },
  {
    key: "exp",
    title: "その仕事の実務経験は？",
    options: [
      { value: "ge10", label: "10年以上", icon: "🔟" },
      { value: "ge3", label: "3年以上10年未満", icon: "3️⃣" },
      { value: "lt3", label: "3年未満", icon: "🆕" },
    ],
    showIf: (a) => (workIs(a, "office", "freelance") && a.edu === "other") || workIs(a, "skilled"),
  },
  {
    key: "points",
    title: "高度人材ポイントの目安は？",
    subtitle: "学歴・職歴・年収・年齢などの合計。わからなければ「不明」で構いません",
    options: [
      { value: "ge80", label: "80点以上", icon: "🌟" },
      { value: "ge70", label: "70点以上80点未満", icon: "⭐" },
      { value: "lt70", label: "70点未満・不明", icon: "➖" },
    ],
    showIf: (a) =>
      (workIs(a, "office") && a.edu === "univ") ||
      workIs(a, "transfer", "research-edu") ||
      (noIdentity(a) && a.activity === "business" && has(a, "businessType", "ready")),
  },
  {
    key: "researchKind",
    title: "どこで働きますか？",
    options: [
      { value: "univ", label: "大学・高専で研究・教育", icon: "🏛️" },
      { value: "lab", label: "企業・研究機関で研究", icon: "🔬" },
      { value: "school", label: "小中高・専修学校で教える", desc: "民間の語学学校は「専門職・オフィスワーク」", icon: "🏫" },
    ],
    showIf: (a) => workIs(a, "research-edu"),
  },
  {
    key: "licensedKind",
    title: "どの資格ですか？",
    options: [
      { value: "medical", label: "医師・歯科医師・看護師・薬剤師など", icon: "🩺" },
      { value: "legal", label: "弁護士・外国法事務弁護士・会計士・税理士など", icon: "⚖️" },
      { value: "kaigo", label: "介護福祉士", icon: "🤝" },
    ],
    showIf: (a) => workIs(a, "licensed"),
  },
  {
    key: "sswTest",
    title: "試験・技能実習の状況は？",
    options: [
      { value: "ssw1", label: "特定技能1号の技能試験＋日本語試験に合格", icon: "✅" },
      { value: "ssw2", label: "特定技能2号の評価試験に合格", icon: "🏅" },
      { value: "titp2", label: "技能実習2号を良好に修了（関連職種）", icon: "🏭" },
      { value: "none", label: "いずれもまだ", icon: "📝" },
    ],
    showIf: (a) => workIs(a, "field"),
  },
  {
    key: "age",
    title: "年齢は？",
    options: [
      { value: "lt18", label: "18歳未満", icon: "🧒" },
      { value: "18to30", label: "18〜30歳", icon: "🧑" },
      { value: "31to35", label: "31〜35歳", icon: "🧑‍💼" },
      { value: "ge36", label: "36歳以上", icon: "🧓" },
    ],
    showIf: (a) =>
      workIs(a, "field") ||
      (workIs(a, "whepa") && has(a, "whepaKind", "wh")) ||
      (inJapanOrAbroad(a) && a.identity === "teiju" && a.identityDetail === "nikkei4"),
  },
  {
    key: "nationality",
    title: "国籍はどれに当てはまりますか？",
    subtitle: "国名ではなく区分を選んでください",
    options: [
      { value: "wh", label: "ワーキングホリデー協定国", desc: "韓国・台湾・豪州・英仏独など", icon: "🤝" },
      { value: "epa", label: "EPA対象国", desc: "インドネシア・フィリピン・ベトナム", icon: "🏥" },
      { value: "nikkei4", label: "日系四世制度の対象国", desc: "ブラジル・ペルー等", icon: "🌎" },
      { value: "iran", label: "イラン", desc: "特定技能の対象外", icon: "🚫" },
      { value: "other", label: "その他", icon: "🌐" },
    ],
    showIf: (a) => workIs(a, "field") || workIs(a, "whepa"),
  },
  {
    key: "graduateKind",
    title: "今の状況は？",
    options: [
      { value: "job46", label: "卒業して接客など幅広い仕事に就きたい", desc: "特定活動46号", icon: "🛍️" },
      { value: "jobhunt", label: "卒業後も就職活動を続けたい", icon: "🔍" },
      { value: "naitei", label: "内定が出て採用日まで待ちたい", icon: "📨" },
    ],
    showIf: (a) => workIs(a, "graduate"),
  },
  {
    key: "jlpt",
    title: "日本語能力は？",
    options: [
      { value: "n1", label: "N1", icon: "🈷️" },
      { value: "n2", label: "N2", icon: "🈶" },
      { value: "n4", label: "N3・N4", icon: "🈚" },
      { value: "none", label: "それ以下・未受験", icon: "❔" },
    ],
    showIf: (a) =>
      (workIs(a, "graduate") && has(a, "graduateKind", "job46")) ||
      (workIs(a, "office") && a.officeKind === "intl") ||
      (inJapanOrAbroad(a) && a.identity === "teiju" && a.identityDetail === "nikkei4") ||
      (noIdentity(a) && a.activity === "business" && has(a, "businessType", "ready")),
  },
  {
    key: "whepaKind",
    title: "どの制度ですか？",
    options: [
      { value: "wh", label: "ワーキング・ホリデー", icon: "🏄" },
      { value: "epa", label: "EPA看護師・介護福祉士候補者", icon: "🏥" },
      { value: "housekeeper", label: "外交官・高度専門職等の家事使用人", icon: "🏠" },
    ],
    showIf: (a) => workIs(a, "whepa"),
  },
  {
    key: "designatedKind",
    title: "どの制度ですか？",
    options: [
      { value: "research-it", label: "法務大臣指定機関での研究・IT技術者", icon: "🧪" },
      { value: "arbitration", label: "外国弁護士として国際仲裁事件を代理", icon: "⚖️" },
      { value: "manufacturing", label: "海外子会社から製造業の受入れ事業", icon: "🏭" },
      { value: "ski", label: "スキーインストラクター", icon: "⛷️" },
      { value: "amateur", label: "報酬を受けるアマチュアスポーツ選手", icon: "🏃" },
      { value: "ssw-prep", label: "特定技能1号への移行準備", icon: "⏳" },
    ],
    showIf: (a) => workIs(a, "designated"),
  },
  /* ── business ── */
  {
    key: "businessType",
    title: "どの段階ですか？",
    options: [
      { value: "ready", label: "会社を設立して経営する（資金・人員・計画あり）", icon: "🏢" },
      { value: "preparing", label: "会社設立の準備中・起業支援を使いたい", icon: "🚀" },
      { value: "manager", label: "既存の会社に管理者（部長・支店長など）として雇われる", icon: "👔" },
      { value: "small", label: "個人事業・小規模で始めたい", icon: "🛒" },
      { value: "renew", label: "すでに経営・管理で在留中（更新が不安）", icon: "🔄" },
      { value: "zone", label: "国家戦略特区の創業人材事業", icon: "📍" },
    ],
    showIf: (a) => noIdentity(a) && a.activity === "business",
  },
  {
    key: "capital",
    title: "事業に投じる資金（資本金・出資等）は？",
    options: [
      { value: "ge30m", label: "3,000万円以上", icon: "💴" },
      { value: "lt30m", label: "3,000万円未満", icon: "💰" },
    ],
    showIf: (a) => noIdentity(a) && a.activity === "business" && has(a, "businessType", "ready", "renew"),
  },
  {
    key: "mgmtBg",
    title: "経営・管理の経験3年以上、または関連分野の修士以上の学位はありますか？",
    options: [
      { value: "yes", label: "ある", icon: "✅" },
      { value: "no", label: "ない", icon: "❌" },
    ],
    showIf: (a) => noIdentity(a) && a.activity === "business" && has(a, "businessType", "ready"),
  },
  /* ── study ── */
  {
    key: "studyType",
    title: "どこで・何を学びますか？",
    options: [
      { value: "school", label: "大学・専門学校・日本語学校・高校", icon: "🎓" },
      { value: "elementary", label: "小学校・中学校", icon: "🏫" },
      { value: "titp", label: "技能実習・育成就労", icon: "🏭" },
      { value: "kenshu", label: "企業で報酬なしの研修", icon: "📋" },
      { value: "culture", label: "日本文化・学術の研究（収入なし）", desc: "茶道・武道・研究など", icon: "🎎" },
      { value: "intern", label: "外国の大学生としてインターン・サマージョブ・文化交流", icon: "🧑‍🎓" },
    ],
    showIf: (a) => noIdentity(a) && a.activity === "study",
  },
  /* ── family ── */
  {
    key: "familySponsor",
    title: "日本にいる家族（扶養者）の在留資格は？",
    options: [
      { value: "work-study", label: "就労資格・留学・文化活動", desc: "技人国・経営管理・技能・留学 など", icon: "💼" },
      { value: "ssw2-hsp", label: "特定技能2号・高度専門職", icon: "⭐" },
      { value: "ssw1-titp", label: "特定技能1号・技能実習・育成就労", icon: "🔧" },
      { value: "designated", label: "特定活動", icon: "📄" },
      { value: "jp-pr", label: "日本人・永住者・定住者", desc: "→ 身分による在留資格へ", icon: "🇯🇵" },
      { value: "parent", label: "（自分が）高齢の親を日本に呼びたい", icon: "👵" },
      { value: "wh-short", label: "ワーキングホリデー・短期滞在", icon: "🧳" },
    ],
    showIf: (a) => noIdentity(a) && a.activity === "family",
  },
  /* ── other ── */
  {
    key: "otherType",
    title: "どれに近いですか？",
    options: [
      { value: "official", label: "外国政府・国際機関の公務", icon: "🏛️" },
      { value: "religion", label: "宗教活動（外国の宗教団体から派遣）", icon: "⛪" },
      { value: "media", label: "外国の報道機関の記者・カメラマン", icon: "📰" },
      { value: "art", label: "収入を伴う芸術活動", desc: "作曲・絵画・著述など", icon: "🎨" },
      { value: "medical", label: "医療を受ける・その付添い", icon: "🏥" },
      { value: "nomad", label: "長期観光・デジタルノマド", icon: "🏝️" },
      { value: "zone", label: "国家戦略特区の事業（美容師・家事支援）", icon: "📍" },
      { value: "refugee", label: "難民認定・保護を求める", icon: "🏳️" },
      { value: "undecided", label: "決まっていない", icon: "🤔" },
    ],
    showIf: (a) => noIdentity(a) && a.activity === "other",
  },
  /* ── wishes (multi, optional) ── */
  {
    key: "wishes",
    title: "当てはまるものがあれば選んでください（任意）",
    subtitle: "結果に注記を追加します",
    multi: true,
    optional: true,
    options: [
      { value: "family", label: "家族を呼びたい", icon: "👨‍👩‍👧" },
      { value: "long", label: "長く住みたい（5年以上・無期限）", icon: "🏠" },
      { value: "eiju", label: "将来は永住したい", icon: "🛂" },
      { value: "jobchange", label: "転職を予定している", icon: "🔁" },
      { value: "inadmissible", label: "退去強制歴・犯罪歴など心当たりがある", icon: "⚠️" },
    ],
    showIf: (a) => inJapanOrAbroad(a) && (a.identity !== "none" || a.activity !== undefined),
  },
];

/** 現在の回答で表示対象となる質問（順序つき） */
export function visibleQuestions(a: Answers): Question[] {
  return QUESTIONS.filter((q) => q.showIf(a));
}

/** 次に答えるべき質問（未回答の最初の表示対象） */
export function nextQuestion(a: Answers): Question | undefined {
  return visibleQuestions(a).find((q) => a[q.key] === undefined);
}
