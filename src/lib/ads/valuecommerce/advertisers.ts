/**
 * ValueCommerce 提携広告主レジストリ。
 * 広告主を追加する時は、このファイルの `advertisers` に1件足すだけでよい
 * （記事への出し分けは match.ts が keywords / categories で自動判定する）。
 *
 * リンクは広告主の素のURLを書く。ページ全体に読み込まれる vcdal.js が、
 * 提携済み広告主ドメインへのリンクを自動でアフィリエイトURLへ変換する。
 * → 提携が承認されていない広告主は変換されず、ただの外部リンクになる点に注意。
 */
export interface VcAdvertiser {
  /** 一意なID（計測イベントの識別にも使う） */
  id: string;
  name: string;
  /** 遷移先URL（広告主ドメイン配下。vcdal.js が変換する） */
  url: string;
  /** 記事下カードの見出し・説明・ボタン文言 */
  headline: string;
  description: string;
  cta: string;
  /** 記事タイトル・説明・タグ・本文に含まれていたら関連ありと判定する語 */
  keywords: string[];
  /** taxonomy.ts の CATEGORY_CODES。記事カテゴリが一致したら加点 */
  categories?: string[];
}

export const advertisers: VcAdvertiser[] = [
  {
    id: "jalan",
    name: "じゃらん",
    url: "https://www.jalan.net/",
    headline: "宿泊・旅行の予約はじゃらんで",
    description: "国内の宿・ホテル・旅行プランを検索・予約できます。",
    cta: "じゃらんで宿を探す",
    keywords: ["旅行", "宿泊", "観光", "温泉", "ホテル", "旅館", "帰省", "ふるさと納税", "移住体験", "お試し移住"],
  },
  {
    id: "daimaru-matsuzakaya",
    name: "大丸松坂屋オンラインショッピング",
    url: "https://www.daimaru-matsuzakaya.jp/",
    headline: "ギフト選びは大丸松坂屋オンラインで",
    description: "出産祝い・内祝い・結婚祝いなど、贈り物に使えるギフトを取り扱っています。",
    cta: "大丸松坂屋オンラインを見る",
    keywords: ["出産祝い", "内祝い", "結婚祝い", "引き出物", "ギフト", "お祝い", "敬老", "ブライダル"],
    categories: ["shussan", "kekkon"],
  },
];
