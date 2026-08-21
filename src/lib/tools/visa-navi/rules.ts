/**
 * 在留資格判定ナビ — 判定ルール（docs/13_VISA_NAVI_SPEC.md §3・§4 の 87 リーフ + 横断注記 11）
 *   - evaluate() は純粋関数。入力は Answers、出力は候補・注記・ルート。
 *   - 「判定」ではなく「候補の提示」: candidates は公表要件との照合対象を列挙するだけで可否を示さない。
 *   - scripts/test-visa-navi.ts が全リーフの到達性と STATUSES との整合を検証する。
 */
import { STATUSES, type Answers, type StatusCode } from "./statuses";

export interface Candidate {
  code: StatusCode;
  /** 並び順（小さいほど上） */
  priority: number;
  /** この候補が挙がった理由（1行） */
  reason: string;
}

export interface Leaf {
  id: string;
  match: (a: Answers) => boolean;
  candidates: Candidate[];
  /** 結果カードの注記 */
  notes?: string[];
  /** 公表基準のない領域 → 有資格者への相談推奨を強制表示 */
  expert?: boolean;
}

export interface Note {
  id: string;
  tone: "info" | "warn";
  text: string;
  href?: string;
  hrefLabel?: string;
}

export interface Route {
  id: "R1" | "R2" | "R3" | "R4" | "none";
  title: string;
  text: string;
  href?: string;
  hrefLabel?: string;
}

export interface Result {
  leafIds: string[];
  candidates: Candidate[];
  expert: boolean;
  notes: Note[];
  route: Route;
}

const c = (code: StatusCode, priority: number, reason: string): Candidate => ({ code, priority, reason });
const act = (a: Answers) => a.identity === "none";
const w = (a: Answers, t: NonNullable<Answers["workType"]>) => act(a) && a.activity === "work" && a.workType === t;
const inad = (a: Answers) => a.nationality === "iran" || a.age === "lt18";

