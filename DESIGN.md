---
name: 全国補助金ナビ
description: 自治体広報誌・くらしの便利帳の目次と索引として組んだ、罫線とリーダー罫の情報誌世界
colors:
  paper: "#fff"
  ink: "oklch(21% 0.034 264.665)"
  ink-secondary: "oklch(44.6% 0.03 256.802)"
  ink-tertiary: "oklch(55.1% 0.027 264.364)"
  ink-muted: "oklch(70.7% 0.022 261.325)"
  rule-strong: "oklch(87.2% 0.01 258.338)"
  rule-light: "oklch(92.8% 0.006 264.531)"
  navy-heading: "#123a63"
  navy-link: "#1e5a96"
  navy-deep: "#174a7d"
  navy-darkest: "#0d2b4a"
  navy-tint: "#d8e5f5"
  navy-wash: "#eef4fb"
  shu: "#c0392b"
  shu-dark-mode: "#f2a59c"
  night-paper: "oklch(13% 0.028 261.692)"
  night-rule: "oklch(27.8% 0.033 256.848)"
  night-rule-strong: "oklch(37.3% 0.034 259.733)"
  night-ink: "oklch(96.7% 0.003 264.542)"
  amber-incumbent: "#b45309"
typography:
  display:
    fontFamily: "var(--font-biz), 'BIZ UDPGothic', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', Meiryo, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  display-sm-up:
    fontFamily: "var(--font-biz), 'BIZ UDPGothic', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', Meiryo, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.11
    letterSpacing: "-0.025em"
  wordmark:
    fontFamily: "var(--font-biz), 'BIZ UDPGothic', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', Meiryo, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "var(--font-biz), 'BIZ UDPGothic', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', Meiryo, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.55
  title:
    fontFamily: "var(--font-biz), 'BIZ UDPGothic', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', Meiryo, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.43
  body:
    fontFamily: "var(--font-biz), 'BIZ UDPGothic', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', Meiryo, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "var(--font-biz), 'BIZ UDPGothic', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', Meiryo, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
rounded:
  none: "0px"
spacing:
  row-tight: "4px"
  row: "8px"
  heading-gap: "12px"
  block: "16px"
  column: "24px"
  compare-gutter: "32px"
  section: "40px"
  main-gutter: "48px"
  footer-top: "64px"
components:
  masthead:
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    padding: "0 0 12px 0"
  section-heading:
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    padding: "0 0 4px 0"
  section-more-link:
    textColor: "{colors.navy-link}"
    typography: "{typography.label}"
  sub-heading:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "0 0 4px 0"
  index-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "4px 0"
  index-row-hover:
    textColor: "{colors.navy-link}"
  index-row-disabled:
    textColor: "{colors.ink-muted}"
    typography: "{typography.body}"
    padding: "4px 0"
  dated-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "8px 0"
  dated-row-hover:
    textColor: "{colors.navy-link}"
  dated-row-date-soon:
    textColor: "{colors.shu}"
    typography: "{typography.title}"
  dated-row-kind-flash:
    textColor: "{colors.shu}"
    typography: "{typography.label}"
  dated-row-kind-update:
    textColor: "{colors.ink-tertiary}"
    typography: "{typography.label}"
  colophon-term:
    textColor: "{colors.ink-secondary}"
    typography: "{typography.label}"
  colophon-detail:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  header-bar:
    backgroundColor: "{colors.paper}"
    height: "56px"
    padding: "0 16px"
  header-wordmark:
    textColor: "{colors.navy-heading}"
    typography: "{typography.wordmark}"
  header-nav-link:
    textColor: "oklch(37.3% 0.034 259.733)"
    typography: "{typography.body}"
  header-nav-link-hover:
    textColor: "{colors.navy-link}"
  footer:
    backgroundColor: "{colors.paper}"
    padding: "40px 16px"
  footer-link:
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body}"
  footer-link-hover:
    textColor: "{colors.navy-link}"
---

# Design System: 全国補助金ナビ

## Overview

**Creative North Star: "くらしの便利帳" (The Household Handbook)**

The site's home surface and shared shell are set like the index pages of a Japanese municipal PR magazine: white paper, ink-black text in a UD gothic face, and space divided by rules rather than boxes. There are no cards, no shadows, no icon tiles, and no corner radius on the home surface. Every section is a heading over a 2px navy rule, followed by a ruled list; the reader finds their prefecture in an index whose dotted leader runs to a right-aligned count, exactly as a printed handbook would set it. Density is high and calm: rows are 4px to 8px apart, sections 40px apart, and the type never rises above 2.25rem.

