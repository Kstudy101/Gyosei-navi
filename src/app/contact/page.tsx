import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: `${siteConfig.name}へのお問い合わせ。記事内容へのご指摘・情報提供・掲載依頼を承ります。`,
};

/** docs/06_LEGAL_COMPLIANCE.md v2 §3.5 の定形文をそのまま反映 */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">お問い合わせ</h1>

      <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200">
        ※ 個別の申請可否判定・書類作成代行のご依頼にはお応えできません。
        記事内容に関するご指摘・情報提供・掲載依頼のみ承ります。
      </div>

      <ContactForm />
    </div>
  );
}
