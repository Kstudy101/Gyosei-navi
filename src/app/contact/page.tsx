import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: `${siteConfig.name}へのお問い合わせ。記事内容へのご指摘・取材依頼・掲載依頼を承ります。個別のご相談にはお答えできません。`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">お問い合わせ</h1>

      {/* 法19条対応: 個別相談は受けない旨を明示（docs/06 §3.5） */}
      <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        ※ 個別のご相談（在留資格の可否、書類の書き方等）にはお答えできません。
        記事内容に関するご指摘・取材依頼・掲載依頼のみ承ります。
        個別のご相談は有資格の行政書士へご依頼ください。
      </div>

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-gray-700">
        <p>お問い合わせフォームは現在準備中です。</p>
        <p>
          記事の誤りに関するご指摘は、今後開設する SNS
          アカウントまたはフォームより受け付けます。
        </p>
      </div>
    </div>
  );
}
