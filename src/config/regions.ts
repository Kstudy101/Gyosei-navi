/**
 * 地域コード ↔ ローマ字スラッグ マッピング v2（新設）
 * 設計意図: docs/01_IA_TAXONOMY.md §4.1
 *
 * 識別子は総務省 全国地方公共団体コード（5桁）を正とする。
 * 表示・URL 用のローマ字スラッグはこのファイルでのみ管理する（docs/02 設計原則5）。
 *
 * 現状: 47都道府県は全件登録。市区町村（約1,700）は全件を一度に持たず、
 * 記事化・データ確保が進んだ地域から追加する（docs/00 v2 §8 ロードマップの段階拡大方針）。
 * 未登録の市区町村を参照するコードは、登録前提にせず `unresearched` 状態として扱うこと。
 */

export interface PrefectureDef {
  /** 総務省 都道府県コード（2桁） */
  code: string;
  slug: string;
  labelJa: string;
}

export const PREFECTURES: readonly PrefectureDef[] = [
  { code: "01", slug: "hokkaido", labelJa: "北海道" },
  { code: "02", slug: "aomori", labelJa: "青森県" },
  { code: "03", slug: "iwate", labelJa: "岩手県" },
  { code: "04", slug: "miyagi", labelJa: "宮城県" },
  { code: "05", slug: "akita", labelJa: "秋田県" },
  { code: "06", slug: "yamagata", labelJa: "山形県" },
  { code: "07", slug: "fukushima", labelJa: "福島県" },
  { code: "08", slug: "ibaraki", labelJa: "茨城県" },
  { code: "09", slug: "tochigi", labelJa: "栃木県" },
  { code: "10", slug: "gunma", labelJa: "群馬県" },
  { code: "11", slug: "saitama", labelJa: "埼玉県" },
  { code: "12", slug: "chiba", labelJa: "千葉県" },
  { code: "13", slug: "tokyo", labelJa: "東京都" },
  { code: "14", slug: "kanagawa", labelJa: "神奈川県" },
  { code: "15", slug: "niigata", labelJa: "新潟県" },
  { code: "16", slug: "toyama", labelJa: "富山県" },
  { code: "17", slug: "ishikawa", labelJa: "石川県" },
  { code: "18", slug: "fukui", labelJa: "福井県" },
  { code: "19", slug: "yamanashi", labelJa: "山梨県" },
  { code: "20", slug: "nagano", labelJa: "長野県" },
  { code: "21", slug: "gifu", labelJa: "岐阜県" },
  { code: "22", slug: "shizuoka", labelJa: "静岡県" },
  { code: "23", slug: "aichi", labelJa: "愛知県" },
  { code: "24", slug: "mie", labelJa: "三重県" },
  { code: "25", slug: "shiga", labelJa: "滋賀県" },
  { code: "26", slug: "kyoto", labelJa: "京都府" },
  { code: "27", slug: "osaka", labelJa: "大阪府" },
  { code: "28", slug: "hyogo", labelJa: "兵庫県" },
  { code: "29", slug: "nara", labelJa: "奈良県" },
  { code: "30", slug: "wakayama", labelJa: "和歌山県" },
  { code: "31", slug: "tottori", labelJa: "鳥取県" },
  { code: "32", slug: "shimane", labelJa: "島根県" },
  { code: "33", slug: "okayama", labelJa: "岡山県" },
  { code: "34", slug: "hiroshima", labelJa: "広島県" },
  { code: "35", slug: "yamaguchi", labelJa: "山口県" },
  { code: "36", slug: "tokushima", labelJa: "徳島県" },
  { code: "37", slug: "kagawa", labelJa: "香川県" },
  { code: "38", slug: "ehime", labelJa: "愛媛県" },
  { code: "39", slug: "kochi", labelJa: "高知県" },
  { code: "40", slug: "fukuoka", labelJa: "福岡県" },
  { code: "41", slug: "saga", labelJa: "佐賀県" },
  { code: "42", slug: "nagasaki", labelJa: "長崎県" },
  { code: "43", slug: "kumamoto", labelJa: "熊本県" },
  { code: "44", slug: "oita", labelJa: "大分県" },
  { code: "45", slug: "miyazaki", labelJa: "宮崎県" },
  { code: "46", slug: "kagoshima", labelJa: "鹿児島県" },
  { code: "47", slug: "okinawa", labelJa: "沖縄県" },
] as const;

