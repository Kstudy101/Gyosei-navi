import Link from "next/link";
import type { AdSlot } from "@/config/ads";

/**
 * 記事ページ両脇のデスクトップ広告レール（xl 以上でのみ表示）。
 * 広告主未定のスロットは「広告主募集中」プレースホルダー（/ads へ誘導）。
 * 「広告」ラベルは景品表示法・ステマ規制対応のため常時表示する（docs/06 §5）。
 */
export function AdRail({ slot }: { slot: AdSlot }) {
  return (
    <div className="sticky top-8">
      <p className="mb-1 text-center text-[10px] tracking-widest text-gray-400">広告</p>
      {slot.advertiser ? (
        <a
          href={slot.advertiser.url}
          target="_blank"
          rel="sponsored noopener"
          className="block overflow-hidden rounded-lg border border-gray-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 静的 export のため img 直書き */}
          <img
            src={slot.advertiser.imgSrc}
            alt={slot.advertiser.alt}
            className="h-auto w-full"
            loading="lazy"
          />
        </a>
      ) : (
        <Link
          href="/ads"
          className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-brand-600/40 bg-brand-50 p-4 text-center transition-colors hover:border-brand-600"
        >
          <span className="text-sm font-bold text-brand-800">広告主募集中</span>
          <span className="text-xs leading-relaxed text-gray-600">
            行政書士・士業事務所の
            <br />
            広告を掲載しませんか
          </span>
          <span className="text-xs font-semibold text-brand-600">掲載のご案内 →</span>
        </Link>
      )}
    </div>
  );
}