export const LEAVES: Leaf[] = [
  /* ────────── 入口リーフ (docs/13 §3) ────────── */
  { id: "T10", match: (a) => a.location === "nostatus", candidates: [c("expert", 1, "在留資格がない状態での在留特別許可・出国命令等は個別判断です")], expert: true,
    notes: ["速やかに地方出入国在留管理官署に出頭・相談してください。本ナビでは候補を提示しません。"] },
  { id: "R4", match: (a) => a.location === "born", candidates: [c("shutoku-kyoka", 1, "日本で出生した子は出生から30日以内の在留資格取得許可申請")],
    notes: ["父母の在留資格に応じて「家族滞在」「日本人の配偶者等」「永住者の配偶者等」「定住者」等が決定されます。"] },
  { id: "S13", match: (a) => a.location === "naturalize", candidates: [c("kika", 1, "帰化は在留資格ではなく国籍取得の手続です")] },

  /* ────────── 身分系 (§4-A) ────────── */
  { id: "S1", match: (a) => a.identity === "jp-spouse", candidates: [c("jp-spouse", 1, "日本人の配偶者")] },
  { id: "S2", match: (a) => a.identity === "jp-child", candidates: [c("jp-spouse", 1, "日本人の実子・特別養子（日系2世を含む）")] },
  { id: "S3", match: (a) => a.identity === "pr-spouse", candidates: [c("pr-spouse", 1, "永住者・特別永住者の配偶者")] },
  { id: "S4", match: (a) => a.identity === "pr-child", candidates: [c("pr-spouse", 1, "永住者の子として日本で出生し引き続き在留")] },
  { id: "S5", match: (a) => a.identityDetail === "nikkei3", candidates: [c("teijusha", 1, "日系3世（定住者告示3・4号）")], notes: ["素行が善良であることが要件です。"] },
  { id: "S6", match: (a) => a.identityDetail === "pr-child-abroad", candidates: [c("teijusha", 1, "永住者の子（海外出生）：定住者告示6号")], notes: ["未成年・未婚で扶養を受けることが要件です。"] },
  { id: "S7", match: (a) => a.identityDetail === "tsureko", candidates: [c("teijusha", 1, "連れ子（定住者告示6号）")], notes: ["未成年・未婚で扶養を受けることが要件です。"] },
  { id: "S8", match: (a) => a.identityDetail === "teiju-spouse", candidates: [c("teijusha", 1, "定住者・日系3世の配偶者（告示5号）")] },
  { id: "S9", match: (a) => a.identityDetail === "nikkei4", candidates: [c("sa-nikkei4", 1, "日系4世（特定活動告示43号）")] },
  { id: "S10", match: (a) => a.identityDetail === "zanryu-refugee", candidates: [c("teijusha", 1, "中国残留邦人等・第三国定住難民（告示1・8号）")], expert: true },
  { id: "S11", match: (a) => a.identityDetail === "divorce", candidates: [c("teijusha", 1, "離婚・死別・日本人実子の養育（告示外定住）"), c("expert", 2, "告示外の定住は総合判断")], expert: true,
    notes: ["離婚・死別後は14日以内の届出が必要で、6か月以上配偶者としての活動がないと在留資格取消しの対象になり得ます。"] },
  { id: "S14", match: (a) => a.identityDetail === "evacuee", candidates: [c("sa-other", 1, "避難民（特定活動）"), c("teijusha", 2, "政府方針により定住者へ変更が認められる例")], expert: true },
  { id: "F8", match: (a) => a.identityDetail === "kazoku-highschool", candidates: [c("teijusha", 1, "家族滞在で来日し日本の高校を卒業した人の就職（告示外定住）"), c("sa-other", 2, "高校卒業内定者の特定活動")], expert: true,
    notes: ["日本の義務教育修了・高校卒業などの条件が入管庁の取扱いで示されています。"] },
  { id: "S12", match: (a) => (a.wishes ?? []).includes("eiju") && (a.location === "japan" || a.location === "abroad"), candidates: [c("eiju", 9, "将来の永住：年数要件は永住要件セルフチェックで確認")] },
  { id: "T8a", match: (a) => a.identityDetail === "refugee", candidates: [c("sa-other", 1, "難民認定・補完的保護（特定活動等）"), c("teijusha", 2, "難民認定後は定住者")], expert: true },

  /* ────────── 就労 (§4-B) ────────── */
  // office / freelance
  { id: "W1", match: (a) => w(a, "office") && a.officeKind === "tech" && a.edu === "univ", candidates: [c("gijinkoku", 1, "大学卒＋専門的業務")] },
  { id: "W2", match: (a) => w(a, "office") && a.officeKind === "tech" && a.edu === "senmon", candidates: [c("gijinkoku", 1, "専門士＋専攻と相当程度関連する業務")], notes: ["専門学校卒は専攻と業務の「相当程度の関連性」が求められます。"] },
  { id: "W3", match: (a) => w(a, "office") && a.officeKind === "tech" && a.edu === "other" && a.exp === "ge10", candidates: [c("gijinkoku", 1, "実務経験10年")] },
  { id: "W4", match: (a) => w(a, "office") && a.officeKind === "intl" && (a.edu !== "other" || a.exp === "ge10" || a.exp === "ge3"), candidates: [c("gijinkoku", 1, "国際業務（通訳・翻訳・語学指導・海外取引・デザイン）")],
    notes: ["令和8年4月から、通訳・翻訳など言語能力を用いる対人業務はCEFR B2相当（JLPT N2等）が前提です。"] },
  { id: "W5", match: (a) => w(a, "office") && ((a.officeKind === "tech" && a.edu === "other" && a.exp !== "ge10") || (a.officeKind === "intl" && a.edu === "other" && a.exp === "lt3")),
    candidates: [c("none", 1, "学歴・実務経験の要件を満たす在留資格が見当たりません")], expert: true,
    notes: ["IT告示に定める情報処理技術の資格があれば学歴要件が免除されます。", "現場の仕事なら特定技能、日本の大学卒ならば特定活動46号も確認してください。"] },
  { id: "W27", match: (a) => w(a, "office") && a.officeKind === "tech" && a.edu === "univ" && (a.points === "ge70" || a.points === "ge80"), candidates: [c("hsp1", 2, "ポイント70点以上 → 高度専門職1号ロ")] },
  { id: "W34", match: (a) => w(a, "freelance"), candidates: [c("gijinkoku", 1, "特定の機関との継続的な契約（委任・請負）に基づく業務なら技人国の対象"), c("keiei-kanri", 2, "事業として行う場合は経営・管理"), c("expert", 3, "契約の形態により判断が分かれます")], expert: true,
    notes: ["技人国は「本邦の公私の機関との契約」が前提です。不特定多数から単発の仕事を受ける形態は該当しにくく、個別判断になります。"] },
  // transfer
  { id: "W6", match: (a) => w(a, "transfer"), candidates: [c("tenkin", 1, "海外拠点からの転勤")], notes: ["転勤直前1年以上の海外勤務と、日本での業務が技人国相当であることが要件です。"] },
  { id: "W6h", match: (a) => w(a, "transfer") && (a.points === "ge70" || a.points === "ge80"), candidates: [c("hsp1", 2, "ポイント70点以上 → 高度専門職1号")] },
  // research-edu
  { id: "W7", match: (a) => w(a, "research-edu") && a.researchKind === "univ", candidates: [c("kyoju", 1, "大学・高専での研究・教育")] },
  { id: "W7h", match: (a) => w(a, "research-edu") && a.researchKind === "univ" && (a.points === "ge70" || a.points === "ge80"), candidates: [c("hsp1", 2, "ポイント70点以上 → 高度専門職1号イ")] },
  { id: "W8", match: (a) => w(a, "research-edu") && a.researchKind === "lab", candidates: [c("kenkyu", 1, "企業・研究機関での研究")] },
  { id: "W8h", match: (a) => w(a, "research-edu") && a.researchKind === "lab" && (a.points === "ge70" || a.points === "ge80"), candidates: [c("hsp1", 2, "ポイント70点以上 → 高度専門職1号イ")] },
  { id: "W9", match: (a) => w(a, "research-edu") && a.researchKind === "school", candidates: [c("kyoiku", 1, "学校での語学等の教育")] },
  // licensed
  { id: "W10", match: (a) => w(a, "licensed") && a.licensedKind === "medical", candidates: [c("iryo", 1, "日本の医療系国家資格")] },
  { id: "W11", match: (a) => w(a, "licensed") && a.licensedKind === "legal", candidates: [c("horitsu", 1, "法律・会計の有資格業務")] },
  { id: "W12", match: (a) => w(a, "licensed") && a.licensedKind === "kaigo", candidates: [c("kaigo", 1, "介護福祉士")], notes: ["介護福祉士の資格がまだなら、特定技能1号（介護）やEPAのルートも確認してください。"] },
  // skilled
  { id: "W13", match: (a) => w(a, "skilled"), candidates: [c("gino", 1, "熟練技能（分野ごとの実務年数）")], notes: ["外国料理の調理は、実務10年の「技能」と、試験合格で就労する「特定技能（外食業）」の2ルートがあります。"] },
  // field
  { id: "W14", match: (a) => w(a, "field") && a.sswTest === "ssw1" && !inad(a), candidates: [c("ssw1", 1, "技能試験・日本語試験に合格")] },
  { id: "W15", match: (a) => w(a, "field") && a.sswTest === "titp2" && !inad(a), candidates: [c("ssw1", 1, "技能実習2号良好修了（試験免除）"), c("titp", 3, "技能実習3号の継続という選択肢")], notes: ["介護日本語評価試験、自動車運送業（タクシー・バス）・鉄道（運輸係員）のN3は修了者でも別途必要です。"] },
  { id: "W16", match: (a) => w(a, "field") && a.sswTest === "ssw2" && !inad(a), candidates: [c("ssw2", 1, "2号評価試験に合格（11分野）")] },
  { id: "W17", match: (a) => w(a, "field") && a.sswTest === "none" && !inad(a), candidates: [c("ssw1", 1, "分野別の技能試験＋日本語試験（N4等）に合格すれば候補に（現時点では未充足）"), c("titp", 2, "2027年4月以降は育成就労（海外からの新規受入れ・3年で特定技能1号水準へ）"), c("sa-ssw-prep", 3, "試験合格後の移行準備（国内在留者）")],
    notes: ["試験合格前の時点では特定技能には該当しません。分野別の技能試験・日本語試験（N4等）に合格すると特定技能1号の候補になります。"] },
  { id: "W18", match: (a) => w(a, "field") && inad(a), candidates: [c("none", 1, "18歳未満またはイラン国籍の方は特定技能の対象外です")] },
  // entertain
  { id: "W19", match: (a) => w(a, "entertain"), candidates: [c("kogyo", 1, "興行・芸能活動")] },
  // graduate
  { id: "W20", match: (a) => w(a, "graduate") && a.graduateKind === "job46", candidates: [c("sa-graduate46", 1, "日本の大学卒＋N1 → 幅広い業務"), c("gijinkoku", 2, "専門的業務なら技人国")] },
  { id: "W21", match: (a) => w(a, "graduate") && a.graduateKind === "jobhunt", candidates: [c("sa-jobhunt", 1, "継続就職活動")], notes: ["就職活動中のアルバイトは資格外活動許可（週28時間）が必要です。"] },
  { id: "W22", match: (a) => w(a, "graduate") && a.graduateKind === "naitei", candidates: [c("sa-jobhunt", 1, "内定者（採用までの待機）")] },
  // wh / epa / housekeeper
  { id: "W23", match: (a) => w(a, "whepa") && a.whepaKind === "wh", candidates: [c("sa-wh", 1, "ワーキング・ホリデー")] },
  { id: "W24", match: (a) => w(a, "whepa") && a.whepaKind === "epa", candidates: [c("sa-epa", 1, "EPA候補者"), c("kaigo", 2, "介護福祉士国家試験合格後は「介護」")] },
  { id: "W25", match: (a) => w(a, "whepa") && a.whepaKind === "housekeeper", candidates: [c("sa-housekeeper", 1, "家事使用人（告示1・2号）")] },
  // parttime
  { id: "W26", match: (a) => w(a, "parttime"), candidates: [c("shikakugai-kyoka", 1, "在留資格はそのまま、資格外活動許可でアルバイト")] },
  // designated programs
  { id: "W28", match: (a) => w(a, "designated") && a.designatedKind === "amateur", candidates: [c("sa-amateur", 1, "アマチュアスポーツ選手（告示6号）")] },
  { id: "W29", match: (a) => w(a, "designated") && a.designatedKind === "arbitration", candidates: [c("sa-arbitration", 1, "国際仲裁代理（告示8号）")] },
  { id: "W30", match: (a) => w(a, "designated") && a.designatedKind === "research-it", candidates: [c("sa-research-it", 1, "指定機関の研究・IT（告示36・37号）"), c("kenkyu", 2, "一般の研究機関なら「研究」"), c("gijinkoku", 3, "一般企業のIT技術者なら技人国")] },
  { id: "W31", match: (a) => w(a, "designated") && a.designatedKind === "manufacturing", candidates: [c("sa-manufacturing", 1, "製造業外国従業員受入事業（告示42号）")] },
  { id: "W32", match: (a) => w(a, "designated") && a.designatedKind === "ski", candidates: [c("sa-ski", 1, "スキーインストラクター（告示50号）")] },
  { id: "W33", match: (a) => w(a, "designated") && a.designatedKind === "ssw-prep", candidates: [c("sa-ssw-prep", 1, "特定技能1号への移行準備"), c("ssw1", 2, "準備後は特定技能1号")] },
  // hsp2 — 在留中の高度専門職からの問い合わせ
  { id: "W35", match: (a) => a.location === "japan" && a.currentStatus === "kodo" && act(a) && a.activity === "work", candidates: [c("hsp2", 1, "高度専門職1号で3年 → 2号（無期限）")] },

  /* ────────── 経営・起業 (§4-C) ────────── */
  { id: "B1", match: (a) => act(a) && a.activity === "business" && a.businessType === "ready", candidates: [c("keiei-kanri", 1, "事業の経営（新基準）")] },
  { id: "B2", match: (a) => act(a) && a.activity === "business" && a.businessType === "ready" && (a.points === "ge70" || a.points === "ge80"), candidates: [c("hsp1", 2, "ポイント70点以上 → 高度専門職1号ハ")] },
  { id: "B1n", match: (a) => act(a) && a.activity === "business" && a.businessType === "ready" && (a.capital === "lt30m" || a.mgmtBg === "no"), candidates: [c("sa-startup", 2, "要件未充足なら起業準備の枠（スタートアップビザ等）で準備")],
    notes: ["資本金等3,000万円・経歴要件のいずれかを満たしていない場合、経営・管理の上陸基準に適合しません。"] },
  { id: "B3", match: (a) => act(a) && a.activity === "business" && a.businessType === "preparing", candidates: [c("sa-startup", 1, "起業準備（告示44・51号／経営・管理4月）"), c("keiei-kanri", 2, "準備完了後に経営・管理へ")] },
  { id: "B4", match: (a) => act(a) && a.activity === "business" && a.businessType === "manager", candidates: [c("keiei-kanri", 1, "事業の管理に従事（管理者）"), c("gijinkoku", 2, "管理職でも業務実態が専門職なら技人国")], notes: ["管理者は日本人と同等額以上の報酬が要件です。"] },
  { id: "B5", match: (a) => act(a) && a.activity === "business" && a.businessType === "small", candidates: [c("none", 1, "資本金等3,000万円・常勤職員1名等の基準を満たさない小規模事業は経営・管理に該当しにくい"), c("expert", 2, "事業規模・形態により個別判断")], expert: true },
  { id: "B6", match: (a) => act(a) && a.activity === "business" && a.businessType === "renew", candidates: [c("keiei-kanri", 1, "在留中の方の更新（経過措置）")],
    notes: ["2028年10月16日までの更新は新基準に適合しなくても経営状況等で総合判断。それ以降は原則として新基準への適合が必要です。", "新基準に適合しない状態では経営・管理からの永住許可は認められません。"] },
  { id: "B7", match: (a) => act(a) && a.activity === "business" && a.businessType === "zone", candidates: [c("sa-zone", 1, "国家戦略特区の外国人創業人材受入促進事業"), c("keiei-kanri", 2, "事業開始後は経営・管理")] },

  /* ────────── 学ぶ (§4-D) ────────── */
  { id: "L1", match: (a) => act(a) && a.activity === "study" && a.studyType === "school", candidates: [c("ryugaku", 1, "教育機関で教育を受ける")] },
  { id: "L2", match: (a) => act(a) && a.activity === "study" && a.studyType === "kenshu", candidates: [c("kenshu", 1, "報酬を伴わない研修"), c("titp", 2, "実務作業を伴う場合は技能実習・育成就労")] },
  { id: "L3", match: (a) => act(a) && a.activity === "study" && a.studyType === "culture", candidates: [c("bunka", 1, "収入を伴わない文化・学術活動")] },
  { id: "L4", match: (a) => act(a) && a.activity === "study" && a.studyType === "titp", candidates: [c("titp", 1, "技能実習→育成就労（2027年4月）")] },
  { id: "L5", match: (a) => act(a) && a.activity === "study" && a.studyType === "elementary", candidates: [c("ryugaku", 1, "小中学校への就学")] },
  { id: "L6", match: (a) => act(a) && a.activity === "study" && a.studyType === "intern", candidates: [c("sa-intern", 1, "インターンシップ・サマージョブ・国際文化交流"), c("tanki", 2, "報酬なし・90日以内なら短期滞在")] },

  /* ────────── 家族 (§4-E) ────────── */
  { id: "F1", match: (a) => act(a) && a.activity === "family" && a.familySponsor === "work-study", candidates: [c("kazoku-taizai", 1, "就労資格・留学等で在留する人の配偶者・子")] },
  { id: "F2", match: (a) => act(a) && a.activity === "family" && a.familySponsor === "ssw1-titp", candidates: [c("none", 1, "特定技能1号・技能実習・育成就労では家族帯同が原則認められません"), c("sa-other", 2, "人道上の配慮が必要な場合の特定活動")], expert: true,
    notes: ["扶養者が特定技能2号に移行すると家族滞在が可能になります。"] },
  { id: "F3", match: (a) => act(a) && a.activity === "family" && a.familySponsor === "ssw2-hsp", candidates: [c("kazoku-taizai", 1, "特定技能2号・高度専門職の配偶者・子"), c("sa-hsp-family", 2, "高度専門職の配偶者就労・親の帯同（告示33・34号）")] },
  { id: "F4", match: (a) => act(a) && a.activity === "family" && a.familySponsor === "designated", candidates: [c("sa-other", 1, "特定活動で在留する人の家族は、本体の告示に家族規定があればその号（7・38・39・41・45・47・52・54号）"), c("kazoku-taizai", 2, "本体が家族滞在対象の特定活動（46号等は47号）")] },
  { id: "F5", match: (a) => act(a) && a.activity === "family" && a.familySponsor === "jp-pr", candidates: [c("jp-spouse", 1, "日本人の配偶者・子"), c("pr-spouse", 2, "永住者の配偶者・子"), c("teijusha", 3, "定住者の配偶者・連れ子")],
    notes: ["最初の質問「日本人・永住者との家族関係」で該当する選択肢を選ぶと、より絞った候補が表示されます。"] },
  { id: "F6", match: (a) => act(a) && a.activity === "family" && a.familySponsor === "parent", candidates: [c("sa-other", 1, "高齢の親の呼び寄せ（告示外・老親扶養）"), c("sa-hsp-family", 2, "高度専門職の場合は子の養育目的で親の帯同（告示34号）")], expert: true,
    notes: ["老親扶養の特定活動は極めて限定的で、一般的な基準は公表されていません。"] },
  { id: "F7", match: (a) => act(a) && a.activity === "family" && a.familySponsor === "wh-short", candidates: [c("none", 1, "ワーキングホリデー・短期滞在の家族として在留できる資格はありません"), c("tanki", 2, "90日以内の訪問なら短期滞在")] },

  /* ────────── 短期・その他 (§4-F) ────────── */
  { id: "T1", match: (a) => act(a) && a.activity === "short", candidates: [c("tanki", 1, "90日以内の観光・商用・親族訪問")], notes: ["短期滞在中の就労は一切できません。短期滞在から他の在留資格への変更は原則として認められません。"] },
  { id: "T2", match: (a) => act(a) && a.activity === "other" && a.otherType === "official", candidates: [c("diplomat", 1, "外交・公用")] },
  { id: "T3", match: (a) => act(a) && a.activity === "other" && a.otherType === "religion", candidates: [c("shukyo", 1, "宗教活動")] },
  { id: "T4", match: (a) => act(a) && a.activity === "other" && a.otherType === "media", candidates: [c("hodo", 1, "報道活動")] },
  { id: "T5", match: (a) => act(a) && a.activity === "other" && a.otherType === "art", candidates: [c("geijutsu", 1, "収入を伴う芸術活動"), c("kogyo", 2, "興行に当たる活動は「興行」")] },
  { id: "T6", match: (a) => act(a) && a.activity === "other" && a.otherType === "medical", candidates: [c("sa-medical", 1, "医療滞在・付添い"), c("tanki", 2, "短期の受診なら短期滞在")] },
  { id: "T7", match: (a) => act(a) && a.activity === "other" && a.otherType === "nomad", candidates: [c("sa-tourism", 1, "長期観光（告示40・41号）／デジタルノマド（53・54号）"), c("tanki", 2, "90日以内なら短期滞在")] },
  { id: "T8", match: (a) => act(a) && a.activity === "other" && a.otherType === "refugee", candidates: [c("sa-other", 1, "難民認定申請・補完的保護"), c("expert", 2, "個別判断")], expert: true },
  { id: "W36", match: (a) => act(a) && a.activity === "other" && a.otherType === "zone", candidates: [c("sa-zone", 1, "特区の美容師・家事支援事業")], expert: true, notes: ["対象自治体・認定事業者に限られます。"] },
  { id: "T9", match: (a) => act(a) && (a.activity === "unknown" || (a.activity === "other" && a.otherType === "undecided")), candidates: [c("none", 1, "在留資格は「日本で行う活動」で決まります。活動が決まったらもう一度お試しください")],
    notes: ["29種類の在留資格と就労可否は「外国人雇用の在留資格 早見表」で一覧できます。"] },
];

