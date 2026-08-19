import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ADS_CONTACT_EMAIL } from "@/config/ads";

export const metadata: Metadata = {
  title: "広告掲載のご案内",
  description: `${siteConfig.name}への広告掲載のご案内。行政書士・士業事務所向けの月額固定の掲載枠を用意しています。成果報酬・紹介料型の取り扱いはありません。`,
};

/**
 * 広告主（行政書士・士業事務所）向けの媒体案内ページ。
 * 掲載方針は docs/06 §2 の決定（2026-08-19）に従う:
 * 月額固定の掲載料のみ・あっせん/成果報酬の排除・「広告」表記・編集権の独立。
 */
export default function AdsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">広告掲載のご案内</h1>
      <p className="mt-4 text-sm leading-relaxed text-gray-700">
        {siteConfig.name}
        は、在留資格・許認可・法人設立・相続まで、行政書士業務の全分野を一次情報から解説する情報メディアです。
        手続きを調べている個人・事業者の読者に向けて、
        <strong>行政書士・士業事務所の広告掲載枠</strong>をご用意しています。
      </p>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">
          媒体について
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
          <li>
            全記事が官公庁の一次情報（法令・ガイドライン・公表資料）に基づく解説で、
            出典を記事末尾に明記しています。
          </li>
          <li>
            読者の中心は、在留資格・補助金・許認可などの手続きを
            <strong>いままさに調べている個人・事業者</strong>
            です。本サイトは個別相談を承っていないため、専門家を探す読者にとって
            広告が次の行き先になります。
          </li>
          <li>主要分野: 入管・国際業務／許認可／法人設立／相続・遺言／補助金 ほか8分野。</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">
          掲載枠
        </h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-600">
              <th scope="col" className="py-2 font-semibold">枠</th>
              <th scope="col" className="py-2 font-semibold">表示位置</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            <tr className="border-b border-gray-100">
              <td className="py-2">サイドレール（左右 各1枠）</td>
              <td className="py-2">記事ページ両脇・スクロール追従（デスクトップ）</td>
            </tr>
            <tr>
              <td className="py-2">記事下カード（1枠）</td>
              <td className="py-2">記事本文の直後（モバイル・タブレット）</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          掲載枠・料金の詳細はお問い合わせください。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">
          掲載方針
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
          <li>
            <strong>月額固定の掲載料のみ</strong>
            を承ります。紹介件数・成約に応じた成果報酬、クリック課金など、
            あっせんと評価されうる形態は一切取り扱いません。
          </li>
          <li>広告枠には常時「広告」と表示します（景品表示法・ステマ規制対応）。</li>
          <li>
            掲載にあたり、<strong>行政書士登録番号と事務所の実在</strong>
            を確認させていただきます。誇大な表現を含む広告は掲載できません。
          </li>
          <li>
            編集権は独立しています。広告掲載の有無は記事の内容・評価に一切影響しません。
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">
          お問い合わせ
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          下記メールアドレスまでご連絡ください。折り返し、媒体資料と空き枠の状況をご案内します。
        </p>
        <p className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm">
          <a
            href={`mailto:${ADS_CONTACT_EMAIL}?subject=${encodeURIComponent("広告掲載の問い合わせ")}`}
            className="font-semibold text-brand-600 hover:underline"
          >
            {ADS_CONTACT_EMAIL}
          </a>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          メールには次の項目をご記載ください: ①事務所名 ②行政書士登録番号
          ③ご希望の掲載枠 ④ご連絡先
        </p>
      </section>

      <p className="mt-10 text-xs text-gray-500">
        運営者情報は<Link href="/about" className="text-brand-600 hover:underline">こちら</Link>
        。広告以外のお問い合わせは
        <Link href="/contact" className="text-brand-600 hover:underline">お問い合わせページ</Link>
        をご覧ください。
      </p>
    </div>
  );
}
