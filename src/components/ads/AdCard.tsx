import Link from "next/link";
import type { AdSlot } from "@/config/ads";

/**
 * モバイル・タブレット用の横長広告カード（xl 未満で記事末尾に表示）。
 * デスクトップのレール（AdRail）が見えない画面幅の代替枠。
 */
export function AdCard({ slot }: { slot: AdSlot }) {
  return (
    <div>
      <p className="mb-1 text-[10px] tracking-widest text-gray-400">広告</p>
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
          className="flex items-center justify-between gap-4 rounded-lg border-2 border-dashed border-brand-600/40 bg-brand-50 px-5 py-4 transition-colors hover:border-brand-600"
        >
          <span className="text-sm leading-relaxed text-gray-700">
            <span className="font-bold text-brand-800">広告主募集中</span>
            <span className="mx-2 text-gray-400">|</span>
            行政書士・士業事務所の広告を掲載しませんか
          </span>
          <span className="shrink-0 text-xs font-semibold text-brand-600">ご案内 →</span>
        </Link>
      )}
    </div>
  );
}
