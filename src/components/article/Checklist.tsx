export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="not-prose my-6 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-gray-800">
          <span aria-hidden="true" className="mt-0.5 select-none text-brand-600">□</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
