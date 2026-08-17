import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${siteConfig.name}のプライバシーポリシー。取得する情報とその利用目的、アクセス解析について定めます。`,
};

const SECTIONS = [
  {
    heading: "1. 取得する情報",
    body: [
      "お問い合わせの際にご提供いただく氏名・連絡先・お問い合わせ内容を取得する場合があります。",
      "今後、LINE 公式アカウント・メールマガジン等を開設した場合は、登録時にご提供いただく情報を取得します。取得する項目と利用目的は、開設時に本ポリシーへ追記します。",
    ],
  },
  {
    heading: "2. 利用目的",
    body: [
      "取得した情報は、お問い合わせへの対応、およびサイト運営に必要な連絡のためにのみ利用します。",
    ],
  },
  {
    heading: "3. 第三者提供",
    body: [
      "法令に基づく場合を除き、ご本人の同意なく第三者に個人情報を提供することはありません。",
    ],
  },
  {
    heading: "4. アクセス解析について",
    body: [
      "本サイトでは、サイト改善のためにアクセス解析ツール（Google Analytics 等）を導入する場合があります。導入した場合、解析ツールはトラフィックデータの収集のために Cookie を使用します。このデータは匿名で収集されており、個人を特定するものではありません。",
    ],
  },
  {
    heading: "5. 本ポリシーの変更",
    body: [
      "本ポリシーの内容は、法令の改正やサイト機能の追加に応じて変更することがあります。変更後の内容は本ページに掲載した時点で効力を生じます。",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-8">
          <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">
            {s.heading}
          </h2>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
      ))}
      <p className="mt-10 text-xs text-gray-500">制定日: 2026年8月17日</p>
    </div>
  );
}
