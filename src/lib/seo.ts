import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const absoluteUrl = (path: string): string =>
  new URL(path, siteConfig.url).toString();

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
  };
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: absoluteUrl(opts.path) },
  };
}
