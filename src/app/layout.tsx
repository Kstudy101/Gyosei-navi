import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BIZ_UDPGothic } from "next/font/google";
import "@/styles/globals.css";

// 自治体広報誌・くらしの便利帳と同じ UD ゴシック。ビルド時に取得して自己ホストする（output: export でも可）。
// 日本語のサブセットは unicode-range で分割配信されるため preload は行わない。
const bizUdpGothic = BIZ_UDPGothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-biz",
});
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Analytics } from "@/components/seo/Analytics";
import { ValueCommerceScript } from "@/components/ads/ValueCommerceScript";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}｜全国の補助金・助成金を地域で比較`,
    template: `%s｜${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  openGraph: {
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    // 記事ページは articleMetadata が自動生成OG画像で上書きする（src/lib/seo.ts）
    images: ["/og/default.png"],
  },
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
  // Discover の大きい画像カード表示条件（noindex ページは各 page の robots で上書きされる）
  robots: { "max-image-preview": "large" },
  verification: {
    google: "qtLMFQLhUFKVaMdo8UxKErTB_gVUDYP2ymnhGE6paM0",
  },
  other: siteConfig.analytics.adsense
    ? { "google-adsense-account": siteConfig.analytics.adsense }
    : undefined,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={bizUdpGothic.variable}>
      <body className="flex min-h-screen flex-col">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Analytics />
        <ValueCommerceScript />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