Color is almost entirely ink and navy. Navy (`navy-heading`) is structural: it draws the mast rule, section rules, the footer's top rule, and the header wordmark. A lighter navy (`navy-link`) is the only interactive color: hover and focus turn text navy, add an underline, and turn a dotted leader into a solid navy line. Vermilion (`shu`) is a warning ink reserved for two things, a deadline inside 14 days and a 速報 kind label. Nothing else is allowed to be red.

Scope, stated honestly: this world is implemented on `src/app/page.tsx` (Masthead, RegionIndex, DeadlineList, UpdatesList, CategoryToc, Colophon, CompareList) and on the shared Header and Footer. Article, listing, area, tag, compare, tokushu and news pages were not part of the build and still use the pre-existing styles (the `.article-body` prose treatment, and `ArticleCard.tsx` with `rounded-lg` borders and a hover shadow). New surfaces should follow this document; existing article surfaces carry the old system until they are rebuilt.

**Key Characteristics:**
- White paper, ink text, navy rules; no fills, no cards, no shadows, no radius on the home surface
- Two rule weights carry all hierarchy: 2px navy for sections, 1px gray for sub-heads, columns and rows
- Dotted leaders join a label to its right-aligned tabular count; hover makes the leader solid navy
- One typeface (BIZ UDPGothic) at exactly two weights (400, 700); numerals are always tabular
- Vermilion is a warning ink, used only for near deadlines and 速報

## Colors

A monochrome page with one structural navy, one interactive navy, and one warning red; grays come from Tailwind's default gray ramp and are not redefined in the theme.

### Primary
- **Navy Heading** (`navy-heading`): the structural navy. Draws every 2px rule (masthead bottom, section headings, colophon top, footer top) and colors the header and footer wordmark.
- **Navy Link** (`navy-link`): the only interactive color. "More" links beside section headings, colophon links, and every hover/focus state on rows, index entries, nav links and footer links. Also the `:focus-visible` outline color (2px, 2px offset).
- **Navy Tint / Navy Darkest** (`navy-tint`, `navy-darkest`): text selection only (tint background, darkest text). In dark mode `navy-tint` replaces `navy-heading` for rules and `navy-link` for hover, because the deep navies do not read on the night paper.
- **Navy Deep / Navy Wash** (`navy-deep`, `navy-wash`): incumbent tokens from before the rebuild. Not used on the home surface or shell; they survive in `ArticleCard.tsx` type tags (`bg-brand-50 text-brand-700`).

### Tertiary
- **Shu** (`shu`): vermilion warning ink, the 注意色 of a household handbook. Colors a deadline date that falls within 14 days and the 速報 kind label in the updates list. Dark mode swaps in `shu-dark-mode`.

### Neutral
- **Paper** (`paper`): page, header and footer background. The footer no longer has a gray fill; the whole page is one sheet.
- **Ink** (`ink`): body text, headings, wordless dates, index entries.
- **Ink Secondary** (`ink-secondary`): the masthead's issue line, explanatory sentences under headings, category descriptions, region labels in dated rows, colophon terms, footer body and links, counts in the index.
- **Ink Tertiary** (`ink-tertiary`): the 更新 kind label and the footer's bottom legal row.
- **Ink Muted** (`ink-muted`): prefectures with no articles (準備中) and their leaders.
- **Rule Strong** (`rule-strong`): 1px rules for sub-headings (region names, compare column heads), the four 縦罫 between index columns at lg, the header's bottom rule, the footer's disclaimer rule, and the dotted separators in the compare lists.
- **Rule Light** (`rule-light`): 1px separators between dated rows and category rows.
- **Night Paper / Night Ink / Night Rule / Night Rule Strong**: dark-mode counterparts (page background, body text, row separators, sub-heading rules). Dark mode is driven by a `.dark` class on `<html>` and was not captured in the finish review; these values are read from the code's `dark:` classes and are unverified visually.
- **Amber Incumbent** (`amber-incumbent`): pre-existing `--color-accent-600`. Still declared in `globals.css`; not used by the home surface or shell.

