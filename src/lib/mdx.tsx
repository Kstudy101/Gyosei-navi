import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";

/**
 * MDX を RSC 上でコンパイル・実行する自前パイプライン。
 * next-mdx-remote を使わないのは React 19 との peer 依存衝突を避けるため。
 */
export async function renderMdx(
  source: string,
  components: MDXComponents
): Promise<ReactNode> {
  const compiled = await compile(source, {
    outputFormat: "function-body",
    development: false,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
  });
  const { default: MDXContent } = await run(String(compiled), {
    ...runtime,
    baseUrl: import.meta.url,
  });
  return <MDXContent components={components} />;
}
