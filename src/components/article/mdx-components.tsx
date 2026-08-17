import type { MDXComponents } from "mdx/types";
import type { ArticleFrontmatter } from "@/lib/content-schema";
import { Callout } from "@/components/article/Callout";
import { Checklist } from "@/components/article/Checklist";
import { CompareTable } from "@/components/article/CompareTable";
import { Disclaimer } from "@/components/article/Disclaimer";
import { FaqList } from "@/components/article/FaqList";
import { LegalBasisList } from "@/components/article/LegalBasisList";
import { NoticeBanner } from "@/components/article/NoticeBanner";
import { UpdateLog } from "@/components/article/UpdateLog";
import { LineCta } from "@/components/cta/LineCta";
import { ConsultCta } from "@/components/cta/ConsultCta";

/**
 * MDX 本文で使えるコンポーネント一覧（docs/03 §4）。
 * <FAQ /> / <LegalBasisList /> / <UpdateLog /> は frontmatter のデータを
 * 自動展開するため、記事ごとにバインドして生成する。
 */
export function buildMdxComponents(fm: ArticleFrontmatter): MDXComponents {
  return {
    Callout,
    Checklist,
    CompareTable,
    Disclaimer,
    LineCta,
    ConsultCta,
    FAQ: () => <FaqList items={fm.faq} />,
    LegalBasisList: () => <LegalBasisList items={fm.legalBasis} />,
    UpdateLog: () => <UpdateLog changelog={fm.changelog} />,
    NoticeBanner: () => <NoticeBanner level={fm.noticeLevel} />,
  };
}
