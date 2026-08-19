"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pagefind の検索 UI（クライアント側で /pagefind/pagefind-ui.js を動的ロード）。
 * インデックスは postbuild（`pagefind --site out`）で生成されるため、
 * `next dev` では存在しない — その場合は案内文を表示する。
 */
export function SearchBox() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    let cancelled = false;

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/pagefind/pagefind-ui.css";
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = "/pagefind/pagefind-ui.js";
    script.onload = () => {
      if (cancelled || !boxRef.current) return;
      // pagefind-ui.js がグローバルに定義する PagefindUI を使う
      const PagefindUI = (window as unknown as { PagefindUI: new (o: object) => unknown }).PagefindUI;
      new PagefindUI({
        element: boxRef.current,
        showSubResults: true,
        showImages: false,
        translations: {
          placeholder: "記事を検索（例: 永住 収入要件）",
          zero_results: "「[SEARCH_TERM]」に一致する記事は見つかりませんでした",
          clear_search: "クリア",
          load_more: "さらに表示",
          many_results: "「[SEARCH_TERM]」の検索結果 [COUNT] 件",
          one_result: "「[SEARCH_TERM]」の検索結果 1 件",
        },
      });
      setState("ready");
    };
    script.onerror = () => !cancelled && setState("unavailable");
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      css.remove();
      script.remove();
    };
  }, []);

  return (
    <div>
      {state === "unavailable" && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          検索インデックスを読み込めませんでした。開発環境ではビルド後（`npm run build`）にのみ利用できます。
        </p>
      )}
      <div ref={boxRef} />
    </div>
  );
}