/* ────────── 横断注記 (§4-G) ────────── */
export function crossNotes(a: Answers, cands: Candidate[]): Note[] {
  const notes: Note[] = [];
  const codes = new Set(cands.map((x) => x.code));
  const wishes = a.wishes ?? [];

  if (a.identityDetail === "divorce") {
    notes.push({ id: "X13", tone: "info", text: "離婚・死別後の在留資格の考え方（6か月ルール・定住者への変更）は解説記事にまとめています。", href: "/guide/nyukan/haigusha-visa-rikon-6kagetsu", hrefLabel: "離婚したら在留資格はどうなる" });
  }
  if (wishes.includes("inadmissible")) {
    notes.push({ id: "X4", tone: "warn", text: "退去強制歴・一定の犯罪歴・感染症等の上陸拒否事由に該当し得る場合は、候補にかかわらず個別の判断になります。有資格者にご相談ください。" });
  }
  if (wishes.includes("jobchange") && (codes.has("gijinkoku") || codes.has("tenkin") || codes.has("gino") || a.currentStatus === "shuro")) {
    notes.push({ id: "X3", tone: "info", text: "転職時は契約機関の変更から14日以内に「所属機関等に関する届出」が必要です。就労資格証明書の交付申請で新しい業務の該当性を事前に確認できます。", href: "/guide/nyukan/zairyu-koshin-fukyoka-10sen", hrefLabel: "在留期間更新でよくある不許可理由" });
  }
  if (a.currentStatus === "ryugaku" && (codes.has("gijinkoku") || codes.has("sa-graduate46"))) {
    notes.push({ id: "X6", tone: "warn", text: "留学中に資格外活動（週28時間）を恒常的に超えていた場合、就労資格への変更が不許可となった事例が公表されています。", href: "/guide/nyukan/shikakugai-katsudo-28jikan", hrefLabel: "週28時間ルール" });
  }
  if (wishes.includes("family") && (codes.has("ssw1") || codes.has("titp") || codes.has("sa-wh"))) {
    notes.push({ id: "X7", tone: "warn", text: "特定技能1号・技能実習（育成就労）・ワーキングホリデーでは家族の帯同は原則認められません。", href: "/guide/nyukan/tokutei-gino-1go-2go-zentaizo", hrefLabel: "特定技能1号・2号の全体像" });
  }
  if (wishes.includes("eiju") && (codes.has("ssw1") || codes.has("titp"))) {
    notes.push({ id: "X8", tone: "info", text: "永住許可ガイドライン改定案では、技能実習・育成就労・特定技能1号の在留期間は「就労資格で5年」に算入されない見込みです。", href: "/guide/nyukan/eiju-guideline-kaitei-2026", hrefLabel: "永住ガイドライン改定案" });
  }
  if ((wishes.includes("eiju") || wishes.includes("long")) && !codes.has("eiju")) {
    notes.push({ id: "X12", tone: "info", text: "将来の永住については「永住要件セルフチェック」で年数要件を確認できます。", href: "/tools/eiju-shindan", hrefLabel: "永住要件セルフチェック" });
  }
  if (codes.has("keiei-kanri")) {
    notes.push({ id: "X9", tone: "info", text: "2025年10月16日施行の新基準に適合しない場合、経営・管理からの永住許可は認められません。", href: "/guide/nyukan/keiei-kanri-visa-2025", hrefLabel: "経営・管理ビザの新要件" });
  }
  if (codes.has("gijinkoku") && a.standpoint === "employer") {
    notes.push({ id: "X11", tone: "info", text: "派遣形態で受け入れる場合、申請時点で派遣先が確定していることが必要です（令和8年7月取扱い）。", href: "/guide/nyukan/gijinkoku-visa-guide", hrefLabel: "技人国 完全ガイド" });
  }
  if (a.standpoint === "employer") {
    notes.push({ id: "X10", tone: "info", text: "採用時は在留カードの原本確認、雇入れ・離職時の外国人雇用状況届出が必要です。不法就労助長罪は「知らなかった」では原則免責されません。", href: "/guide/nyukan/gaikokujin-koyo-zairyu-shikaku-hayamihyo", hrefLabel: "外国人雇用の在留資格 早見表" });
  }
  if (a.location === "japan" && a.currentStatus === "tanki" && cands.some((x) => STATUSES[x.code].group !== "out" && x.code !== "tanki")) {
    notes.push({ id: "R2w", tone: "warn", text: "短期滞在から他の在留資格への変更は、やむを得ない特別の事情がある場合を除き原則として認められません。通常は一度出国し、在留資格認定証明書交付申請から進めます。" });
  }
  if (a.location === "japan" && a.currentStatus === "ginojisshu" && (codes.has("gijinkoku") || codes.has("ryugaku"))) {
    notes.push({ id: "R2t", tone: "warn", text: "技能実習計画の途中での他の在留資格への変更は、原則として認められません。" });
  }
  if (a.location === "japan") {
    notes.push({ id: "X5", tone: "info", text: "再入国許可で出国中はオンライン申請ができません。申請中に出国する場合は在留期限から2か月以内に再入国して許可を受ける必要があります。", href: "/practice/dx/nyukan-online-shinsei-manual", hrefLabel: "入管オンライン申請 実務マニュアル" });
  }
  return notes;
}

