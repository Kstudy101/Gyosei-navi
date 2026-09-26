import Link from "next/link";
import { siteConfig } from "@/config/site";
import { formatJaDate } from "@/lib/home";

/** 奥付。発行・編集方針・最終更新を便利帳の裏表紙の形式で */
export function Colophon({ updatedAt }: { updatedAt: string }) {
  const dt = "text-xs text-gray-600 dark:text-gray-400";
  const dd = "text-sm text-gray-900 dark:text-gray-100";
  return (
    <section aria-labelledby="home-colophon" className="mt-10 border-t-2 border-brand-800 pt-3 dark:border-brand-100">
      <h2 id="home-colophon" className="sr-only">
        奥付
      </h2>
      <dl className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-2">
        <dt className={dt}>発行</dt>
        <dd className={dd}>{siteConfig.name} 編集部</dd>
        <dt className={dt}>最終更新</dt>
        <dd className={`${dd} tabular-nums`}>{formatJaDate(updatedAt)}</dd>
        <dt className={dt}>編集方針</dt>
        <dd className={dd}>
          <ul className="space-y-1">
            <li>一次情報主義 — 国・都道府県・市区町村の公式発表を原文で確認し、全記事に出典を明記します。</li>
            <li>募集状況の明示 — 募集中・締切・通年を区別して記事上部に表示します。</li>
            <li>訂正の公開 — 誤りは記事を修正のうえ、更新履歴に訂正内容を残します。</li>
          </ul>
        </dd>
      </dl>
      <p className="mt-3 flex flex-wrap gap-x-4 text-xs">
        <Link href="/about" className="text-brand-600 hover:underline focus-visible:underline dark:text-brand-100">
          運営者情報・編集方針の詳細
        </Link>
        <Link href="/policy/disclaimer" className="text-brand-600 hover:underline focus-visible:underline dark:text-brand-100">
          免責事項
        </Link>
      </p>
    </section>
  );
}
