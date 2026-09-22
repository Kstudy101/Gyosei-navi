"use client";

import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    PagefindUI?: new (opts: Record<string, unknown>) => unknown;
  }
}

/**
 * Pagefind UI（postbuild で out/pagefind/ に生成される検索インデックス）を読み込む。
 * 開発サーバではインデックスが存在しないため、読み込み失敗時は案内文を出す。
 */
export function PagefindSearch() {
  const [failed, setFailed] = useState(false);

  return (
    <div>
      <link rel="stylesheet" href="/pagefind/pagefind-ui.css" precedence="default" />
      <Script
        src="/pagefind/pagefind-ui.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.PagefindUI) {
            new window.PagefindUI({ element: "#pagefind-search", showSubResults: true });
          }
        }}
        onError={() => setFailed(true)}
      />
      <div id="pagefind-search" />
      {failed && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          検索インデックスを読み込めませんでした（開発環境ではビルド後のみ利用できます）。
        </p>
      )}
    </div>
  );
}