### Named Rules
**The Shu Rule.** Vermilion appears in exactly two places: a deadline date within 14 days and the 速報 kind label. It is never a link color, never a heading color, never a fill.

**The One Interactive Navy Rule.** Every hover and focus state resolves to the same navy (`navy-link` in light, `navy-tint` in dark) plus an underline. There is no second hover treatment, no background change, no motion beyond a color transition on nav links.

## Typography

**Display Font:** BIZ UDPGothic (with Hiragino Kaku Gothic ProN, Hiragino Sans, Yu Gothic UI, Meiryo, sans-serif)
**Body Font:** BIZ UDPGothic (same stack)

**Character:** One universal-design gothic at two weights, the face that municipal PR magazines set their handbooks in. Hierarchy is carried by size, weight and rules, never by a second family. The font is self-hosted through `next/font` at weights 400 and 700 only, with `display: swap` and no preload; the OS Japanese gothic renders until it arrives.

### Hierarchy
- **Display** (700, 1.875rem rising to 2.25rem at sm, tight tracking): the masthead title on the home page only.
- **Wordmark** (700, 1.25rem, tight tracking, navy): the site name in the header; the footer repeats it at 1.125rem.
- **Headline** (700, 1.125rem): section headings over a 2px navy rule (お住まいの地域から探す, 締切が近い制度, 速報・更新, 目的から探す, 横並びで比べる).
- **Title** (700, 0.875rem): sub-headings over a 1px gray rule (region names, compare column heads), row dates, category names.
- **Body** (400, 0.875rem, `leading-snug`): index entries, row titles, colophon values, nav and footer links. Row titles clamp to 2 lines on mobile and 1 line at sm.
- **Label** (400, 0.75rem): counts, kind labels (速報 / 更新), まで suffix, "more" links, explanatory lines, colophon terms, disclaimer, legal row.

