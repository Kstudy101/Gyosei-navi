/** JSON-LD 構造化データ出力（Article / FAQPage / BreadcrumbList / Organization 等） */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
