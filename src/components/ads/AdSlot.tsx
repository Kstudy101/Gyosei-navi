import type { ReactNode } from "react";
import type { AdProvider, AdType, AdPlacement } from "@/lib/ads/types";

/**
 * 広告枠の共通 Shell（作業指示書 §7, §13）。
 * provider/type/placement は表示ロジックを持たず data-* 属性として出すのみ
 * （将来 Amazon/ASP/Direct を追加しても、この Shell 自体は変更不要）。
 * 「PR」表示・検索インデックス除外(data-pagefind-ignore)・本文 prose からの独立(not-prose) を一括で保証する。
 * 表示可否（Feature Flag・データ有無）は呼び出し側で判定してから使うこと。
 */
export function AdSlot({
  provider,
  type,
  placement,
  heading,
  children,
}: {
  provider: AdProvider;
  type: AdType;
  placement: AdPlacement;
  heading?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="not-prose my-10 rounded-lg border border-gray-200 bg-gray-50 p-4"
      data-pagefind-ignore
      data-ad-provider={provider}
      data-ad-type={type}
      data-ad-placement={placement}
    >
      <div className="flex items-center gap-2">
        <span className="rounded border border-gray-400 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gray-600">
          PR
        </span>
        {heading && <h2 className="text-sm font-bold text-gray-700">{heading}</h2>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