export interface MunicipalityDef {
  /** 総務省 全国地方公共団体コード（5桁） */
  code: string;
  slug: string;
  labelJa: string;
  prefCode: string;
}

/**
 * 市区町村レジストリ（段階拡大）。
 * 記事化する自治体が決まり次第、ここに追加する。
 * 2026-09-20: 出産・子育て給付の地域比較記事のため東京23区のうち5区を追加登録。
 * 2026-09-20: 新宿区を追加登録（総務省「都道府県コード及び市区町村コード」PDFで131041を確認）。
 * 2026-09-20: 横浜市を追加登録（総務省「全国地方公共団体コード」PDF 13ページ目で団体コード141003＝検査数字込み6桁を確認、
 *   このファイルの他エントリに合わせ検査数字を除いた5桁「14100」で登録。東京都以外で初の市区町村登録）。
 * 2026-09-20: 名古屋市を追加登録（総務省「全国地方公共団体コード」PDF 18ページ目で団体コード231002を確認、
 *   検査数字を除いた5桁「23100」で登録。愛知県として初の市区町村登録）。
 * 2026-09-20: 大阪市の人口上位6区を追加登録（総務省統計局・国勢調査統計表のe-Stat API「getMetaInfo」
 *   area軸メタデータでコードを確認、大阪市公式「推計人口年報（令和６年）」表4-1で人口順位を確認。
 *   一次情報: data/sources/osaka-wards-codes/README.md 参照）。
 * 2026-09-20: 立川市・青梅市（東京都）、川口市（埼玉県）を追加登録（kekkon カテゴリの結婚新生活支援事業
 *   記事のため）。総務省「全国地方公共団体コード一覧」PDF（000925834.pdf）で団体コード132021・132055・
 *   112038＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた5桁で登録。
 *   埼玉県として初の市区町村登録（一般コースの結婚新生活支援補助金は国基準ではなく市独自基準を採用）。
 * 2026-09-20: 中央区を追加登録（東京23区を千代田・港・新宿・品川・世田谷・渋谷の6区から23区へ
 *   段階拡大する一環。総務省「都道府県コード及び市区町村コード」PDFで団体コード131024を確認、
 *   検査数字を除いた5桁「13102」で登録）。
 * 2026-09-20: 仙台市を追加登録（shussan カテゴリの出産育児支援金・妊婦支援給付金記事のため。
 *   総務省「全国地方公共団体コード一覧」PDF（000925834.pdf）6ページ目・宮城県セクションで
 *   団体コード041009＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた5桁
 *   「04100」で登録。宮城県として初の市区町村登録。一次情報: data/sources/sendai-shussan-ikuji-shienkin/
 *   03_soumu_zenkoku_chihou_koukyoudantai_code.pdf 参照）。
 * 2026-09-20: 札幌市を追加登録（kaigo カテゴリの福祉除雪事業記事のため。政令指定都市のため
 *   横浜市・名古屋市と同様に区単位ではなく市全体を1エントリとして登録。総務省「全国地方公共団体
 *   コード」一覧PDF（000925834.pdf）で団体コード011002＝検査数字込み6桁を確認、検査数字を除いた
 *   5桁「01100」で登録。北海道として初の市区町村登録。一次情報: data/sources/sapporo-fukushi-josetsu/
 *   03_soumu-zenkoku-chihoukoukyoudantai-code.pdf 参照）。
 * 2026-09-20: さいたま市を追加登録（kyoiku カテゴリの低所得の子育て家庭児童進学支援金記事のため。
 *   政令指定都市のため横浜市・名古屋市・仙台市・札幌市と同様に区単位ではなく市全体を1エントリとして
 *   登録。総務省「全国地方公共団体コード」一覧PDF（000925834.pdf）9ページ目・埼玉県セクションで
 *   団体コード111007＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた5桁
 *   「11100」で登録。slugは県名スラッグ「saitama」との混同を避けるため「saitama-shi」とした。
 *   一次情報: data/sources/saitama-shi-shingaku-shienkin/README.md 参照）。
 * 2026-09-20: 東京23区のうち目黒・大田・中野・杉並・豊島・北・荒川・板橋・練馬・足立・葛飾・
 *   江戸川の12区を追加登録（23区全域への段階拡大の一環。gyosei-navi-0dセッションが並行して
 *   文京・台東・墨田・江東を担当するため範囲を分担）。総務省「都道府県コード及び市区町村コード」
 *   PDFで団体コード131108〜131236（13110〜13123、検査数字込み6桁）を確認、このファイルの
 *   他エントリに合わせ検査数字を除いた5桁で登録。東京都北区は大阪市北区（27127, slug: kita-osaka）
 *   とのスラッグ衝突を避けるため slug "kita" を採用（lookupはprefSlug+citySlugの組で行うため
 *   都道府県を跨いだ衝突はない）。
 * 2026-09-20: 京都市を追加登録（pet カテゴリの犬・猫避妊去勢手術費助成制度記事のため。政令指定都市のため
 *   横浜市・名古屋市・仙台市・札幌市・さいたま市と同様に区単位ではなく市全体を1エントリとして登録。
 *   総務省「全国地方公共団体コード」一覧PDFの18-22ページ目を確認、19ページ目・京都府セクションで
 *   団体コード261009＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた5桁
 *   「26100」で登録。京都府として初の市区町村登録。一次情報: data/sources/kyoto-shi-pet-funinkyosei/
 *   04_soumu-zenkoku-chihoukoukyoudantai-code.pdf, README.md 参照）。
 * 2026-09-20: 福岡市を追加登録（sogyo カテゴリの新規創業促進補助金記事のため。政令指定都市のため
 *   横浜市・名古屋市・仙台市・札幌市・さいたま市・京都市と同様に区単位ではなく市全体を1エントリとして
 *   登録。総務省「全国地方公共団体コード」一覧PDF（000925834.pdf）26ページ目・福岡県セクションで
 *   団体コード401307＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた5桁
 *   「40130」で登録。福岡県として初の市区町村登録。一次情報: data/sources/fukuoka-sogyo-shinki-sokushin-hojokin/
 *   05_soumu-zenkoku-chihoukoukyoudantai-code.pdf, README.md 参照）。
 * 2026-09-20: 静岡市を追加登録（energy カテゴリの住宅向け太陽光パネル・蓄電池等の共同購入
 *   （「みんなのおうちに太陽光」キャンペーン）記事のため。政令指定都市のため横浜市・名古屋市・
 *   仙台市・札幌市・さいたま市・京都市・福岡市と同様に区単位ではなく市全体を1エントリとして登録。
 *   総務省「全国地方公共団体コード」一覧PDF（000925834.pdf）17ページ目・静岡県セクションで
 *   団体コード221007＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた
 *   5桁「22100」で登録。静岡県として初の市区町村登録（中部地方として初の市区町村登録でもある）。
 *   一次情報: data/sources/shizuoka-taiyoko-kyodokonyu/03_soumu-zenkoku-chihoukoukyoudantai-code.pdf,
 *   README.md 参照）。
 * 2026-09-20: 文京区を追加登録（gyosei-navi-0dセッション担当分、東京23区の残り4区
 *   文京・台東・墨田・江東のうち最初の1件。総務省「都道府県コード及び市区町村コード」PDFで
 *   団体コード131059を確認、検査数字を除いた5桁「13105」で登録）。
 * 2026-09-21: 北九州市を追加登録（kaigo おむつ給付・shussan 妊婦のための支援給付記事のため。政令指定都市のため
 *   横浜市・名古屋市・仙台市・札幌市・さいたま市・京都市・福岡市・静岡市と同様に区単位ではなく市全体を1エントリとして
 *   登録。総務省「全国地方公共団体コード」一覧PDF（000925834.pdf）26ページ目・福岡県セクションで
 *   団体コード401005＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた5桁
 *   「40100」で登録。福岡県として福岡市に次ぐ2件目の市区町村登録。一次情報: data/sources/kitakyushu-ninpu-shien-kyufu/
 *   05_soumu-zenkoku-chihoukoukyoudantai-code.pdf, README.md および kaigo 側 kitakyushu-omutsu ソース参照）。
 * 2026-09-21: 久留米市を追加登録（kekkon カテゴリの結婚新生活支援補助金記事のため。総務省「全国地方公共団体コード」
 *   一覧PDF（000925834.pdf）26ページ目・福岡県セクションで団体コード402036＝検査数字込み6桁を確認、
 *   このファイルの他エントリに合わせ検査数字を除いた5桁「40203」で登録。福岡県として3件目の市区町村登録。
 *   一次情報: data/sources/kurume-kekkon-shinseikatsu-shien/04_soumu-zenkoku-chihoukoukyoudantai-code.pdf,
 *   README.md 参照）。
 * 2026-09-21: 八女市を追加登録（kekkon カテゴリの結婚新生活支援事業補助金記事のため）。総務省「全国地方公共団体コード」
 *   一覧PDF（000925834.pdf）26ページ目・福岡県セクションで団体コード402109＝検査数字込み6桁を確認、
 *   このファイルの他エントリに合わせ検査数字を除いた5桁「40210」で登録。福岡県として4件目の市区町村登録。
 *   slugは県スラッグ「fukuoka」と衝突しないため「yame」とした。一次情報:
 *   data/sources/yame-kekkon-shin-seikatsu/03_soumu-zenkoku-chihoukoukyoudantai-code.pdf, README.md 参照）。
 *
 * 2026-09-21: 岡山市を追加登録（energy カテゴリの令和8年度岡山市住宅用スマートエネルギー導入促進補助事業
 *   記事のため）。岡山市は政令指定都市ではないため区単位に分割せず市全体を1エントリとして登録。
 *   総務省「全国地方公共団体コード」一覧PDF（000925834.pdf、https://www.soumu.go.jp/main_content/000925834.pdf）
 *   岡山県セクションで団体コード331007＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を
 *   除いた5桁「33100」で登録。岡山県として初の市区町村登録。slugは県スラッグ「okayama」との混同を避けるため
 *   「okayama-shi」とした（さいたま市・京都市・熊本市と同じパターン）。一次情報: data/sources/okayama-smart-energy-hojo/
 *   05_soumu-zenkoku-chihoukoukyoudantai-code.pdf, README.md 参照）。
 *
 * 2026-09-21: 那覇市を追加登録（shussan カテゴリの産後ケア事業記事のため）。総務省「全国地方公共団体コード」
 *   一覧PDF（000925834.pdf）30ページ目・沖縄県セクションで団体コード472018＝検査数字込み6桁を確認、
 *   このファイルの他エントリに合わせ検査数字を除いた5桁「47201」で登録。沖縄県として初の市区町村登録。
 *   一次情報: data/sources/naha-sango-care/04_soumu-zenkoku-chihoukoukyoudantai-code.pdf, README.md 参照）。
 * 2026-09-21: 熊本市を追加登録（kaigo カテゴリの難聴高齢者介護予防促進事業〔高齢者補聴器購入費助成〕記事のため。
 *   政令指定都市のため横浜市・名古屋市・仙台市・札幌市・さいたま市・京都市・福岡市・静岡市・北九州市等と
 *   同様に区単位ではなく市全体を1エントリとして登録。総務省「全国地方公共団体コード」一覧PDF
 *   （000925834.pdf）を福岡市の新規創業促進補助金記事（fukuoka-sogyo-shinki-sokushin-hojokin）で
 *   取得済みのコピーで確認、熊本県セクションで団体コード431001＝検査数字込み6桁を確認、このファイルの
 *   他エントリに合わせ検査数字を除いた5桁「43100」で登録。熊本県として初の市区町村登録。slugは県スラッグ
 *   「kumamoto」との混同を避けるため「kumamoto-shi」とした（さいたま市と同じパターン）。
 *   一次情報: data/sources/kumamoto-shi-hochoki-kounyuhi-josei/04_soumu-zenkoku-chihoukoukyoudantai-code.pdf,
 *   README.md 参照）。
 * 2026-09-21: 神戸市を追加登録（jutaku カテゴリの神戸市子育て応援住み替え補助事業・親子近居同居住み替え助成事業
 *   「住みかえーる」記事のため。政令指定都市のため横浜市・名古屋市・仙台市・札幌市・さいたま市・京都市・福岡市・
 *   静岡市・北九州市・熊本市・広島市等と同様に区単位ではなく市全体を1エントリとして登録。総務省「全国地方公共団体
 *   コード」一覧PDF（000925834.pdf、https://www.soumu.go.jp/main_content/000925834.pdf）21ページ目・兵庫県セクションで
 *   団体コード281000＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた5桁「28100」で登録。
 *   兵庫県として初の市区町村登録。slugは県スラッグ「hyogo」との混同はないため「kobe」とした。一次情報:
 *   data/sources/kobe-sumikaeru/README.md, data/sources/kobe-shi-code/01_soumu-zenkoku-chihoukoukyoudantai-code.pdf 参照）。
 * 2026-09-21: 姫路市を追加登録（kekkon カテゴリの姫路市結婚新生活支援補助金記事のため）。兵庫県は既に神戸市
 *   （28100）を登録済みのため、同県2件目の市区町村登録。総務省「全国地方公共団体コード」一覧PDF
 *   （000925834.pdf、https://www.soumu.go.jp/main_content/000925834.pdf）を神戸市登録時に取得済みのコピー
 *   （data/sources/kobe-shi-code/01_soumu-zenkoku-chihoukoukyoudantai-code.pdf）21ページ目・兵庫県セクションで
 *   団体コード282014＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた5桁「28201」で
 *   登録（topic-scout の事前推定28201と一致）。slugは県スラッグ「hyogo」との混同がないため「himeji」とした。
 *   一次情報: data/sources/himeji-kekkon-shinseikatsu-shien/README.md 参照）。
 * 2026-09-21: 広島市を追加登録（shogaisha カテゴリの重度心身障害者医療費補助制度記事のため）。政令指定都市のため
 *   横浜市・名古屋市・仙台市・札幌市・さいたま市・京都市・福岡市・静岡市・北九州市・熊本市等と同様に区単位では
 *   なく市全体を1エントリとして登録。総務省「全国地方公共団体コード」一覧PDF（000925834.pdf、
 *   https://www.soumu.go.jp/main_content/000925834.pdf）24ページ目・広島県セクションで団体コード341002＝
 *   検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた5桁「34100」で登録。広島県として
 *   初の市区町村登録。slugは県スラッグ「hiroshima」との混同を避けるため「hiroshima-shi」とした（さいたま市の
 *   saitama-shi と同じパターン）。一次情報: data/sources/hiroshima-shi-juudo-shinshin-shogaisha-iryohi/
 *   03_soumu-zenkoku-chihoukoukyoudantai-code.pdf, README.md 参照）。
 * 2026-09-21: 青森市を追加登録（kaigo カテゴリのはり・きゅう・マッサージ施術料助成記事のため）。青森市は
 *   政令指定都市ではないため区単位に分割せず市全体を1エントリとして登録。総務省「全国地方公共団体コード」
 *   一覧PDF（000925834.pdf、https://www.soumu.go.jp/main_content/000925834.pdf）5ページ目・青森県セクションで
 *   団体コード022012＝検査数字込み6桁を確認、このファイルの他エントリに合わせ検査数字を除いた5桁「02201」で
 *   登録。青森県として初の市区町村登録。slugは県スラッグ「aomori」との混同を避けるため「aomori-shi」とした
 *   （さいたま市・京都市・熊本市等と同じパターン）。一次情報: data/sources/aomori-shi-hari-kyu-massage-josei/README.md,
 *   data/sources/aomori-shi-code/README.md 参照）。
 * 2026-09-21: 津市を追加登録（pet カテゴリの飼い主のいない猫の不妊・去勢手術費補助制度記事のため）。総務省
 *   「全国地方公共団体コード」一覧PDF（000925834.pdf、https://www.soumu.go.jp/main_content/000925834.pdf）
 *   19ページ目・三重県セクションで団体コード242012＝検査数字込み6桁を確認、このファイルの他エントリに合わせ
 *   検査数字を除いた5桁「24201」で登録。三重県として初の市区町村登録。一次情報: data/sources/tsu-shi-code/
 *   01_soumu-zenkoku-chihoukoukyoudantai-code.pdf, data/sources/tsu-neko-funinkyosei/README.md 参照）。
 */
