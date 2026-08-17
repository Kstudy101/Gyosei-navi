import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "免責事項",
  description: `${siteConfig.name}の免責事項。掲載情報の性質、個別相談への対応、著作権・リンクについて定めます。`,
};

const SECTIONS = [
  {
    heading: "1. 情報提供の目的",
    body: [
      "本サイトは、行政書士業務に関する一般的な情報提供を目的としており、個別の法律相談・書類作成代行・申請代理は行っておりません。",
      "個別のご相談は有資格の行政書士へご依頼ください。",
    ],
  },
  {
    heading: "2. 情報の正確性について",
    body: [
      "掲載情報は執筆時点のものであり、最新の法令・運用と異なる場合があります。",
      "官公庁の一次情報を確認のうえ執筆していますが、正確性・完全性を保証するものではありません。実際の手続きにあたっては、必ず最新の公式情報をご確認ください。",
      "「改定案」ラベルの付いた記事は、確定していない制度案に関する解説であり、今後内容が変更される可能性があります。",
    ],
  },
  {
    heading: "3. 損害等の責任について",
    body: [
      "本サイトの情報を利用したことにより生じたいかなる損害についても、運営者は責任を負いかねます。",
    ],
  },
  {
    heading: "4. リンク先について",
    body: [
      "本サイトからリンクする外部サイトの内容について、運営者は責任を負いません。",
    ],
  },
  {
    heading: "5. 著作権について",
    body: [
      "本サイトに掲載する文章・図表の著作権は運営者に帰属します。官公庁資料の引用は、出典を明示のうえ引用の要件に従って行っています。",
    ],
  },
] as const;

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">免責事項</h1>
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
