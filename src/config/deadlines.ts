import type { DeadlineLike } from "@/lib/deadline";

/**
 * 記事本文の <Deadline id="..." /> が参照する締切マスター。
 * ここが唯一の正（Single Source of Truth）で、本文中の日付表記と必ず一致させる。
 *
 * 登録の条件（docs/04 R7 と同じ基準）:
 *   - 日付は一次情報（募集要領・公募要領・公式サイト）の原文で確認したものだけを書く
 *   - 確認日を verifiedAt に残す（`npm run stale` が期限切れを検出したときの追跡用）
 *   - 締切が過ぎたら消さずに残す。DeadlineCountdown が「受付終了」表示へ自動で切り替わる
 */
export type DeadlineNotice = DeadlineLike & {
  /** 締切前に出す小見出し（例: 意見募集の締切まで） */
  eyebrow: string;
  /** 必着日の表示（例: 2026年9月3日（木）必着）。dueDate と同じ日を指すこと */
  dueLabel: string;
  /** 締切前の説明文。何を・どこへ出すのかを1〜2文で */
  lead: string;
  /** 受付が閉じる瞬間の補足（公式表示との食い違いを説明する欄） */
  closesLabel: string;
  /** 締切後の見出し。過去形で言い切る */
  closedTitle: string;
  /** 締切後の説明文。「次にどうなるか」を書き、読者を宙ぶらりんにしない */
  closedLead: string;
  officialUrl: string;
  officialLabel: string;
  /** 一次情報で日付を確認した日（YYYY-MM-DD） */
  verifiedAt: string;
};

export const DEADLINES = {
  /** content/news/eiju-pubcomme-2026.mdx — 意見募集要領（令和8年8月4日 出入国在留管理庁）原文で確認 */
  "eiju-pubcomme-2026": {
    dueDate: "2026-09-03",
    // 案件ページの「受付締切日時」表示に合わせる。9月3日いっぱい＝9月4日0時0分。
    closesAt: "2026-09-04T00:00:00+09:00",
    eyebrow: "意見募集の締切まで",
    dueLabel: "2026年9月3日（木）必着",
    lead:
      "永住許可ガイドライン改定案への意見は、e-Govフォーム・電子メール・郵送のいずれかで提出できます。郵送も募集期間内の必着です。",
    closesLabel:
      "e-Govの案件ページの「受付締切日時 2026年9月4日0時0分」は、9月3日いっぱいという意味です。",
    closedTitle: "この意見募集は2026年9月3日（木）で終了しました",
    closedLead:
      "新たな意見の提出はできません。提出された意見の概要と考え方は、結果公示として同じ案件ページで公表されます。",
    officialUrl:
      "https://public-comment.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTDETAIL&id=315000140&Mode=0",
    officialLabel: "e-Gov パブリック・コメント（案件番号315000140）",
    verifiedAt: "2026-08-17",
  },

  /** content/guide/hojokin/jizokuka-hojokin-kaijisei.mdx — 公式サイト・中小機構の公募スケジュールで確認 */
  "jizokuka-20": {
    dueDate: "2026-12-15",
    closesAt: "2026-12-15T17:00:00+09:00",
    eyebrow: "第20回 申請締切まで",
    dueLabel: "2026年12月15日 17:00 締切",
    lead:
      "実質のデッドラインは様式4（事業支援計画書）の発行受付期限2026年12月4日です。商工会議所・商工会への相談はさらにその前に済ませてください。",
    closesLabel: "申請受付開始は2026年11月5日。当日はアクセスが集中するため前日までの送信を推奨",
    closedTitle: "第20回の申請受付は2026年12月15日17時で終了しました",
    closedLead:
      "持続化補助金は回次制のため、次回（第21回）の公募が改めて公表されます。日程は公式サイトでご確認ください。",
    officialUrl: "https://official.jizokukanb.com/",
    officialLabel: "小規模事業者持続化補助金（一般型）公式サイト",
    verifiedAt: "2026-08-17",
  },
} as const satisfies Record<string, DeadlineNotice>;

export type DeadlineId = keyof typeof DEADLINES;

/**
 * 締切の取得。未登録の id はビルドを止める（記事に空欄の締切枠が出るのを防ぐ）。
 * MDX からは任意の文字列が来るため、型ではなく実行時に弾く必要がある。
 */
export function getDeadline(id: string): DeadlineNotice {
  const deadline = (DEADLINES as Record<string, DeadlineNotice>)[id];
  if (!deadline) {
    throw new Error(
      `締切 id "${id}" は src/config/deadlines.ts に未登録です（登録済み: ${Object.keys(DEADLINES).join(", ")}）`
    );
  }
  return deadline;
}
