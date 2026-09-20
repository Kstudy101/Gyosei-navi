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
    heading: "5. 広告について（Google AdSense を含む）",
    body: [
      "本サイトは、第三者配信の広告サービス（Google AdSense を含む）を利用しています。このような広告配信事業者は、ユーザーの興味に応じた広告を表示するため、Cookie を使用して当サイトや他サイトへのアクセス情報を収集することがあります。",
      "Google が広告配信に Cookie を使用することにより、当サイトや他サイトへのアクセス情報に基づいて、ユーザーに適切な広告を表示しています。Cookie を無効にする設定や Google の広告設定に関する詳細は「広告設定」（https://adssettings.google.com/）をご覧ください。",
      "また、Google 広告におけるパーソナライズ広告や第三者配信事業者による Cookie の使用の詳細については、Google のポリシーと規約ページ（https://policies.google.com/technologies/ads）をご確認ください。",
    ],
  },
  {
    heading: "6. アフィリエイトについて",
    body: [
      "本サイトは、楽天アフィリエイトを利用して商品を紹介する場合があります。紹介する商品には、当サイトを経由した購入等の実績に応じて楽天グループ株式会社よりアフィリエイト報酬が支払われるリンク（広告）を含みます。該当箇所には「PR」または「広告」の表示を付けています。",
      "楽天が提供する広告（モーションウィジェット等）の表示にあたり、楽天側で Cookie 等を用いたアクセス情報の取得が行われる場合があります。詳細は楽天株式会社のプライバシーポリシーをご確認ください。",
    ],
  },
  {
    heading: "7. お問い合わせフォームについて",
    body: [
      "お問い合わせフォームでご提供いただいた氏名・メールアドレス・お問い合わせ内容は、メール送信サービス（Resend）を経由して運営者に送信されます。送信された情報は、お問い合わせへの対応以外の目的には利用しません。",
    ],
  },
  {
    heading: "8. 本ポリシーの変更",
    body: [
      "本ポリシーの内容は、法令の改正やサイト機能の追加に応じて変更することがあります。変更後の内容は本ページに掲載した時点で効力を生じます。",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">プライバシーポリシー</h1>
      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-8">
          <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
            {s.heading}
          </h2>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
      ))}
      <p className="mt-10 text-xs text-gray-500 dark:text-gray-400">制定日: 2026年8月17日</p>
    </div>
  );
}
