import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "運営者情報",
  description: `${siteConfig.name}の運営者情報・編集方針。官公庁の一次情報に基づき、行政書士業務の全分野を解説する情報メディアです。`,
};

/** E-E-A-T 必須ページ。資格状態は正直に記載する（docs/06 §3.4） */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">運営者情報</h1>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">
          運営者について
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
          <p>
            本サイト「{siteConfig.name}」は、行政書士試験の受験生であり、
            日本在住の外国人当事者でもある編集者が運営しています。
          </p>
          <p>
            編集者は行政書士の有資格者ではないため、
            個別の相談業務・書類作成業務は一切行っておりません。
          </p>
          <p>
            本サイトの役割は、官公庁の一次情報（法令・ガイドライン・パブリックコメント等）を
            正確に読み解き、わかりやすく整理してお伝えすることに限定されます。
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">
          編集方針
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
          <li>
            <strong>一次情報主義</strong> —
            官報・法令・官公庁の公表資料を必ず原文で確認し、出典を明記します。
          </li>
          <li>
            <strong>制度ステータスの明示</strong> —
            「改定案」と「施行済み」を明確に区別し、記事上部にラベルで表示します。
          </li>
          <li>
            <strong>訂正の公開</strong> —
            誤りが見つかった場合は記事を修正し、更新履歴に訂正内容を記録します。
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">
          サイト概要
        </h2>
        <table className="mt-4 w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100">
              <th scope="row" className="w-32 py-2 text-left font-semibold text-gray-600">サイト名</th>
              <td className="py-2 text-gray-800">{siteConfig.name}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-2 text-left font-semibold text-gray-600">運営</th>
              <td className="py-2 text-gray-800">{siteConfig.name} 編集部</td>
            </tr>
            <tr className="border-b border-gray-100">
              <th scope="row" className="py-2 text-left font-semibold text-gray-600">資格状況</th>
              <td className="py-2 text-gray-800">{siteConfig.publisher.qualificationNote}</td>
            </tr>
            <tr>
              <th scope="row" className="py-2 text-left font-semibold text-gray-600">お問い合わせ</th>
              <td className="py-2">
                <Link href="/contact" className="text-brand-600 hover:underline">
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
