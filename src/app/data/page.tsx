import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "資料室",
  description:
    "行政書士業務に関わる官公庁の一次情報リンク集。出入国在留管理庁・e-Gov・総務省などの公式情報源をまとめています。",
};

/** prompts/monitor/sources.yaml の監視ソースと同期させること */
const SOURCES = [
  {
    name: "出入国在留管理庁",
    url: "https://www.moj.go.jp/isa/",
    note: "在留資格・永住・帰化・育成就労など入管関連の一次情報",
  },
  {
    name: "出入国在留管理庁 申請手続案内（永住許可ガイドライン等）",
    url: "https://www.moj.go.jp/isa/applications/guide/",
    note: "永住許可に関するガイドラインなど審査基準の公表ページ",
  },
  {
    name: "e-Gov パブリック・コメント",
    url: "https://public-comment.e-gov.go.jp/",
    note: "省令・ガイドライン改正案への意見公募。制度改正の最速シグナル",
  },
  {
    name: "総務省",
    url: "https://www.soumu.go.jp/",
    note: "行政書士制度の所管官庁",
  },
  {
    name: "日本行政書士会連合会",
    url: "https://www.gyosei.or.jp/",
    note: "行政書士会の公式情報・制度案内",
  },
  {
    name: "デジタル庁",
    url: "https://www.digital.go.jp/",
    note: "電子申請・行政手続きデジタル化の一次情報",
  },
  {
    name: "国土交通省",
    url: "https://www.mlit.go.jp/",
    note: "建設業許可・運送業許可などの所管官庁",
  },
  {
    name: "jGrants（補助金電子申請システム）",
    url: "https://www.jgrants-portal.go.jp/",
    note: "国の補助金の公募情報・電子申請",
  },
] as const;

/** 編集部が公的オープンデータから作成した集計データ（public/downloads/ に配置） */
const DATASETS = [
  {
    name: "都道府県別 介護事業所×高齢化×外国人材受け入れ 統計（2026年6月末）",
    file: "/downloads/kaigo-pref-stats-2026-06.csv",
    format: "CSV（UTF-8・47都道府県×9指標）",
    updated: "2026-08-17",
    note: "介護事業所数・高齢者人口・75歳以上1万人当たり事業所数・登録支援機関兼業率を都道府県別に集計。個別事業所・法人の情報は含みません。",
    source:
      "厚生労働省「介護サービスの情報公表システム オープンデータ」（2026年6月末）／出入国在留管理庁「登録支援機関登録簿」（2026年8月10日現在）／総務省「住民基本台帳に基づく人口」（令和7年1月1日現在）を編集部が加工",
  },
] as const;

export default function DataPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">資料室</h1>
      <p className="mt-2 text-sm text-gray-600">
        本サイトが参照する官公庁の一次情報リンク集と、編集部が公的オープンデータから作成した集計データです。手続きの際は必ず公式情報をご確認ください。
      </p>

      <h2 className="mt-8 text-lg font-bold text-gray-900">編集部作成データ</h2>
      <ul className="mt-4 space-y-4">
        {DATASETS.map((d) => (
          <li key={d.file} className="rounded-lg border border-gray-200 p-4">
            <a href={d.file} download className="font-semibold text-brand-600 hover:underline">
              {d.name}
            </a>
            <p className="mt-1 text-sm text-gray-600">{d.note}</p>
            <p className="mt-2 text-xs text-gray-500">
              {d.format} ／ 更新: {d.updated}
            </p>
            <p className="mt-1 text-xs text-gray-500">出典: {d.source}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-gray-500">
        編集部作成データは出典を明記のうえ自由にご利用いただけます（出典元データの利用条件に従います）。
      </p>

      <h2 className="mt-10 text-lg font-bold text-gray-900">官公庁の一次情報</h2>
      <ul className="mt-4 space-y-4">
        {SOURCES.map((s) => (
          <li key={s.url} className="rounded-lg border border-gray-200 p-4">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-600 hover:underline"
            >
              {s.name}
            </a>
            <p className="mt-1 text-sm text-gray-600">{s.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