export const MUNICIPALITIES: readonly MunicipalityDef[] = [
  { code: "13101", slug: "chiyoda", labelJa: "千代田区", prefCode: "13" },
  { code: "13102", slug: "chuo", labelJa: "中央区", prefCode: "13" },
  { code: "13103", slug: "minato", labelJa: "港区", prefCode: "13" },
  { code: "13104", slug: "shinjuku", labelJa: "新宿区", prefCode: "13" },
  { code: "13105", slug: "bunkyo", labelJa: "文京区", prefCode: "13" },
  { code: "13109", slug: "shinagawa", labelJa: "品川区", prefCode: "13" },
  { code: "13110", slug: "meguro", labelJa: "目黒区", prefCode: "13" },
  { code: "13111", slug: "ota", labelJa: "大田区", prefCode: "13" },
  { code: "13112", slug: "setagaya", labelJa: "世田谷区", prefCode: "13" },
  { code: "13113", slug: "shibuya", labelJa: "渋谷区", prefCode: "13" },
  { code: "13114", slug: "nakano", labelJa: "中野区", prefCode: "13" },
  { code: "13115", slug: "suginami", labelJa: "杉並区", prefCode: "13" },
  { code: "13116", slug: "toshima", labelJa: "豊島区", prefCode: "13" },
  { code: "13117", slug: "kita", labelJa: "北区", prefCode: "13" },
  { code: "13118", slug: "arakawa", labelJa: "荒川区", prefCode: "13" },
  { code: "13119", slug: "itabashi", labelJa: "板橋区", prefCode: "13" },
  { code: "13120", slug: "nerima", labelJa: "練馬区", prefCode: "13" },
  { code: "13121", slug: "adachi", labelJa: "足立区", prefCode: "13" },
  { code: "13122", slug: "katsushika", labelJa: "葛飾区", prefCode: "13" },
  { code: "13123", slug: "edogawa", labelJa: "江戸川区", prefCode: "13" },
  { code: "13202", slug: "tachikawa", labelJa: "立川市", prefCode: "13" },
  { code: "13205", slug: "ome", labelJa: "青梅市", prefCode: "13" },
  { code: "14100", slug: "yokohama", labelJa: "横浜市", prefCode: "14" },
  { code: "23100", slug: "nagoya", labelJa: "名古屋市", prefCode: "23" },
  { code: "27123", slug: "yodogawa", labelJa: "淀川区", prefCode: "27" },
  { code: "27126", slug: "hirano", labelJa: "平野区", prefCode: "27" },
  { code: "27114", slug: "higashiyodogawa", labelJa: "東淀川区", prefCode: "27" },
  { code: "27118", slug: "joto", labelJa: "城東区", prefCode: "27" },
  { code: "27120", slug: "sumiyoshi", labelJa: "住吉区", prefCode: "27" },
  { code: "27127", slug: "kita-osaka", labelJa: "北区", prefCode: "27" },
  { code: "11203", slug: "kawaguchi", labelJa: "川口市", prefCode: "11" },
  { code: "04100", slug: "sendai", labelJa: "仙台市", prefCode: "04" },
  { code: "01100", slug: "sapporo", labelJa: "札幌市", prefCode: "01" },
  { code: "11100", slug: "saitama-shi", labelJa: "さいたま市", prefCode: "11" },
  { code: "26100", slug: "kyoto-shi", labelJa: "京都市", prefCode: "26" },
  { code: "40130", slug: "fukuoka-shi", labelJa: "福岡市", prefCode: "40" },
  { code: "40100", slug: "kitakyushu", labelJa: "北九州市", prefCode: "40" },
  { code: "40203", slug: "kurume", labelJa: "久留米市", prefCode: "40" },
  { code: "40210", slug: "yame", labelJa: "八女市", prefCode: "40" },
  { code: "22100", slug: "shizuoka-shi", labelJa: "静岡市", prefCode: "22" },
  { code: "33100", slug: "okayama-shi", labelJa: "岡山市", prefCode: "33" },
  { code: "47201", slug: "naha", labelJa: "那覇市", prefCode: "47" },
  { code: "14130", slug: "kawasaki", labelJa: "川崎市", prefCode: "14" },
  { code: "43100", slug: "kumamoto-shi", labelJa: "熊本市", prefCode: "43" },
  { code: "34100", slug: "hiroshima-shi", labelJa: "広島市", prefCode: "34" },
  { code: "28100", slug: "kobe", labelJa: "神戸市", prefCode: "28" },
  { code: "28201", slug: "himeji", labelJa: "姫路市", prefCode: "28" },
  { code: "02201", slug: "aomori-shi", labelJa: "青森市", prefCode: "02" },
  { code: "24201", slug: "tsu", labelJa: "津市", prefCode: "24" },
];

export const getPrefectureBySlug = (slug: string): PrefectureDef | undefined =>
  PREFECTURES.find((p) => p.slug === slug);

export const getPrefectureByCode = (code: string): PrefectureDef | undefined =>
  PREFECTURES.find((p) => p.code === code);

export const getMunicipalityBySlug = (
  prefSlug: string,
  citySlug: string
): MunicipalityDef | undefined => {
  const pref = getPrefectureBySlug(prefSlug);
  if (!pref) return undefined;
  return MUNICIPALITIES.find((m) => m.prefCode === pref.code && m.slug === citySlug);
};

/** 国レベル（都道府県・市区町村を問わない全国共通制度）を表す特殊コード */
export const NATIONAL_REGION_CODE = "00000";
