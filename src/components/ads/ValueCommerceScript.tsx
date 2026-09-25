import { isValueCommerceEnabled } from "@/lib/ads/flags";

/** サイトごとの ValueCommerce ID（公開値。ページ HTML に出る前提のもの） */
const VC_PID = "892709099";

/**
 * ValueCommerce の vcdal.js を全ページに1回だけ読み込む。
 * 提携済み広告主ドメインへのリンク（記事本文中の手書きリンクを含む）が
 * 自動でアフィリエイトURLに変換される。production のみ出力する。
 * Analytics.tsx の AdSense と同じ理由で next/script ではなく素の <script> を使う
 * （静的HTMLにタグを残し、ASP側の設置確認クローラーに検出させる）。
 */
export function ValueCommerceScript() {
  if (process.env.NODE_ENV !== "production" || !isValueCommerceEnabled()) return null;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `var vc_pid = ${JSON.stringify(VC_PID)};` }} />
      <script async src="https://aml.valuecommerce.com/vcdal.js" />
    </>
  );
}
