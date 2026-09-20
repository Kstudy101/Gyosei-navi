import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "免責事項",
  description: `${siteConfig.name}の免責事項。掲載情報の性質、個別相談への対応、著作権・リンクについて定めます。`,
};

/** docs/06_LEGAL_COMPLIANCE.md v2 §3.1〜3.2 の方針に基づく */
const SECTIONS = [
  {
    heading: "1. 情報提供の目的",
    body: [
      "本サイトは、補助金・助成金制度に関する情報提供を目的としています。",
      "個別の申請書類の作成代行・提出代行は行っておりません。",
    ],
  },
  {
    heading: "2. 情報の正確性について",
    body: [
      "掲載情報は執筆時点のものであり、最新の制度内容と異なる場合があります。",
      "各実施主体（国・都道府県・市区町村）の公式発表を確認のうえ執筆していますが、正確性・完全性を保証するものではありません。実際の申請にあたっては、必ず各実施主体の公式情報をご確認ください。",
      "申請の可否は各制度の実施主体による審査結果によります。",
    ],
  },
  {
    heading: "3. 損害等の責任について",
    body: ["本サイトの情報を利用したことにより生じたいかなる損害についても、運営者は責任を負いかねます。"],
  },
  {
    heading: "4. リンク先について",
    body: ["本サイトからリンクする外部サイトの内容について、運営者は責任を負いません。"],
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
      <p className="mt-10 text-xs text-gray-500">制定日: 2026年9月20日</p>
    </div>
  );
}
