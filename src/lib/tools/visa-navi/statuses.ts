/**
 * 在留資格判定ナビ — 結果カタログ
 *   - 入管法別表第一・第二の在留資格 29種 + 特定活動（告示号別）+ 在留資格以外の結果（資格外活動許可・取得許可 等）
 *   - 根拠: 入管庁「在留資格一覧表」(data/sources/gaikokujin-koyo/01) ほか各在留資格ページ
 *   - 設計書: docs/13_VISA_NAVI_SPEC.md §1
 *   - ここに無い在留資格名をルールが参照するとテスト (scripts/test-visa-navi.ts) が落ちる
 */

export type StatusGroup =
  | "identity" // 別表第二（身分・地位）
  | "work" // 別表第一の一・二（就労資格）
  | "nonwork" // 別表第一の三・四（非就労資格）
  | "designated" // 特定活動
  | "procedure" // 在留資格以外の結果（許可・申請種別）
  | "out"; // 対象外・専門家相談

export type FamilyPolicy = "yes" | "no" | "conditional" | "na";

export interface RequirementItem {
  /** 要件の短文（公表要件の要約） */
  text: string;
  /** 入力値から充足が確認できたか判定する（未定義なら常に「要確認」） */
  check?: (a: Answers) => "ok" | "ng" | "unknown";
}

export interface StatusMeta {
  code: string;
  /** 正式名（在留資格名） */
  name: string;
  /** カード見出し用の短い名 */
  short: string;
  group: StatusGroup;
  /** 一言説明 */
  summary: string;
  /** 在留期間（在留資格一覧表の原文ベース） */
  period: string;
  family: FamilyPolicy;
  familyNote?: string;
  /** 就労の範囲 */
  work: string;
  requirements: RequirementItem[];
  /** 入管庁等の一次情報 */
  sources: { label: string; url: string }[];
  /** サイト内記事（published のみ） */
  articles?: { label: string; href: string }[];
}

/** 回答型（questions.ts と共有） */
export type Answers = Partial<{
  standpoint: "self" | "employer";
  location: "abroad" | "japan" | "nostatus" | "born" | "naturalize";
  currentStatus:
    | "ryugaku"
    | "kazoku"
    | "ginojisshu"
    | "tanki"
    | "shuro"
    | "tokutei-gino"
    | "mibun"
    | "keiei"
    | "kodo"
    | "other";
  identity: "jp-spouse" | "jp-child" | "pr-spouse" | "pr-child" | "teiju" | "none";
  identityDetail:
    | "nikkei3"
    | "nikkei4"
    | "tsureko"
    | "teiju-spouse"
    | "pr-child-abroad"
    | "zanryu-refugee"
    | "divorce"
    | "kazoku-highschool"
    | "refugee"
    | "evacuee";
  activity: "work" | "business" | "study" | "family" | "short" | "other" | "unknown";
  workType:
    | "office"
    | "transfer"
    | "research-edu"
    | "licensed"
    | "skilled"
    | "field"
    | "entertain"
    | "graduate"
    | "whepa"
    | "designated"
    | "freelance"
    | "parttime";
  officeKind: "tech" | "intl";
  researchKind: "univ" | "lab" | "school";
  licensedKind: "medical" | "legal" | "kaigo";
  graduateKind: "job46" | "jobhunt" | "naitei";
  whepaKind: "wh" | "epa" | "housekeeper";
  designatedKind: "amateur" | "arbitration" | "research-it" | "manufacturing" | "ski" | "ssw-prep";
  edu: "univ" | "senmon" | "other";
  exp: "ge10" | "ge3" | "lt3";
  points: "ge80" | "ge70" | "lt70";
  jlpt: "n1" | "n2" | "n4" | "none";
  sswTest: "ssw1" | "ssw2" | "titp2" | "none";
  age: "lt18" | "18to30" | "31to35" | "ge36";
  nationality: "wh" | "epa" | "iran" | "nikkei4" | "other";
  businessType: "ready" | "preparing" | "manager" | "small" | "renew" | "zone";
  capital: "ge30m" | "lt30m";
  mgmtBg: "yes" | "no";
  studyType: "school" | "elementary" | "kenshu" | "titp" | "culture" | "intern";
  familySponsor: "work-study" | "ssw1-titp" | "ssw2-hsp" | "designated" | "jp-pr" | "parent" | "wh-short";
  otherType: "tourism" | "official" | "religion" | "media" | "art" | "medical" | "nomad" | "refugee" | "zone" | "undecided";
  wishes: ("family" | "long" | "eiju" | "jobchange" | "inadmissible")[];
}>;

const ISA = "https://www.moj.go.jp/isa";
const ICHIRAN = { label: "入管庁 在留資格一覧表", url: `${ISA}/applications/status/qaq5.html` };

const A = {
  gijinkoku: { label: "「技術・人文知識・国際業務」完全ガイド", href: "/guide/nyukan/gijinkoku-visa-guide" },
  keiei: { label: "「経営・管理」ビザの新要件", href: "/guide/nyukan/keiei-kanri-visa-2025" },
  ssw: { label: "特定技能1号・2号の全体像", href: "/guide/nyukan/tokutei-gino-1go-2go-zentaizo" },
  ikusei: { label: "育成就労制度 2027年4月施行", href: "/guide/nyukan/ikusei-shuro-2027" },
  shikakugai: { label: "資格外活動許可｜週28時間ルール", href: "/guide/nyukan/shikakugai-katsudo-28jikan" },
  hayamihyo: { label: "外国人雇用の在留資格 早見表", href: "/guide/nyukan/gaikokujin-koyo-zairyu-shikaku-hayamihyo" },
  koshin: { label: "在留期間更新でよくある不許可理由10選", href: "/guide/nyukan/zairyu-koshin-fukyoka-10sen" },
  eiju: { label: "永住許可ガイドライン改定案", href: "/guide/nyukan/eiju-guideline-kaitei-2026" },
  eijuTool: { label: "【診断】永住要件セルフチェック", href: "/tools/eiju-shindan" },
  kika: { label: "永住と帰化の比較", href: "/guide/nyukan/eiju-vs-kika-2027" },
  online: { label: "入管オンライン申請システム 実務マニュアル", href: "/practice/dx/nyukan-online-shinsei-manual" },
};