### Named Rules
**The Tabular Numerals Rule.** Every number that sits in a column (counts, dates, the masthead's issue line, 最終更新) is set with `tabular-nums` so leaders and dates align down the page.

**The Two-Weight Rule.** Only 400 and 700 are loaded. Do not ask for 500 or 600; the browser will synthesize or snap, and the handbook reads as regular and bold only.

## Layout

The page is a single column of ruled sections inside a 72rem container with 16px side padding and 24px (32px at sm) top padding. Sections are separated by 40px (`mt-10`); the footer sits 64px below the last section.

- **Masthead**: title and issue line on one baseline, wrapping on narrow screens, closed by a 2px navy rule with 12px padding above it.
- **Region index**: below lg, CSS columns (2 columns, 3 at sm, 24px gutter) flow the eight regions automatically with `break-inside: avoid` on each region block. At lg it becomes a hand-set 4-column grid pairing regions (北海道・東北 / 関東・中部 / 近畿・中国 / 四国・九州沖縄); columns are divided by 1px gray 縦罫 with 24px padding either side. Index rows are 4px vertical padding.
- **Two-column body** at lg: a fluid main column (deadlines, then updates) and a fixed 20rem aside (category index, then colophon), 48px gutter. Below lg the aside stacks under the main column.
- **Dated rows** use a fixed grid of 6.5rem (date) | 8rem (region, hidden below sm) | fluid title, 12px column gap, 8px vertical padding.
- **Compare lists** run full width as three ruled columns at sm (32px column gap, 24px row gap), stacking below.
- **Colophon** is a definition list with a 5rem term column and 12px gap, opened by a 2px navy rule.
- **Header** is a sticky 56px bar with the wordmark left and a text nav right at lg; below lg a mobile menu button replaces it.
- **Footer** is a 2 column (3 at sm) grid with 32px gaps, then a disclaimer over a 1px rule, then a legal row.

## Elevation & Depth

Flat, with no shadows and no tonal layering on the home surface or the shell. The page is one sheet of paper; depth is expressed entirely by rule weight (2px navy for the section level, 1px gray for sub-sections and rows, dotted for leaders and compare items). The header lost its `shadow-sm` in this build and now sits on a 1px gray rule; the footer lost its gray fill and its boxed disclaimer.

### Named Rules
**The No-Card Rule.** Groups of content are separated by rules, never enclosed in bordered or filled boxes. If a block needs a boundary, give it a 1px gray rule above or below.

## Shapes

No corner radius on the home surface or in the header/footer content; the only shape language is the rectangle bounded by horizontal and vertical rules. Rules come in three weights: 2px solid navy, 1px solid gray, and 1px dotted gray (leaders and compare list separators). Leaders sit 0.35em above the baseline and become solid navy on hover or focus.

## Components

### Masthead
- **Character:** the cover line of the handbook; title and issue data on one rule.
- **Title** in Display; issue line (更新日｜掲載 N制度・N都道府県・N市区町村) in Label at sm and Body above, `ink-secondary`, tabular.
- **Rule:** 2px `navy-heading` below, 12px padding.

### Section Heading
- **Character:** a headline with an optional "more" link, baseline-aligned, closed by a 2px navy rule.
- **Title** in Headline `ink`; **more link** in Label `navy-link`, underline on hover/focus.
- **Rule:** 2px `navy-heading` (dark: `navy-tint`), 4px padding below.

### Sub-heading
- Title weight over a 1px `rule-strong` rule, 4px padding. Used for region names and compare column heads; the compare head carries a Label-size "一覧へ" link on the right.

### Leader Link (index row)
- **Shape:** flex row, label | dotted leader | tabular count, 4px vertical padding.
- **Default:** label `ink`, leader 1px dotted `ink-muted`, count Label `ink-secondary`.
- **Hover / Focus:** label and count turn `navy-link`; the leader becomes solid `navy-link`; the count expands from "N" to "N制度・N市区町村" (CSS-only swap of two spans).
- **Disabled (準備中):** whole row `ink-muted`, leader dotted `rule-strong`, no link.
- Category rows reuse the same leader with a bold label, "N件" count and a Label-size description beneath, separated by 1px `rule-light`.

### Dated Row
- **Shape:** grid 6.5rem | 8rem | 1fr (region column hidden below sm), 8px vertical padding, 1px `rule-light` below.
- **Date** Title weight, tabular; deadline dates appear once per date with a Label-weight "まで" suffix, and subsequent same-day rows keep an sr-only "同日". Dates within 14 days are `shu`.
- **Kind label** (updates list): 速報 in `shu`, 更新 in `ink-tertiary`, Label size.
- **Region** in `ink-secondary`, truncated. **Title** in Body, 2-line clamp (1 at sm).
- **Hover / Focus:** title turns `navy-link` and underlines.
- **Overflow note** ("同日締切がほかN件") is a Label line in the title column.

### Colophon
- Definition list opened by a 2px navy rule: terms in Label `ink-secondary`, values in Body `ink`; the editorial policy is a three-item list; two `navy-link` links follow.

### Navigation (Header)
- Sticky 56px white bar, 1px `rule-strong` bottom rule, no shadow. Wordmark in `navy-heading` at 1.25rem bold. Desktop nav links Body size in gray-700 turning `navy-link` on hover with a color transition. Mobile: a menu button and a full-height panel (pre-existing components; see the not-canonized note below).

### Footer
- White, opened by a 2px `navy-heading` rule, 64px above. Wordmark at 1.125rem bold navy with the site description in Body `ink-secondary`; link columns in Body `ink-secondary` turning `navy-link` on hover; disclaimer as plain Label text over a 1px `rule-strong` rule; legal row in Label `ink-tertiary`.

## Do's and Don'ts

### Do:
- **Do** open every section with a Headline over a 2px `navy-heading` rule and close groups with 1px gray rules.
- **Do** set counts, dates and issue lines in `tabular-nums` and align them to the right of a dotted leader or to a fixed date column.
- **Do** make every interactive state the same: text to `navy-link` (dark: `navy-tint`), underline, leader to solid navy.
- **Do** reserve `shu` for deadlines within 14 days and 速報 labels.
- **Do** keep the shell on white: header on a 1px gray rule, footer on a 2px navy rule, no fills.

### Don't:
- **Don't** put home-surface content in cards, filled boxes, or containers with radius or shadow; the world divides space with rules only.
- **Don't** add icons, icon tiles, kickers or eyebrows; headings are plain text on a rule.
- **Don't** use a font weight other than 400 or 700, or a second typeface.
- **Don't** use `shu` for links, emphasis or decoration, and don't use `amber-incumbent` on new surfaces.
- **Don't** claim this world for article pages yet; until they are rebuilt, `ArticleCard.tsx` and `.article-body` remain on the pre-existing card and prose styles.
