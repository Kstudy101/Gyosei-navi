import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "運営者情報",
  description: `${siteConfig.name}の運営者情報・編集方針。全国の補助金・助成金制度を、地域ごとに比較しやすい形で整理・発信する情報サイトです。`,
};

/** docs/06_LEGAL_COMPLIANCE.md v2 §3.4 の定形文をそのまま反映 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">運営者情報</h1>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
          運営者について
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            本サイトは、全国の補助金・助成金制度の情報を、地域ごとに比較しやすい形で
            整理・発信することを目的として運営しています。
          </p>
          <p>個別の申請書類の作成代行・提出代行は行っておりません。</p>
          <p>制度の詳細・最新情報は各実施主体の公式サイトをご確認ください。</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
          編集方針
        </h2>
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
        <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
          サイト概要
        </h2>
        <table className="mt-4 w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th scope="row" className="w-32 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">
                サイト名
              </th>
              <td className="py-2 text-gray-800 dark:text-gray-200">{siteConfig.name}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th scope="row" className="py-2 text-left font-semibold text-gray-600 dark:text-gray-400">
                運営
              </th>
              <td className="py-2 text-gray-800 dark:text-gray-200">{siteConfig.name} 編集部</td>
            </tr>
            <tr>
              <th scope="row" className="py-2 text-left font-semibold text-gray-600 dark:text-gray-400">
                お問い合わせ
              </th>
              <td className="py-2">
                <Link href="/contact" className="text-brand-600 hover:underline dark:text-brand-100">
                  お問い合わせページへ
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
