import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: `${siteConfig.name}へのお問い合わせ。記事内容へのご指摘・情報提供・掲載依頼を承ります。`,
};

/** docs/06_LEGAL_COMPLIANCE.md v2 §3.5 の定形文をそのまま反映 */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">お問い合わせ</h1>

      <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        ※ 個別の申請可否判定・書類作成代行のご依頼にはお応えできません。
        記事内容に関するご指摘・情報提供・掲載依頼のみ承ります。
      </div>

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-gray-700">
        <p>お問い合わせフォームは現在準備中です。</p>
        <p>記事の誤りに関するご指摘は、今後開設するSNSアカウントまたはフォームより受け付けます。</p>
      </div>
    </div>
  );
}
