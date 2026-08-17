import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MDX は next-mdx ではなく自前パイプライン（src/lib/mdx.tsx）で処理する。
  // 記事は content/ 配下の MDX ファイルがビルド時に静的生成される。
  reactStrictMode: true,
};

export default nextConfig;
