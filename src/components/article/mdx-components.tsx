import type { MDXComponents } from "mdx/types";
import type { ArticleFrontmatter } from "@/lib/content-schema";
import { Callout } from "@/components/article/Callout";
import { Checklist } from "@/components/article/Checklist";
import { CompareTable } from "@/components/article/CompareTable";
import { Disclaimer } from "@/components/article/Disclaimer";
import { FaqList } from "@/components/article/FaqList";
import { SourceLinkList } from "@/components/article/SourceLinkList";
import { SubsidyInfoCard } from "@/components/article/SubsidyInfoCard";

/**
 * MDX 本文で使えるコンポーネント一覧（docs/03 §4 v2）。
 * <FAQ /> / <SourceLinkList /> は frontmatter のデータを自動展開するため、
 * 記事ごとにバインドして生成する。
 * v1 にあった LineCta/ConsultCta/Deadline/NoticeBanner は
 * 該当する仕組み（LINE運用・CTA分離・締切マスター・noticeLevel）が
 * v2 で廃止/未導入のため含めない。
 */
export function buildMdxComponents(fm: ArticleFrontmatter): MDXComponents {
  return {
    Callout,
    Checklist,
    CompareTable: () => <CompareTable targets={fm.compareTargets} />,
    Disclaimer,
    FAQ: () => <FaqList items={fm.faq} />,
    SourceLinkList: () => <SourceLinkList items={fm.sourceLinks} />,
    SubsidyInfoCard: () => (fm.subsidy ? <SubsidyInfoCard subsidy={fm.subsidy} /> : null),
  };
}
