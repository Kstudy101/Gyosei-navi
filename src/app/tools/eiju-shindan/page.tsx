import type { Metadata } from "next";
import { EijuShindan } from "@/components/tools/EijuShindan";
import { Disclaimer } from "@/components/article/Disclaimer";

export const metadata: Metadata = {
  title: "【診断】改定後もあなたは永住申請できるか｜セルフチェック",
  description:
    "永住許可ガイドライン改定案（2027年4月適用）に対応したセルフ診断。立場・年数・申請時期を選ぶだけで、特例年数の充足と適用される新しい考慮要素（世帯収入・年金・日本語B1など）をブラウザ内で確認できます。入力内容は送信・保存されません。",
};

export default function EijuShindanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold text-brand-600">診断ツール</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">
        【診断】改定後もあなたは永住申請できるか
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        2026年8月公表の永住許可ガイドライン改定案（2027年4月1日以降の申請に適用）と現行ガイドラインをもとに、
        あなたの立場と年数でどのルートに乗れるか、どの考慮要素が適用されるかをセルフチェックできます。
        判定基準は改定案・現行ガイドラインの原文（e-Gov 案件番号315000140）に基づきます。
      </p>
      <div className="mt-4 rounded-md border-l-4 border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        改定案は意見募集中（2026年9月3日必着）の確定前の案です。本診断は一般的な年数基準との照合であり、
        許可の可否を判定・保証するものではありません。
      </div>

      <div className="mt-8">
        <EijuShindan />
      </div>

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}
