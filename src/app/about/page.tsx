import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "運営者情報",
  description: `${siteConfig.name}の運営者情報・編集方針。全国の補助金・助成金制度を、地域ごとに比較しやすい形で整理・発信する情報サイトです。`,
};

/**
 * 運営者の実情報。空文字の項目は非表示になる。
 * 実在する情報だけを入れること（架空の名義・住所は AdSense の虚偽表示ポリシー違反になる）。
 */
const OPERATOR = {
  name: `${siteConfig.name} 編集部（個人運営）`,
  representative: "",
  address: "",
  email: "",
  established: "2026年8月",
  profile:
    "運営者は、行政書士試験に向けて行政手続き・行政制度を学んでいる個人です。補助金・助成金の情報は国・都道府県・市区町村のサイトに分散していて、住んでいる地域でどの制度が使えるのか比べにくいことから、本サイトを開設しました。公式発表を原文で確認し、地域ごとに比較できる形で整理することを心がけています。",
};

const h2 =
  "border-b border-gray-200 pb-2 text-lg font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100";
const body = "mt-4 space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300";
const th = "w-32 py-2 text-left align-top font-semibold text-gray-600 dark:text-gray-400";
const td = "py-2 text-gray-800 dark:text-gray-200";
const link = "text-brand-600 hover:underline dark:text-brand-100";

/** docs/06_LEGAL_COMPLIANCE.md v2 §3.4 の定形文をベースに、運営者・編集体制を追記 */
export default function AboutPage() {
  const rows: [string, React.ReactNode][] = [
    ["サイト名", siteConfig.name],
    ["URL", siteConfig.url],
    ["運営者", OPERATOR.name],
    ["運営責任者", OPERATOR.representative],
    ["所在地", OPERATOR.address],
    ["メール", OPERATOR.email],
    ["開設", OPERATOR.established],
    [
      "お問い合わせ",
      <Link key="c" href="/contact" className={link}>
        お問い合わせフォーム
      </Link>,
    ],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">運営者情報</h1>

      <section className="mt-8">
        <h2 className={h2}>運営者について</h2>
        <div className={body}>
          <p>
            本サイトは、全国の補助金・助成金制度の情報を、地域ごとに比較しやすい形で
            整理・発信することを目的として運営しています。
          </p>
          {OPERATOR.profile && <p>{OPERATOR.profile}</p>}
          <p>個別の申請書類の作成代行・提出代行は行っておりません。</p>
          <p>制度の詳細・最新情報は各実施主体の公式サイトをご確認ください。</p>
        </div>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {rows
              .filter(([, v]) => v !== "")
              .map(([k, v]) => (
                <tr key={k} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <th scope="row" className={th}>
                    {k}
                  </th>
                  <td className={td}>{v}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className={h2}>編集方針</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            <strong>一次情報主義</strong> —
            国・都道府県・市区町村の公式発表を必ず原文で確認し、出典を明記します。
          </li>
          <li>
            <strong>募集状況の明示</strong> —
            「募集中」「締切」「通年」を明確に区別し、記事に表示します。
          </li>
          <li>
            <strong>訂正の公開</strong> —
            誤りが見つかった場合は記事を修正し、更新履歴に訂正内容を記録します。
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className={h2}>記事ができるまで</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>自治体・国の公式ページや要綱（PDF）を取得し、原文を保存します。</li>
          <li>金額・対象者・申請期限などの数値を、保存した原文と照合して確認します。</li>
          <li>照合を通過した内容だけを記事にし、各記事に出典リンクと最終確認日を表示します。</li>
          <li>公開後も公式ページの更新を定期的に確認し、変更があれば記事を更新します。</li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className={h2}>掲載しているコンテンツ</h2>
        <dl className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <div>
            <dt className="font-semibold text-gray-900 dark:text-gray-100">個別解説</dt>
            <dd>1つの制度について、金額・対象者・申請方法を公式情報に基づいて解説した記事です。</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900 dark:text-gray-100">地域比較・特集・ランキング</dt>
            <dd>公開済みの個別解説のデータを、自治体別・金額別に並べて整理した記事です。</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900 dark:text-gray-100">外国語版</dt>
            <dd>
              日本語の記事を翻訳したものです。内容に差異がある場合は日本語版および公式情報が優先します。
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className={h2}>広告・収益について</h2>
        <div className={body}>
          <p>
            本サイトは、Google AdSense
            等の広告配信およびアフィリエイトプログラムによる収益で運営しています。広告・アフィリエイトリンクには「PR」または「広告」と表示しています。
          </p>
          <p>広告主の意向によって記事の内容や制度の掲載順を変えることはありません。</p>
          <p>
            詳しくは
            <Link href="/policy/privacy" className={link}>
              プライバシーポリシー
            </Link>
            ・
            <Link href="/policy/disclaimer" className={link}>
              免責事項
            </Link>
            をご覧ください。
          </p>
        </div>
      </section>
    </div>
  );
}
