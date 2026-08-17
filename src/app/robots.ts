import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// output: "export"（静的ホスティング）ではメタデータルートも静的生成を明示する必要がある
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
