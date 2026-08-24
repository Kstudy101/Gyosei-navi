import type { Metadata } from "next";
import { VisaNavi } from "@/components/tools/VisaNavi";
import { Disclaimer } from "@/components/article/Disclaimer";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, webApplicationJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "日本で何をするか・家族関係・学歴や試験の状況をカードで選ぶだけで、入管法別表の29種の在留資格と特定活動の中から候補になる在留資格と主な要件・申請ルートを表示します。入管庁の在留資格一覧表・各ガイドラインに基づく候補提示で、許可の可否を判定するものではありません。入力内容は送信・保存されません。";

export const metadata: Metadata = {
  title: "在留資格判定ナビ｜あなたに合う在留資格の候補を数クリックで確認",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/tools/visa-navi") },
};

export default function VisaNaviPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={webApplicationJsonLd({
          name: "在留資格判定ナビ",
          description: DESCRIPTION,
          path: "/tools/visa-navi",
        })}
      />
      <p className="text-xs font-semibold text-brand-600">判定ナビ</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">在留資格判定ナビ</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        「日本で何をするか」を選んでいくだけで、在留資格（29種類＋特定活動の各類型）の中から候補になるものと、
        主な要件・在留期間・家族帯同の可否・申請のルートを表示します。
        根拠は入管庁の在留資格一覧表・各在留資格のガイドライン（2026年8月時点）です。
      </p>
      <ul className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-3">
        <li className="rounded-md bg-gray-50 p-2">🕒 所要 1〜2分・最大8問</li>
        <li className="rounded-md bg-gray-50 p-2">🔒 入力はブラウザ内で処理。送信・保存なし</li>
        <li className="rounded-md bg-gray-50 p-2">📄 候補ごとに関連記事・一次情報へ</li>
      </ul>
      <div className="mt-4 rounded-md border-l-4 border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        本ナビは公表されている一般的な要件との照合により「候補」を示すものであり、許可の可否を判定・保証するものではありません。
        告示外・総合判断の領域は候補提示にとどめ、有資格者への相談をご案内します。
      </div>

      <div className="mt-6">
        <VisaNavi />
      </div>

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}
