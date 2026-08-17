import type { ReactNode } from "react";

/**
 * 現行 vs 改定案 などの比較表。
 * 例: <CompareTable headers={["項目", "現行", "改定案"]} rows={[["年収", "…", "…"]]} />
 */
export function CompareTable({
  caption,
  headers,
  rows,
}: {
  caption?: string;
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        {caption && (
          <caption className="mb-2 text-left text-xs text-gray-500">{caption}</caption>
        )}
        <thead>
          <tr className="bg-brand-50">
            {headers.map((h) => (
              <th
                key={h}
                scope="col"
                className="border border-gray-300 px-3 py-2 text-left font-semibold text-brand-900"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : undefined}>
              {row.map((cell, j) => (
                <td key={j} className="border border-gray-300 px-3 py-2 align-top leading-relaxed">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
