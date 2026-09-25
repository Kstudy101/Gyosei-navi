/**
 * ValueCommerce 提携広告主レジストリ。
 * 広告主を追加する時は、このファイルの `advertisers` に1件足すだけでよい
 * （記事への出し分けは pick.ts が記事と無関係にランダムで行う）。
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
  /**
   * バナー/ロゴ画像（任意）。ValueCommerce 管理画面で提供された素材か、
   * 広告主の利用規約上使ってよい画像を public/ads/valuecommerce/ に置いて "/ads/valuecommerce/xxx.png" を指定する。
   * 未指定ならテキストのみのカードになる。
   */
  image?: { src: string; alt: string; width: number; height: number };
}

export const advertisers: VcAdvertiser[] = [
  {
    id: "jalan",
    image: { src: "/ads/valuecommerce/jalan.png", alt: "じゃらん", width: 1200, height: 630 },
    name: "じゃらん",
    url: "https://www.jalan.net/",
    headline: "宿泊・旅行の予約はじゃらんで",
    description: "国内の宿・ホテル・旅行プランを検索・予約できます。",
    cta: "じゃらんで宿を探す",
  },
  {
    id: "daimaru-matsuzakaya",
    image: { src: "/ads/valuecommerce/daimaru-matsuzakaya.png", alt: "大丸松坂屋オンラインショッピング", width: 144, height: 144 },
    name: "大丸松坂屋オンラインショッピング",
    url: "https://www.daimaru-matsuzakaya.jp/",
    headline: "ギフト選びは大丸松坂屋オンラインで",
    description: "出産祝い・内祝い・結婚祝いなど、贈り物に使えるギフトを取り扱っています。",
    cta: "大丸松坂屋オンラインを見る",
  },
  {
    id: "supernurse",
    image: { src: "/ads/valuecommerce/supernurse.jpg", alt: "スーパーナース 看護師求人支援サービス", width: 1200, height: 630 },
    name: "スーパーナース",
    url: "https://www.supernurse.co.jp/",
    headline: "看護師の求人・転職はスーパーナースで",
    description: "看護師向けの求人検索・派遣・転職支援サービス。専任コーディネーターがサポートします。",
    cta: "スーパーナースで求人を探す",
  },
  {
    id: "yahoo-shopping",
    name: "Yahoo!ショッピング",
    url: "https://shopping.yahoo.co.jp/",
    image: { src: "/ads/valuecommerce/yahoo-shopping.png", alt: "Yahoo!ショッピング", width: 1200, height: 630 },
    headline: "暮らしの必需品はYahoo!ショッピングで",
    description: "ベビー用品・家電・日用品など幅広い商品をオンラインで探せます。",
    cta: "Yahoo!ショッピングで探す",
  },
  {
    id: "sourcenext",
    name: "ソースネクスト",
    url: "https://www.sourcenext.com/",
    headline: "パソコンソフト・便利ガジェットはソースネクスト",
    description: "ソフトウェアや翻訳機など、暮らしと仕事に役立つ商品を取り扱っています。",
    cta: "ソースネクストを見る",
  },
  {
    id: "lojel",
    name: "LOJEL",
    url: "https://jp.lojel.com/",
    image: { src: "/ads/valuecommerce/lojel.webp", alt: "LOJEL スーツケース", width: 1200, height: 800 },
    headline: "旅行・出張のスーツケースはLOJELで",
    description: "旅先での使いやすさにこだわったスーツケース・バッグを取り扱っています。",
    cta: "LOJELを見る",
  },
  {
    id: "reysta",
    name: "中古パソコン REYSTA",
    url: "https://reysta.ecopc.co.jp/",
    image: { src: "/ads/valuecommerce/reysta.jpg", alt: "中古パソコン専門店 ECOPC REYSTA", width: 200, height: 60 },
    headline: "中古パソコンをお探しならREYSTA",
    description: "Windows11対応の中古ノートPC・デスクトップPCを、保証付きで販売しています。",
    cta: "REYSTAを見る",
  },
  {
    id: "tabelog",
    name: "食べログ",
    url: "https://tabelog.com/",
    image: { src: "/ads/valuecommerce/tabelog.gif", alt: "食べログ", width: 200, height: 200 },
    headline: "お店探し・予約は食べログで",
    description: "全国のレストラン情報を口コミやランキングから探せて、ネット予約もできます。",
    cta: "食べログで探す",
  },
  {
    id: "look-it",
    name: "LOOKIT!（ルキット）",
    url: "https://www.look-it.jp/",
    image: { src: "/ads/valuecommerce/look-it.png", alt: "LOOKIT! オフィス家具通販", width: 450, height: 129 },
    headline: "オフィス家具の通販はLOOKIT!",
    description: "創業・開業時のオフィスづくりに使える事務用家具を幅広く取り扱っています。",
    cta: "LOOKIT!を見る",
  },
  {
    id: "wego",
    name: "WEGO",
    url: "https://wego.jp/",
    image: { src: "/ads/valuecommerce/wego.jpg", alt: "WEGO ONLINE STORE", width: 1200, height: 628 },
    headline: "ファッション通販はWEGOで",
    description: "メンズ・レディースの人気アイテムを取り扱う公式通販サイトです。",
    cta: "WEGOを見る",
  },
  {
    id: "ozmall",
    name: "OZmall",
    url: "https://www.ozmall.co.jp/",
    headline: "お出かけ・リフレッシュの予約はOZmallで",
    description: "レストランやスパ、宿泊などの予約ができる女性向けサービスです。",
    cta: "OZmallを見る",
  },
  {
    id: "taylormade",
    name: "テーラーメイド ゴルフ",
    url: "https://www.taylormadegolf.jp/",
    headline: "ゴルフ用品はテーラーメイドで",
    description: "ゴルフクラブをはじめとするゴルフ用品を取り扱う公式サイトです。",
    cta: "テーラーメイドを見る",
  },
  {
    id: "aandf",
    name: "A&F オンラインストア",
    url: "https://aandfstore.com/",
    image: { src: "/ads/valuecommerce/aandfstore.png", alt: "A&F COUNTRY", width: 396, height: 56 },
    headline: "アウトドア用品はA&Fオンラインストアで",
    description: "アウトドアブランドの製品を取り扱う公式通販サイトです。",
    cta: "A&Fを見る",
  },
  {
    id: "iittala",
    name: "イッタラ＆アラビア",
    url: "https://www.iittala.jp/",
    image: { src: "/ads/valuecommerce/iittala.jpg", alt: "イッタラ・アラビア", width: 300, height: 300 },
    headline: "北欧食器はイッタラ＆アラビアで",
    description: "マグ・グラス・プレートなど北欧デザインの食器を取り扱う公式通販です。",
    cta: "イッタラを見る",
  },
  {
    id: "royalcopenhagen",
    name: "ロイヤル コペンハーゲン",
    url: "https://www.royalcopenhagen.jp/",
    image: { src: "/ads/valuecommerce/royalcopenhagen.png", alt: "ロイヤル コペンハーゲン", width: 1462, height: 445 },
    headline: "引出物・内祝いのギフトはロイヤル コペンハーゲンで",
    description: "引出物・内祝い・お返しに使えるギフトを取り扱う公式オンラインストアです。",
    cta: "ロイヤル コペンハーゲンを見る",
  },
  {
    id: "tiding-leather",
    name: "TIDING SHOP",
    url: "https://store.shopping.yahoo.co.jp/tidingleather/",
    headline: "本革の財布・バッグはTIDING SHOPで",
    description: "メンズ向けの本革バッグ・財布・ベルトを取り扱うYahoo!ショッピングの店舗です。",
    cta: "TIDING SHOPを見る",
  },
  {
    id: "yahoo-travel-dp",
    name: "Yahoo!トラベル ヤフーパック",
    url: "https://travel.yahoo.co.jp/dp/",
    headline: "航空券＋宿泊のセット予約はYahoo!トラベルで",
    description: "JAL・ANA便とホテルをセットで予約できるダイナミックパッケージです。",
    cta: "Yahoo!トラベルを見る",
  },
  {
    id: "shopjapan",
    name: "ショップジャパン",
    url: "https://www.shopjapan.co.jp/",
    image: { src: "/ads/valuecommerce/shopjapan.png", alt: "ショップジャパン", width: 246, height: 62 },
    headline: "テレビショッピングの商品はショップジャパンで",
    description: "テレビショッピングで紹介された商品を取り扱う公式通販サイトです。",
    cta: "ショップジャパンを見る",
  },
  {
    id: "ordersuit",
    name: "オーダースーツSADA",
    url: "https://www.ordersuit.info/",
    image: { src: "/ads/valuecommerce/ordersuit.png", alt: "オーダースーツSADA", width: 800, height: 450 },
    headline: "オーダースーツはSADAで",
    description: "自社工場直販のフルオーダースーツ専門店です。",
    cta: "オーダースーツSADAを見る",
  },
  {
    id: "andplants",
    name: "AND PLANTS",
    url: "https://andplants.jp/",
    image: { src: "/ads/valuecommerce/andplants.jpg", alt: "AND PLANTS 観葉植物・お花の通販", width: 1200, height: 630 },
    headline: "観葉植物・お花の通販はAND PLANTSで",
    description: "観葉植物・花束・アレンジメントなどを取り扱う通販サイトです。",
    cta: "AND PLANTSを見る",
  },
  {
    id: "eeo-store",
    name: "eeo Store",
    url: "https://eeo.today/store/101/",
    image: { src: "/ads/valuecommerce/eeo-store.png", alt: "eeo Store アニメグッズ通販", width: 1200, height: 630 },
    headline: "アニメ・ゲームグッズはeeo Storeで",
    description: "アニメ・ゲーム・キャラクターグッズを取り扱う通販サイトです。",
    cta: "eeo Storeを見る",
  },
  {
    id: "ntt-flets",
    name: "フレッツ光（NTT東日本）",
    url: "https://ntt-flets.com/",
    headline: "光回線のお申し込みはフレッツ光で",
    description: "NTT東日本が提供する光回線サービスのお申し込みサイトです。",
    cta: "フレッツ光を見る",
  },
  {
    id: "fit-chan",
    name: "フィットちゃんランドセル",
    url: "https://shopping.geocities.jp/fit-chan/",
    headline: "ランドセル選びはフィットちゃんで",
    description: "カタログ請求もできるランドセルの公式Yahoo!店です。",
    cta: "フィットちゃんを見る",
  },
  {
    id: "tobu-top-tours",
    name: "東武トップツアーズ",
    url: "https://tobutoptours.jp/",
    headline: "国内旅行・ツアーの予約は東武トップツアーズで",
    description: "国内旅行・海外旅行やホテル・宿の予約ができるサイトです。",
    cta: "東武トップツアーズを見る",
  },
  {
    id: "overe",
    name: "overE（オーバーイー）",
    url: "https://overe-shop.com/",
    image: { src: "/ads/valuecommerce/overe.jpg", alt: "overE 公式オンラインショップ", width: 1200, height: 628 },
    headline: "シャツ・スーツ・ワンピースはoverEで",
    description: "胸が大きな女性向けのシャツ・スーツ・ワンピースを取り扱う公式ショップです。",
    cta: "overEを見る",
  },
];
