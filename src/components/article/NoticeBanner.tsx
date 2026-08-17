import { NOTICE_LEVELS, type NoticeLevel } from "@/config/taxonomy";

const TONE_STYLES: Record<string, string> = {
  neutral: "border-gray-300 bg-gray-50 text-gray-800",
  info: "border-blue-300 bg-blue-50 text-blue-900",
  warning: "border-amber-400 bg-amber-50 text-amber-900",
  danger: "border-red-400 bg-red-50 text-red-900",
};

/** noticeLevel に応じた制度ステータス警告バナー（記事上部に自動挿入） */
export function NoticeBanner({ level }: { level: NoticeLevel }) {
  const def = NOTICE_LEVELS[level];
  if (!def.banner) return null;
  return (
    <div
      role="note"
      className={`my-4 rounded-md border p-4 text-sm leading-relaxed ${TONE_STYLES[def.tone]}`}
    >
      <span className="mr-2 inline-block rounded border border-current px-1.5 py-0.5 text-xs font-bold">
        {def.label}
      </span>
      {def.banner}
    </div>
  );
}
