import type { NextConfig } from "next";

/**
 * 배포: Xserver（レンタルサーバー / Apache）に静的ホスティング。
 *   - output: "export" → `next build` で out/ に静的 HTML を生成（Node ランタイム不要）
 *   - trailingSlash: true → /about/ → /about/index.html（Apache のディレクトリ解決と一致）
 *   - 画像最適化サーバは無いので unoptimized
 * 全ルートは SSG（generateStaticParams + dynamicParams=false）なので export 可能。
 * API Route（api/lead 等）を追加する場合は Xserver では動かない → 別サービス（docs/11 参照）。
 * MDX は自前パイプライン（src/lib/mdx.tsx）でビルド時に処理する。
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // ユーザーホーム直下に無関係な package-lock.json があり、Next.js がそれを
  // workspace root と誤認してビルドが失敗することがある（2026-09-20 発覚）。
  // 明示的にこのプロジェクトのディレクトリを指定して誤認を防ぐ。
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
