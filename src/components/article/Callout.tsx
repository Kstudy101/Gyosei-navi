import type { ReactNode } from "react";

const STYLES = {
  info: "border-blue-300 bg-blue-50 text-blue-900",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  danger: "border-red-300 bg-red-50 text-red-900",
} as const;

const LABELS = {
  info: "参考",
  warning: "注意",
  danger: "重要",
} as const;

export function Callout({
  type = "info",
  children,
}: {
  type?: keyof typeof STYLES;
  children: ReactNode;
}) {
  return (
    <aside className={`not-prose my-6 rounded-md border-l-4 p-4 text-sm leading-relaxed ${STYLES[type]}`}>
      <p className="mb-1 font-bold">{LABELS[type]}</p>
      <div>{children}</div>
    </aside>
  );
}
