import { siteConfig } from "@/config/site";

/**
 * LINE 公式アカウントへの誘導 CTA。
 * アカウント開設（Phase 1 / M2 予定）までは「準備中」表示。
 * 開設後は siteConfig.social.line に URL を設定するだけで有効化される。
 */
export function LineCta() {
  const lineUrl = siteConfig.social.line;
  return (
    <aside className="not-prose my-8 rounded-lg border border-green-200 bg-green-50 p-5">
      <p className="font-semibold text-green-900">
        制度改正の速報を LINE でお届けします
      </p>
      {lineUrl ? (
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          LINE 友だち追加
        </a>
      ) : (
        <p className="mt-2 text-sm text-green-800">
          LINE 公式アカウントは現在準備中です。開設までしばらくお待ちください。
        </p>
      )}
    </aside>
  );
}
