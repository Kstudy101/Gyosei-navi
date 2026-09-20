import type { MDXComponents } from "mdx/types";
import type { ArticleFrontmatter } from "@/lib/content-schema";
import { Callout } from "@/components/article/Callout";
import { Checklist } from "@/components/article/Checklist";
import { CompareTable } from "@/components/article/CompareTable";
import { Disclaimer } from "@/components/article/Disclaimer";
import { FaqList } from "@/components/article/FaqList";
import { SourceLinkList } from "@/components/article/SourceLinkList";
import { SubsidyInfoCard } from "@/components/article/SubsidyInfoCard";
import { RakutenRelatedProducts } from "@/components/ads/RakutenRelatedProducts";
import { RakutenMotionWidget } from "@/components/ads/RakutenMotionWidget";

/**
 * MDX 本文で使えるコンポーネント一覧（docs/03 §4 v2）。
 * <FAQ /> / <SourceLinkList /> は frontmatter のデータを自動展開するため、
 * 記事ごとにバインドして生成する。
 * v1 にあった LineCta/ConsultCta/Deadline/NoticeBanner は
 * 該当する仕組み（LINE運用・CTA分離・締切マスター・noticeLevel）が
 * v2 で廃止/未導入のため含めない。
 *
 * RakutenRelatedProducts / RakutenMotionWidget は ArticleView.tsx が自動挿入するため
 * 通常は本文への手書きは不要。定型位置（本文直後 / 記事末尾）と違う場所に置きたい記事だけ、
 * 明示的に本文へ書けば自動挿入は行われない（bodyHas 判定・SubsidyInfoCard 等と同じ仕組み）。
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
    RakutenRelatedProducts: () => <RakutenRelatedProducts category={fm.category} articleId={fm.slug} />,
    RakutenMotionWidget: () => <RakutenMotionWidget />,
  };
}
