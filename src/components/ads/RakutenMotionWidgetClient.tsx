"use client";

import { useEffect, useRef } from "react";

const WIDGET_SRC = "https://xml.affiliate.rakuten.co.jp/widget/js/rakuten_widget.js?20230106";

/**
 * Rakuten公式の動的コンテンツ連携（モーションウィジェット）スニペットを
 * IntersectionObserver で画面近くに来るまで挿入しない（作業指示書 §11 lazy load）。
 * 設定値（affiliateId・ts）は Server Component 側（RakutenMotionWidget.tsx）が
 * 環境変数から解決して props で渡すだけ — このファイルに固定値は置かない。
 */
export function RakutenMotionWidgetClient({ affiliateId, widgetTs }: { affiliateId: string; widgetTs: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (injectedRef.current || !entries.some((e) => e.isIntersecting)) return;
        injectedRef.current = true;

        const config = document.createElement("script");
        config.type = "text/javascript";
        config.text = [
          `rakuten_design=${JSON.stringify("slide")};`,
          `rakuten_affiliateId=${JSON.stringify(affiliateId)};`,
          `rakuten_items=${JSON.stringify("ctsmatch")};`,
          `rakuten_genreId=${JSON.stringify("0")};`,
          `rakuten_size=${JSON.stringify("468x160")};`,
          `rakuten_target=${JSON.stringify("_blank")};`,
          `rakuten_theme=${JSON.stringify("gray")};`,
          `rakuten_border=${JSON.stringify("off")};`,
          `rakuten_auto_mode=${JSON.stringify("on")};`,
          `rakuten_genre_title=${JSON.stringify("off")};`,
          `rakuten_recommend=${JSON.stringify("on")};`,
          `rakuten_ts=${JSON.stringify(widgetTs)};`,
        ].join("");
        el.appendChild(config);

        const loader = document.createElement("script");
        loader.type = "text/javascript";
        loader.src = WIDGET_SRC;
        loader.async = true;
        el.appendChild(loader);

        observer.disconnect();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [affiliateId, widgetTs]);

  // min-height はウィジェット表示分の概算（CLS対策）。実際のコンテンツは動的で完全一致はしない
  return <div ref={containerRef} className="min-h-[180px] w-full" />;
}