const unknown = () => "unknown" as const;

export const STATUSES: Record<string, StatusMeta> = {
  /* ─────────── 別表第二（身分） ─────────── */
  "jp-spouse": {
    code: "jp-spouse",
    name: "日本人の配偶者等",
    short: "日本人の配偶者等",
    group: "identity",
    summary: "日本人の配偶者・実子・特別養子として在留する資格。就労制限なし。",
    period: "5年・3年・1年・6月",
    family: "na",
    work: "制限なし",
    requirements: [
      { text: "日本人との法律上の婚姻、または日本人の実子・特別養子であること", check: (a) => (a.identity === "jp-spouse" || a.identity === "jp-child" ? "ok" : "unknown") },
      { text: "（配偶者）実体を伴った婚姻関係・同居・生計", check: unknown },
      { text: "身元保証人（日本人配偶者等）", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「日本人の配偶者等」", url: `${ISA}/applications/status/spouseorchildofjapanese.html` }],
    articles: [A.hayamihyo],
  },
  "pr-spouse": {
    code: "pr-spouse",
    name: "永住者の配偶者等",
    short: "永住者の配偶者等",
    group: "identity",
    summary: "永住者・特別永住者の配偶者、または永住者の子として日本で出生し引き続き在留する人の資格。就労制限なし。",
    period: "5年・3年・1年・6月",
    family: "na",
    work: "制限なし",
    requirements: [
      { text: "永住者・特別永住者との婚姻、または永住者の子として日本で出生し引き続き在留", check: (a) => (a.identity === "pr-spouse" || a.identity === "pr-child" ? "ok" : "unknown") },
      { text: "（配偶者）実体を伴った婚姻関係・生計", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「永住者の配偶者等」", url: `${ISA}/applications/status/spouseorchildofpermanentresident.html` }],
    articles: [A.hayamihyo],
  },
  teijusha: {
    code: "teijusha",
    name: "定住者",
    short: "定住者",
    group: "identity",
    summary: "法務大臣が特別な理由を考慮して居住を認める資格（日系3世・連れ子・中国残留邦人等の告示類型と告示外類型）。就労制限なし。",
    period: "5年・3年・1年・6月 または個々に指定（5年以内）",
    family: "na",
    work: "制限なし",
    requirements: [
      { text: "定住者告示（日系3世・配偶者・扶養を受ける未成年未婚の実子 等）のいずれかに該当、または告示外の特別な理由", check: (a) => (a.identity === "teiju" ? "unknown" : "unknown") },
      { text: "（日系3世）素行が善良であること", check: unknown },
      { text: "生計の維持", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「定住者」", url: `${ISA}/applications/status/longtermresident.html` }],
    articles: [A.hayamihyo],
  },
  eiju: {
    code: "eiju",
    name: "永住者",
    short: "永住者",
    group: "identity",
    summary: "在留期間無期限。要件は永住許可ガイドラインによる（2027年4月改定案あり）。",
    period: "無期限",
    family: "na",
    work: "制限なし",
    requirements: [
      { text: "素行善良・独立生計・国益適合（原則10年在留、うち就労資格等5年。身分・高度人材等の特例あり）", check: unknown },
      { text: "現に有する在留資格で最長の在留期間を有していること", check: unknown },
      { text: "納税・年金・健康保険等の公的義務の履行", check: unknown },
    ],
    sources: [{ label: "入管庁「永住許可に関するガイドライン」", url: `${ISA}/publications/materials/nyukan_nyukan50.html` }],
    articles: [A.eijuTool, A.eiju],
  },

  /* ─────────── 別表第一の一 ─────────── */
  diplomat: {
    code: "diplomat",
    name: "外交／公用",
    short: "外交・公用",
    group: "work",
    summary: "外国政府の外交使節団・領事機関、国際機関等の公務に従事する人とその家族。",
    period: "外交活動の期間／5年・3年・1年・3月・30日・15日",
    family: "yes",
    work: "公務の範囲",
    requirements: [{ text: "外国政府・国際機関からの派遣（公務）", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「公用」", url: `${ISA}/applications/status/official.html` }],
  },
  kyoju: {
    code: "kyoju",
    name: "教授",
    short: "教授",
    group: "work",
    summary: "日本の大学・高専等で研究・研究の指導・教育をする活動。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "大学等での研究・教育",
    requirements: [{ text: "大学・これに準ずる機関・高専との契約に基づく研究・教育", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「教授」", url: `${ISA}/applications/status/professor.html` }],
  },
  geijutsu: {
    code: "geijutsu",
    name: "芸術",
    short: "芸術",
    group: "work",
    summary: "収入を伴う音楽・美術・文学その他の芸術上の活動（興行を除く）。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "芸術活動",
    requirements: [{ text: "芸術活動で安定した収入を得て生活できること（実績）", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「芸術」", url: `${ISA}/applications/status/artist.html` }],
  },
  shukyo: {
    code: "shukyo",
    name: "宗教",
    short: "宗教",
    group: "work",
    summary: "外国の宗教団体から派遣された宗教家の布教その他の宗教上の活動。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "宗教活動",
    requirements: [{ text: "外国の宗教団体からの派遣", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「宗教」", url: `${ISA}/applications/status/religiousactivities.html` }],
  },
  hodo: {
    code: "hodo",
    name: "報道",
    short: "報道",
    group: "work",
    summary: "外国の報道機関との契約に基づく取材その他の報道上の活動。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "報道活動",
    requirements: [{ text: "外国の報道機関との契約", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「報道」", url: `${ISA}/applications/status/journalist.html` }],
  },

  /* ─────────── 別表第一の二 ─────────── */
  hsp1: {
    code: "hsp1",
    name: "高度専門職1号（イ・ロ・ハ）",
    short: "高度専門職1号",
    group: "work",
    summary: "学歴・職歴・年収・年齢等のポイントが70点以上の高度人材。在留期間5年、配偶者の就労・親の帯同等の優遇。",
    period: "5年",
    family: "yes",
    familyNote: "配偶者の就労（特定活動33号）・親の帯同（34号）・家事使用人の優遇あり",
    work: "指定機関での研究（イ）・専門業務（ロ）・経営（ハ）＋関連事業",
    requirements: [
      { text: "高度人材ポイント計算で70点以上", check: (a) => (a.points === "ge70" || a.points === "ge80" ? "ok" : a.points === "lt70" ? "ng" : "unknown") },
      { text: "活動類型（研究／専門・技術／経営）に応じた契約・基準（技人国・経営管理等の基準に準ずる）", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「高度専門職」", url: `${ISA}/applications/status/designatedactivities02_00004.html` }],
  },
  hsp2: {
    code: "hsp2",
    name: "高度専門職2号／特別高度人材（J-Skip）",
    short: "高度専門職2号",
    group: "work",
    summary: "高度専門職1号で3年以上活動した人が移行できる在留期間無期限の資格。J-Skipは年収等で1号に特別加算。",
    period: "無期限（2号）／5年（1号・J-Skip）",
    family: "yes",
    work: "1号の活動＋教授・技人国・技能等ほぼ全ての就労活動",
    requirements: [
      { text: "高度専門職1号で3年以上の活動（2号）", check: unknown },
      { text: "（J-Skip）修士＋年収2,000万円、または年収4,000万円 等", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「高度専門職」", url: `${ISA}/applications/status/designatedactivities02_00004.html` }],
  },
  "keiei-kanri": {
    code: "keiei-kanri",
    name: "経営・管理",
    short: "経営・管理",
    group: "work",
    summary: "日本で事業の経営を行い、または管理に従事する資格。2025年10月16日施行の新基準（資本金等3,000万円・常勤職員1名・日本語B2・経歴・事業計画の専門家確認）。",
    period: "5年・3年・1年・6月・4月・3月",
    family: "yes",
    work: "事業の経営・管理",
    requirements: [
      { text: "事業の用に供される財産の総額（資本金・出資）3,000万円以上", check: (a) => (a.capital === "ge30m" ? "ok" : a.capital === "lt30m" ? "ng" : "unknown") },
      { text: "日本人・永住者等の常勤職員1名以上の雇用", check: unknown },
      { text: "申請者または常勤職員のいずれかが日本語B2相当以上（JLPT N2等）", check: (a) => (a.jlpt === "n1" || a.jlpt === "n2" ? "ok" : "unknown") },
      { text: "経営・管理の経験3年以上、または関連分野の修士以上", check: (a) => (a.mgmtBg === "yes" ? "ok" : a.mgmtBg === "no" ? "ng" : "unknown") },
      { text: "事業計画書に中小企業診断士・公認会計士・税理士の確認", check: unknown },
      { text: "事業所の確保（自宅兼用は原則不可）", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「経営・管理」基準省令改正（令和7年10月16日施行）", url: `${ISA}/applications/resources/10_00237.html` }],
    articles: [A.keiei],
  },
  horitsu: {
    code: "horitsu",
    name: "法律・会計業務",
    short: "法律・会計業務",
    group: "work",
    summary: "外国法事務弁護士・外国公認会計士その他法律上資格を有する者が行う法律・会計業務。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "有資格業務",
    requirements: [{ text: "弁護士・外国法事務弁護士・公認会計士・税理士・行政書士等の日本での資格", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「法律・会計業務」", url: `${ISA}/applications/status/legalaccountingservices.html` }],
  },
  iryo: {
    code: "iryo",
    name: "医療",
    short: "医療",
    group: "work",
    summary: "医師・歯科医師・看護師等、法律上資格を有する者が行う医療業務。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "有資格の医療業務",
    requirements: [{ text: "日本の医師・歯科医師・薬剤師・看護師等の免許", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「医療」", url: `${ISA}/applications/status/medicalservices.html` }],
  },
  kenkyu: {
    code: "kenkyu",
    name: "研究",
    short: "研究",
    group: "work",
    summary: "日本の公私の機関との契約に基づいて研究を行う業務（教授を除く）。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "研究業務",
    requirements: [{ text: "修士以上または研究経験3年以上等＋日本人同等以上の報酬（基準省令）", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「研究」", url: `${ISA}/applications/status/researcher.html` }],
  },
  kyoiku: {
    code: "kyoiku",
    name: "教育",
    short: "教育",
    group: "work",
    summary: "小学校・中学校・高校・専修学校等で語学教育その他の教育をする活動。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "学校での教育",
    requirements: [{ text: "大学卒業等＋（語学教育）当該言語で12年以上の教育を受けていること 等", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「教育」", url: `${ISA}/applications/status/instructor.html` }],
  },
  gijinkoku: {
    code: "gijinkoku",
    name: "技術・人文知識・国際業務",
    short: "技人国",
    group: "work",
    summary: "自然科学・人文科学の知識を要する業務、または外国文化に基盤を有する業務（通訳・翻訳・デザイン等）。エンジニア・事務職の代表的な就労資格。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "専門的・技術的業務（単純労働は不可）",
    requirements: [
      {
        text: "関連科目を専攻した大学卒／専門士（相当程度の関連性）／実務経験10年（国際業務は3年、大卒の通訳翻訳語学指導は不要）",
        check: (a) => {
          if (a.workType !== "office" && a.workType !== "freelance") return "unknown";
          if (a.edu === "univ") return "ok";
          if (a.edu === "senmon") return "ok";
          if (a.officeKind === "intl" && a.exp && a.exp !== "lt3") return "ok";
          if (a.exp === "ge10") return "ok";
          if (a.edu === "other" && a.exp !== undefined && a.officeKind !== "intl") return "ng";
          return "unknown";
        },
      },
      { text: "日本の機関との契約（雇用・委任等）と業務内容の該当性", check: unknown },
      { text: "日本人と同等額以上の報酬", check: unknown },
      { text: "（対人の通訳・翻訳等）CEFR B2相当の言語能力（令和8年4月〜）", check: (a) => (a.officeKind !== "intl" ? "unknown" : a.jlpt === "n1" || a.jlpt === "n2" ? "ok" : "unknown") },
    ],
    sources: [ICHIRAN, { label: "入管庁「技術・人文知識・国際業務」", url: `${ISA}/applications/status/gijinkoku.html` }],
    articles: [A.gijinkoku],
  },
  tenkin: {
    code: "tenkin",
    name: "企業内転勤",
    short: "企業内転勤",
    group: "work",
    summary: "海外の本店・支店・関連会社から日本の事業所へ期間を定めて転勤し、技人国に当たる業務を行う活動。学歴要件なし。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "転勤先での技人国相当業務",
    requirements: [
      { text: "転勤直前に海外の事業所で1年以上継続して技人国相当業務に従事", check: unknown },
      { text: "日本人と同等額以上の報酬", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「企業内転勤」", url: `${ISA}/applications/status/intracompanytransfee.html` }],
    articles: [A.hayamihyo],
  },
  kaigo: {
    code: "kaigo",
    name: "介護",
    short: "介護",
    group: "work",
    summary: "介護福祉士の資格を有する者が介護・介護の指導を行う業務。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "介護業務",
    requirements: [
      { text: "介護福祉士の登録", check: unknown },
      { text: "日本人と同等額以上の報酬", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「介護」", url: `${ISA}/applications/status/nursingcare.html` }],
    articles: [A.ssw],
  },
  kogyo: {
    code: "kogyo",
    name: "興行",
    short: "興行",
    group: "work",
    summary: "演劇・演芸・演奏・スポーツ等の興行、その他の芸能活動（1号〜4号）。",
    period: "3年・1年・6月・3月・30日",
    family: "yes",
    work: "興行・芸能活動",
    requirements: [{ text: "興行の類型（1〜4号）ごとの基準（招へい機関・出演施設・報酬等）", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「興行」", url: `${ISA}/applications/status/entertainer.html` }],
  },
  gino: {
    code: "gino",
    name: "技能",
    short: "技能",
    group: "work",
    summary: "産業上の特殊な分野の熟練技能（外国料理の調理・外国特有の建築・宝石貴金属加工・スポーツ指導・航空機操縦・ソムリエ等）。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "熟練技能を要する業務",
    requirements: [
      { text: "分野ごとの実務経験年数（調理・建築・製品製造・宝石加工・動物調教・石油探査10年／スポーツ指導3年／ソムリエ5年 等）", check: (a) => (a.exp === "ge10" ? "ok" : a.exp === "lt3" ? "ng" : "unknown") },
      { text: "日本人と同等額以上の報酬", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「技能」", url: `${ISA}/applications/status/skilledlabor.html` }],
  },
  ssw1: {
    code: "ssw1",
    name: "特定技能1号",
    short: "特定技能1号",
    group: "work",
    summary: "人手不足の特定産業分野（19分野）で、相当程度の知識・経験を要する技能を持つ即戦力人材の資格。通算5年、家族帯同は原則不可。",
    period: "法務大臣が個々に指定（3年を超えない範囲）／通算5年",
    family: "no",
    familyNote: "人道上の例外を除き家族帯同不可。2号へ移行すると可",
    work: "指定された分野・機関での業務",
    requirements: [
      { text: "分野別の技能試験＋日本語試験（N4等）に合格、または技能実習2号を良好に修了（関連職種）", check: (a) => (a.sswTest === "ssw1" || a.sswTest === "titp2" ? "ok" : a.sswTest === "none" ? "ng" : "unknown") },
      { text: "18歳以上・健康状態良好", check: (a) => (a.age === "lt18" ? "ng" : a.age ? "ok" : "unknown") },
      { text: "退去強制令書の執行に協力する国の旅券（イラン除く）", check: (a) => (a.nationality === "iran" ? "ng" : a.nationality ? "ok" : "unknown") },
      { text: "通算在留5年未満・保証金等なし", check: unknown },
      { text: "受入れ機関の基準（同等報酬・支援計画・届出）", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「特定技能」", url: `${ISA}/applications/status/specifiedskilledworker.html` }],
    articles: [A.ssw],
  },
  ssw2: {
    code: "ssw2",
    name: "特定技能2号",
    short: "特定技能2号",
    group: "work",
    summary: "熟練した技能を要する業務（11分野）。在留期間の更新回数に制限がなく、家族帯同可。1号を経なくても試験合格で取得可。",
    period: "3年・2年・1年・6月",
    family: "yes",
    work: "指定された分野・機関での熟練業務",
    requirements: [
      { text: "分野別の2号評価試験等に合格（＋分野により実務経験）", check: (a) => (a.sswTest === "ssw2" ? "ok" : a.sswTest ? "ng" : "unknown") },
      { text: "18歳以上・健康状態良好", check: (a) => (a.age === "lt18" ? "ng" : a.age ? "ok" : "unknown") },
    ],
    sources: [ICHIRAN, { label: "入管庁「特定技能」", url: `${ISA}/applications/status/specifiedskilledworker.html` }],
    articles: [A.ssw],
  },
  titp: {
    code: "titp",
    name: "技能実習（→ 2027年4月 育成就労）",
    short: "技能実習／育成就労",
    group: "work",
    summary: "認定を受けた技能実習計画に基づく活動。2027年4月1日に育成就労制度へ移行し、新規受入れは育成就労で行われる。",
    period: "法務大臣が個々に指定（1号1年／2・3号2年以内）",
    family: "no",
    work: "認定計画の範囲のみ（アルバイト不可）",
    requirements: [
      { text: "監理団体（監理支援機関）・受入れ企業による計画認定", check: unknown },
      { text: "（育成就労）3年で特定技能1号水準を目指す育成・就労。転籍は一定条件で可", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「技能実習」", url: `${ISA}/applications/status/technicalinterntraining.html` }],
    articles: [A.ikusei],
  },

  /* ─────────── 別表第一の三・四 ─────────── */
  bunka: {
    code: "bunka",
    name: "文化活動",
    short: "文化活動",
    group: "nonwork",
    summary: "収入を伴わない学術・芸術上の活動、日本特有の文化・技芸の専門的研究・専門家の指導を受ける活動。",
    period: "3年・1年・6月・3月",
    family: "yes",
    work: "不可（資格外活動許可があれば個別に可）",
    requirements: [{ text: "活動の実績・計画と滞在費用の支弁能力", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「文化活動」", url: `${ISA}/applications/status/culturalactivities.html` }],
  },
  tanki: {
    code: "tanki",
    name: "短期滞在",
    short: "短期滞在",
    group: "nonwork",
    summary: "観光・保養・商用・親族訪問・会議参加等の短期間の滞在。就労は一切不可。",
    period: "90日・30日・15日以内",
    family: "na",
    work: "不可（報酬を受ける活動は一切不可）",
    requirements: [{ text: "滞在目的が短期の観光・商用等であること（査証免除国以外は査証）", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「短期滞在」", url: `${ISA}/applications/status/temporaryvisitor.html` }],
    articles: [A.hayamihyo],
  },
  ryugaku: {
    code: "ryugaku",
    name: "留学",
    short: "留学",
    group: "nonwork",
    summary: "大学・高専・高校・専修学校・日本語学校等で教育を受ける活動。アルバイトは資格外活動許可（週28時間）が必要。",
    period: "法務大臣が個々に指定（4年3月を超えない範囲）",
    family: "conditional",
    familyNote: "配偶者・子は家族滞在（扶養能力が前提）",
    work: "不可（資格外活動許可で週28時間以内）",
    requirements: [
      { text: "教育機関への入学許可", check: unknown },
      { text: "学費・生活費の支弁能力", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「留学」", url: `${ISA}/applications/status/student.html` }],
    articles: [A.shikakugai],
  },
  kenshu: {
    code: "kenshu",
    name: "研修",
    short: "研修",
    group: "nonwork",
    summary: "日本の機関に受け入れられて技能等を修得する活動（報酬を受ける実務作業は不可）。",
    period: "1年・6月・3月",
    family: "no",
    work: "不可",
    requirements: [{ text: "実務作業を伴わない研修計画（実務作業を伴う場合は技能実習・育成就労）", check: unknown }],
    sources: [ICHIRAN, { label: "入管庁「研修」", url: `${ISA}/applications/status/trainee.html` }],
  },
  "kazoku-taizai": {
    code: "kazoku-taizai",
    name: "家族滞在",
    short: "家族滞在",
    group: "nonwork",
    summary: "就労資格・留学・文化活動等で在留する人の扶養を受ける配偶者・子の資格。アルバイトは資格外活動許可（週28時間）。",
    period: "法務大臣が個々に指定（5年を超えない範囲）",
    family: "na",
    work: "不可（資格外活動許可で週28時間以内）",
    requirements: [
      { text: "扶養者が家族滞在の対象となる在留資格（教授〜特定技能2号・文化活動・留学）で在留", check: (a) => (a.familySponsor === "work-study" || a.familySponsor === "ssw2-hsp" ? "ok" : a.familySponsor === "ssw1-titp" ? "ng" : "unknown") },
      { text: "扶養者の扶養能力（収入）", check: unknown },
    ],
    sources: [ICHIRAN, { label: "入管庁「家族滞在」", url: `${ISA}/applications/status/dependent.html` }],
    articles: [A.shikakugai],
  },

  /* ─────────── 特定活動（告示） ─────────── */
  "sa-housekeeper": {
    code: "sa-housekeeper",
    name: "特定活動（家事使用人：告示1・2号）",
    short: "特定活動（家事使用人）",
    group: "designated",
    summary: "外交官・高度専門職等（一定年収）に雇用される家事使用人。",
    period: "5年・3年・1年・6月・3月 等",
    family: "no",
    work: "雇用主の家事のみ",
    requirements: [{ text: "雇用主の在留資格・年収等の要件、月額報酬等", check: unknown }],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  "sa-wh": {
    code: "sa-wh",
    name: "特定活動（ワーキング・ホリデー：告示5号）",
    short: "ワーキング・ホリデー",
    group: "designated",
    summary: "協定国の18〜30歳の青少年が休暇を主目的に滞在し、付随的に就労できる制度。",
    period: "1年（国により異なる）",
    family: "no",
    work: "可（風俗営業等を除く）",
    requirements: [
      { text: "ワーキング・ホリデー協定国の国籍", check: (a) => (a.nationality === "wh" ? "ok" : a.nationality ? "ng" : "unknown") },
      { text: "申請時18〜30歳（国により25歳）", check: (a) => (a.age === "18to30" ? "ok" : a.age ? "ng" : "unknown") },
      { text: "在外公館での査証取得", check: unknown },
    ],
    sources: [{ label: "外務省「ワーキング・ホリデー制度」", url: "https://www.mofa.go.jp/mofaj/toko/visa/working_h.html" }],
  },
  "sa-amateur": {
    code: "sa-amateur",
    name: "特定活動（アマチュアスポーツ選手：告示6号）",
    short: "特定活動（アマチュアスポーツ）",
    group: "designated",
    summary: "日本の公私の機関に雇用され報酬を受けるアマチュアスポーツ選手（オリンピック等出場経験等）。",
    period: "個々に指定",
    family: "yes",
    familyNote: "家族は告示7号",
    work: "スポーツ活動",
    requirements: [{ text: "月額25万円以上の報酬等の基準", check: unknown }],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  "sa-arbitration": {
    code: "sa-arbitration",
    name: "特定活動（国際仲裁代理：告示8号）",
    short: "特定活動（国際仲裁）",
    group: "designated",
    summary: "外国弁護士が国際仲裁事件の手続を代理する活動。",
    period: "個々に指定",
    family: "no",
    work: "国際仲裁代理",
    requirements: [{ text: "外国の弁護士資格・依頼", check: unknown }],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  "sa-intern": {
    code: "sa-intern",
    name: "特定活動（インターンシップ・サマージョブ・国際文化交流：告示9・12・15号）",
    short: "特定活動（インターン等）",
    group: "designated",
    summary: "外国の大学生が単位取得のためのインターンシップ（9号）、休暇中の就労（12号）、地方公共団体等での文化交流（15号）を行う活動。報酬なし・短期なら短期滞在。",
    period: "1年以内（9号）／3月以内（12・15号）等",
    family: "no",
    work: "インターン先等での活動",
    requirements: [{ text: "外国の大学に在籍・大学と受入れ機関の契約（9号）等", check: unknown }],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  "sa-epa": {
    code: "sa-epa",
    name: "特定活動（EPA看護師・介護福祉士候補者：告示16〜31号）",
    short: "特定活動（EPA）",
    group: "designated",
    summary: "インドネシア・フィリピン・ベトナムとの経済連携協定に基づく看護師・介護福祉士候補者とその家族。",
    period: "個々に指定",
    family: "conditional",
    work: "受入れ施設での就労・研修",
    requirements: [
      { text: "EPA対象国（インドネシア・フィリピン・ベトナム）の国籍", check: (a) => (a.nationality === "epa" ? "ok" : a.nationality ? "ng" : "unknown") },
      { text: "送出し機関・受入れ調整機関（JICWELS）を通じたマッチング", check: unknown },
    ],
    sources: [{ label: "厚生労働省「EPAに基づく外国人看護師・介護福祉士候補者の受入れ」", url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/gaikokujin/other22/index.html" }],
  },
  "sa-hsp-family": {
    code: "sa-hsp-family",
    name: "特定活動（高度専門職の配偶者の就労・親の帯同：告示33・34号）",
    short: "特定活動（高度専門職の家族）",
    group: "designated",
    summary: "高度専門職外国人の配偶者がフルタイムで就労（33号）、一定の場合に親を帯同（34号）できる優遇。",
    period: "高度専門職本人に準ずる",
    family: "na",
    work: "（33号）技人国等の業務",
    requirements: [{ text: "世帯年収・子の養育等の条件（34号）", check: unknown }],
    sources: [{ label: "入管庁「高度専門職」", url: `${ISA}/applications/status/designatedactivities02_00004.html` }],
  },
  "sa-research-it": {
    code: "sa-research-it",
    name: "特定活動（特定研究等活動・特定情報処理活動：告示36・37号）",
    short: "特定活動（指定機関の研究・IT）",
    group: "designated",
    summary: "法務大臣が指定する機関で研究・研究指導・教育（36号）またはIT技術者（37号）として活動。家族38号・親39号。",
    period: "5年・3年・1年・3月",
    family: "yes",
    work: "指定機関での研究・IT業務",
    requirements: [{ text: "指定機関との契約・学歴等", check: unknown }],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  "sa-tourism": {
    code: "sa-tourism",
    name: "特定活動（観光・保養の長期滞在／デジタルノマド：告示40・41／53・54号）",
    short: "特定活動（長期観光・ノマド）",
    group: "designated",
    summary: "一定の資産を有する人の1年以内の観光・保養滞在（40・41号）、年収1,000万円以上等のリモートワーカーの6月以内の滞在（53・54号）。",
    period: "1年以内（40号）／6月（53号）",
    family: "conditional",
    familyNote: "配偶者（41号）・配偶者と子（54号）",
    work: "（ノマド）海外の所属先の業務のみ",
    requirements: [{ text: "資産・年収・民間医療保険等の要件、対象国", check: unknown }],
    sources: [{ label: "入管庁「デジタルノマド」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  "sa-manufacturing": {
    code: "sa-manufacturing",
    name: "特定活動（製造業外国従業員受入事業：告示42号）",
    short: "特定活動（製造業受入れ）",
    group: "designated",
    summary: "海外子会社等の従業員を日本の製造拠点で受け入れ、技能向上を図る経済産業省の事業。",
    period: "1年以内",
    family: "no",
    work: "受入れ企業での業務",
    requirements: [{ text: "経済産業省の計画認定", check: unknown }],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  "sa-nikkei4": {
    code: "sa-nikkei4",
    name: "特定活動（日系四世：告示43号）",
    short: "特定活動（日系四世）",
    group: "designated",
    summary: "18〜35歳の日系4世が日本文化を習得しつつ最長5年滞在できる制度（受入れサポーターが必要）。就労可。",
    period: "個々に指定（通算5年）",
    family: "no",
    work: "可",
    requirements: [
      { text: "18歳以上35歳以下", check: (a) => (a.age === "18to30" || a.age === "31to35" ? "ok" : a.age ? "ng" : "unknown") },
      { text: "日本語能力（N4相当等）・受入れサポーター", check: (a) => (a.jlpt && a.jlpt !== "none" ? "ok" : "unknown") },
    ],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  "sa-startup": {
    code: "sa-startup",
    name: "特定活動（外国人起業活動促進事業・未来創造人材：告示44・51号）／経営・管理（4月）",
    short: "特定活動（起業準備）",
    group: "designated",
    summary: "地方自治体の起業支援事業（スタートアップビザ）や未来創造人材制度、または会社設立前の「経営・管理（4月）」で起業準備を行う枠。",
    period: "6月〜1年（起業活動）／4月（経営・管理）",
    family: "conditional",
    work: "起業準備活動",
    requirements: [
      { text: "自治体・大学の確認証明書（44・51号）", check: unknown },
      { text: "終了時までに経営・管理の基準（新基準）を満たす見込み", check: unknown },
    ],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
    articles: [A.keiei],
  },
  "sa-graduate46": {
    code: "sa-graduate46",
    name: "特定活動（本邦大学卒業者：告示46号）",
    short: "特定活動46号",
    group: "designated",
    summary: "日本の大学・大学院を卒業しN1相当の日本語能力を持つ人が、接客等を含む幅広い業務で常勤就労できる資格。",
    period: "5年・3年・1年・6月・3月",
    family: "yes",
    familyNote: "家族は告示47号",
    work: "日本語を用いる幅広い業務（常勤・同等報酬）",
    requirements: [
      { text: "日本の大学（短大除く）・大学院の卒業・修了（専門学校は高度専門士のみ）", check: (a) => (a.edu === "univ" ? "ok" : a.edu ? "ng" : "unknown") },
      { text: "日本語能力試験N1またはBJT480点以上", check: (a) => (a.jlpt === "n1" ? "ok" : a.jlpt ? "ng" : "unknown") },
      { text: "常勤・日本人同等以上の報酬", check: unknown },
    ],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  "sa-ski": {
    code: "sa-ski",
    name: "特定活動（スキーインストラクター：告示50号）",
    short: "特定活動（スキー指導）",
    group: "designated",
    summary: "一定の資格・経験を有するスキーインストラクターの季節的な就労。",
    period: "個々に指定",
    family: "no",
    work: "スキー指導",
    requirements: [{ text: "国際スキー教師連盟の資格等", check: unknown }],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  /* ─────────── 特定活動（告示外） ─────────── */
  "sa-jobhunt": {
    code: "sa-jobhunt",
    name: "特定活動（継続就職活動／内定者）",
    short: "特定活動（就職活動・内定）",
    group: "designated",
    summary: "大学等を卒業した留学生が卒業後も就職活動を続ける（6月×2回）、または内定後採用まで待機するための在留。",
    period: "6月（更新1回）",
    family: "conditional",
    work: "不可（資格外活動許可で週28時間）",
    requirements: [
      { text: "日本の大学・専門学校（専門士）等の卒業", check: (a) => (a.edu === "univ" || a.edu === "senmon" ? "ok" : "unknown") },
      { text: "卒業した教育機関の推薦状・在留状況良好", check: unknown },
      { text: "（内定者）内定後1年以内・卒業後1年6月以内の採用、企業の誓約", check: unknown },
    ],
    sources: [{ label: "入管庁「大学等を卒業後就職活動のための滞在をご希望のみなさまへ」", url: `${ISA}/applications/resources/nyukan_nyukan84.html` }],
  },
  "sa-medical": {
    code: "sa-medical",
    name: "特定活動（医療滞在・付添い）",
    short: "特定活動（医療滞在）",
    group: "designated",
    summary: "日本の医療機関で治療等を受けるための滞在と、その付添人。",
    period: "個々に指定（最長1年）",
    family: "conditional",
    work: "不可",
    requirements: [{ text: "医療機関の受入れ・身元保証機関", check: unknown }],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },
  "sa-ssw-prep": {
    code: "sa-ssw-prep",
    name: "特定活動（特定技能1号への移行準備）",
    short: "特定活動（特定技能 移行準備）",
    group: "designated",
    summary: "技能実習修了者・試験合格者等が特定技能1号の申請準備のために就労しながら在留できる特例措置。",
    period: "4月・6月 等",
    family: "no",
    work: "移行予定の受入れ機関での就労",
    requirements: [{ text: "特定技能1号の要件を満たす見込み・受入れ機関の同意", check: unknown }],
    sources: [{ label: "入管庁「特定技能」", url: `${ISA}/applications/status/specifiedskilledworker.html` }],
    articles: [A.ssw],
  },
  "sa-zone": {
    code: "sa-zone",
    name: "特定活動（国家戦略特区：家事支援・美容師・創業人材）",
    short: "特定活動（特区事業）",
    group: "designated",
    summary: "国家戦略特別区域の認定事業（外国人家事支援人材・外国人美容師育成・外国人創業人材）で対象自治体に限り認められる活動。",
    period: "事業ごと",
    family: "no",
    work: "特区事業の範囲",
    requirements: [{ text: "対象自治体・特定機関の認定", check: unknown }],
    sources: [{ label: "内閣府「国家戦略特区」", url: "https://www.chisou.go.jp/tiiki/kokusentoc/" }],
  },
  "sa-other": {
    code: "sa-other",
    name: "特定活動（告示外・人道配慮等）",
    short: "特定活動（告示外）",
    group: "designated",
    summary: "老親扶養、特定技能1号の家族、難民認定申請中、避難民、高校卒業内定者など、告示に無い個別事情で法務大臣が指定する活動。一般的な基準は公表されていません。",
    period: "個々に指定",
    family: "na",
    work: "指定内容による",
    requirements: [{ text: "個別の人道的事情・総合判断（公表基準なし）", check: unknown }],
    sources: [{ label: "入管庁「特定活動」", url: `${ISA}/applications/status/designatedactivities.html` }],
  },

  /* ─────────── 在留資格以外の結果 ─────────── */
  "shikakugai-kyoka": {
    code: "shikakugai-kyoka",
    name: "資格外活動許可（在留資格の変更ではありません）",
    short: "資格外活動許可",
    group: "procedure",
    summary: "留学・家族滞在等のまま、1週28時間以内（留学生は長期休業中1日8時間以内）のアルバイトを認める許可。風俗営業等は不可。",
    period: "現在の在留期間内",
    family: "na",
    work: "1週28時間以内（包括許可）",
    requirements: [
      { text: "現在の在留資格の活動を行っていること（在籍中など）", check: unknown },
      { text: "風俗営業・性風俗関連営業所での就労でないこと", check: unknown },
    ],
    sources: [{ label: "入管庁「資格外活動許可について」", url: `${ISA}/applications/procedures/nyuukokukanri07_00045.html` }],
    articles: [A.shikakugai],
  },
  "shutoku-kyoka": {
    code: "shutoku-kyoka",
    name: "在留資格取得許可（日本で出生した子）",
    short: "在留資格取得許可",
    group: "procedure",
    summary: "日本で生まれた外国籍の子は、出生から30日以内に在留資格取得許可申請が必要（60日を超えて在留資格なく滞在すると退去強制事由）。父母の在留資格に応じて家族滞在・日本人の配偶者等・永住者の配偶者等・定住者等が決定されます。",
    period: "父母の在留資格に応じて決定",
    family: "na",
    work: "—",
    requirements: [
      { text: "出生から30日以内に地方出入国在留管理局へ申請（出生届・父母の在留カード等）", check: unknown },
      { text: "父母の在留資格に応じた在留資格（家族滞在／日本人の配偶者等／永住者の配偶者等／定住者）", check: unknown },
    ],
    sources: [{ label: "入管庁「在留資格取得許可申請」", url: `${ISA}/applications/procedures/16-4.html` }],
  },
  kika: {
    code: "kika",
    name: "帰化（日本国籍の取得）",
    short: "帰化",
    group: "procedure",
    summary: "在留資格ではなく、法務局への帰化許可申請による日本国籍の取得。永住との違いは別記事で整理しています。",
    period: "—",
    family: "na",
    work: "—",
    requirements: [
      { text: "引き続き5年以上の居住・素行・生計・重国籍防止 等（国籍法5条）", check: unknown },
    ],
    sources: [{ label: "法務省「国籍Q&A」", url: "https://www.moj.go.jp/MINJI/minji78.html" }],
    articles: [A.kika],
  },
  expert: {
    code: "expert",
    name: "公表された一般的な基準がない領域（有資格者への相談を推奨）",
    short: "個別判断の領域",
    group: "out",
    summary: "在留特別許可・告示外の定住・人道配慮など、入管庁が一般的な基準を公表しておらず個別事情の総合判断となる領域です。本ナビでは候補を示さず、行政書士等の有資格者への相談をおすすめします。",
    period: "—",
    family: "na",
    work: "—",
    requirements: [],
    sources: [{ label: "日本行政書士会連合会「行政書士を探す」", url: "https://www.gyosei.or.jp/members-search/" }],
  },
  none: {
    code: "none",
    name: "該当する在留資格が見当たりません",
    short: "該当なし",
    group: "out",
    summary: "入力いただいた条件では、公表されている一般的な要件に当てはまる在留資格が見当たりませんでした。条件の選び直し（別の働き方・分野）や、要件を満たすための準備（試験・学歴・資金等）を確認してください。",
    period: "—",
    family: "na",
    work: "—",
    requirements: [],
    sources: [ICHIRAN],
    articles: [A.hayamihyo],
  },
};

export type StatusCode = keyof typeof STATUSES;
