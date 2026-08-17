import Script from "next/script";
import { siteConfig } from "@/config/site";

/**
 * 計測タグ（GA4 / Microsoft Clarity）
 *   - ID は siteConfig.analytics（= NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_CLARITY_ID）から取得
 *   - ID が空なら何も出力しない → 未設定環境・開発中は計測されない
 *   - production 以外では出力しない（開発アクセスで数字を汚さない）
 *   - プライバシーポリシー（/policy/privacy 第4条）に「導入する場合がある」旨を記載済み
 */
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;
  const { ga4, clarity } = siteConfig.analytics;
  if (!ga4 && !clarity) return null;

  return (
    <>
      {ga4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ga4)},{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {clarity && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarity)});`}
        </Script>
      )}
    </>
  );
}