/* ────────── ルート (§3 R1〜R3) ────────── */
function route(a: Answers, cands: Candidate[]): Route {
  if (a.location === "born") return { id: "R4", title: "在留資格取得許可申請", text: "出生から30日以内に住居地を管轄する地方出入国在留管理局へ。60日を超えて在留資格がないまま滞在すると退去強制事由になります。" };
  if (a.location === "abroad") {
    return { id: "R1", title: "海外から：在留資格認定証明書交付申請", text: "日本の受入れ機関・親族等が代理人として地方出入国在留管理局（またはオンライン）に申請 → 交付された証明書（メール交付可）で在外公館に査証申請 → 上陸。認定証明書交付申請の手数料は無料です。", href: "/practice/dx/nyukan-online-shinsei-manual", hrefLabel: "オンライン申請の流れ" };
  }
  if (a.location === "japan") {
    const top = cands[0];
    const same =
      (a.currentStatus === "ryugaku" && top?.code === "ryugaku") ||
      (a.currentStatus === "kazoku" && top?.code === "kazoku-taizai") ||
      (a.currentStatus === "keiei" && top?.code === "keiei-kanri") ||
      (a.currentStatus === "tokutei-gino" && (top?.code === "ssw1" || top?.code === "ssw2")) ||
      (a.currentStatus === "mibun" && (top?.code === "jp-spouse" || top?.code === "pr-spouse" || top?.code === "teijusha"));
    if (top?.code === "shikakugai-kyoka") return { id: "none", title: "資格外活動許可申請", text: "在留資格は変えずに資格外活動許可を申請します（手数料無料・標準処理期間2週間〜2か月）。", href: "/guide/nyukan/shikakugai-katsudo-28jikan", hrefLabel: "週28時間ルール" };
    if (same) return { id: "R3", title: "在留期間更新許可申請", text: "同じ在留資格を続ける場合は更新申請（満了のおおむね3か月前から／手数料6,000円・オンライン5,500円）。審査はガイドラインの8項目で行われます。", href: "/guide/nyukan/zairyu-koshin-fukyoka-10sen", hrefLabel: "更新で落ちる理由10選" };
    return { id: "R2", title: "日本にいる：在留資格変更許可申請", text: "現在の在留期間内に地方出入国在留管理局（またはオンライン）へ変更申請（手数料6,000円・オンライン5,500円）。期間内に申請すれば処分まで（最長で満了日から2か月）在留できます。", href: "/guide/nyukan/zairyu-koshin-fukyoka-10sen", hrefLabel: "変更・更新の審査ポイント" };
  }
  return { id: "none", title: "", text: "" };
}

/* ────────── 評価 ────────── */
export function evaluate(a: Answers): Result {
  const matched = LEAVES.filter((l) => l.match(a));
  const map = new Map<StatusCode, Candidate>();
  for (const leaf of matched) {
    for (const cand of leaf.candidates) {
      const prev = map.get(cand.code);
      if (!prev || cand.priority < prev.priority) map.set(cand.code, cand);
    }
  }
  let candidates = [...map.values()].sort((x, y) => x.priority - y.priority);
  // 「該当なし」「専門家」は、実在の在留資格候補があるときは末尾へ
  const real = candidates.filter((x) => STATUSES[x.code].group !== "out");
  const outs = candidates.filter((x) => STATUSES[x.code].group === "out");
  candidates = [...real, ...outs];
  const leafNotes: Note[] = matched.flatMap((l) => (l.notes ?? []).map((t, i) => ({ id: `${l.id}-n${i}`, tone: "info" as const, text: t })));
  const expert = matched.some((l) => l.expert);
  return {
    leafIds: matched.map((l) => l.id),
    candidates,
    expert,
    notes: [...leafNotes, ...crossNotes(a, candidates)],
    route: route(a, candidates),
  };
}
