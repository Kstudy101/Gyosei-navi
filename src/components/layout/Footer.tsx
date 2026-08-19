import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SECTIONS, CATEGORIES } from "@/config/taxonomy";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-brand-800">{siteConfig.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {siteConfig.description}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">コンテンツ</p>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.entries(SECTIONS).map(([key, s]) => (
                <li key={key}>
                  <Link href={s.path} className="text-gray-600 hover:text-brand-600">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">分野別ガイド</p>
            <ul className="mt-2 space-y-1 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.code}>
                  <Link
                    href={`/guide/${c.code}`}
                    className="text-gray-600 hover:text-brand-600"
                  >
                    {c.labelShort}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 法19条対応: 全ページ固定の免責文（docs/06 §3.1） */}
        <div className="mt-8 rounded-md border border-gray-200 bg-white p-4 text-xs leading-relaxed text-gray-500">
          <p>{siteConfig.disclaimer}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            <li>
              <Link href="/about" className="hover:text-brand-600">運営者情報</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-600">お問い合わせ</Link>
            </li>
            <li>
              <Link href="/ads" className="hover:text-brand-600">広告掲載について</Link>
            </li>
            <li>
              <Link href="/policy/disclaimer" className="hover:text-brand-600">免責事項</Link>
            </li>
            <li>
              <Link href="/policy/privacy" className="hover:text-brand-600">プライバシーポリシー</Link>
            </li>
          </ul>
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
        </div>
      </div>
    </footer>
  );
}
