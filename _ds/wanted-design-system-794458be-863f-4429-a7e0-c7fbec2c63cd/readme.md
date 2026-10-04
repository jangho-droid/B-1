# Wanted Design System (WDS)

Design system for **원티드 (Wanted)** — a Korean career platform (job matching, career content, community) and its sub-services (Wanted Space, Wanted Gigs, Wanted Agent, Wanted LaaS, Wanted OneID, AI 면접코칭…). Built from the Figma community file **"Wanted Design System (Community).fig"** (attached as a read-only mount; no URL, repo or codebase was provided). The file is internally called **Montage** in its Guidelines page.

The source file is organised as `1 Theme` (Icon, Logo) → `2 Element` (Basic/ratio, Spacing, Decorate) → `3 Component` (Layout, Action, Selection & Input, Content, Loading, Navigation, Feedback, Presentation), plus foundation pages (Color – Atomic, Color – Semantic, Typography, Grid, Theme) and older/legacy pages (Basic, Element, Component, Resource) that duplicate earlier versions of the same components. Documentation copy in the file is Korean.

Products represented: the **Wanted mobile app / mobile web** (iOS, Android, Web platform variants of TopNavigation, BottomNavigation, Alert, Modal) and **desktop web** (Card/ListCard "Desktop" platform, Pagination, Tooltip with shortcuts, 1060/1100/1440 viewport tokens).

## Index

- `styles.css` — global entry (imports only).
- `tokens/` — `fig-tokens.css` (all 488 Figma variables, light + dark + platform/size modes), `semantic.css` (clean `--color-*` aliases), `typography.css` (18 type styles as vars + `.t-*` classes), `spacing.css` (space, radius, shadow, state-layer opacities, motion), `fonts.css`, `base.css` (body font, links, `.wds-state` hover/press layer, keyframes), `fig-typography.css` (empty — the .fig defines no published text styles; see Typography).
- `components/` — React primitives grouped by concern (see Components).
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand).
- `assets/logo/` — Wanted symbol (gradient bitmap masked by the symbol path → `wanted-symbol.svg`), logotypes (Wanted, Space, Gigs, Agent; black + white), beta badge.
- `assets/images/` — avatar placeholder bitmaps, three sample photos from the file.
- `ui_kits/wanted-app/` — interactive mobile app recreation.
- `thumbnail.html`, `SKILL.md`.

## Components

Namespace: `window.WantedDesignSystem_794458`.

- **action/** — Button, TextButton, IconButton, Chip, FilterChip, MultiSelectChip, ToggleIcon, FloatingActionButton, ActionArea
- **layout/** — Divider
- **input/** — TextField, TextArea, Select, AutoComplete, SegmentedControl, Switch, Checkbox, Radio, CheckMark, FramedStyle (+ internal fieldParts: FieldHeading, FieldDescription, StatusIcon)
- **content/** — ContentBadge, PushBadge, StatusBadge, ValueBadge, Avatar, AvatarGroup, Thumbnail, Card, ListCard, ListCell
- **loading/** — Loading (circular + Wanted), Skeleton
- **navigation/** — TopNavigation, Tab, Category, BottomNavigation, Pagination, PageIndicator
- **feedback/** — Toast, Snackbar, Alert
- **presentation/** — Menu, Tooltip, Modal
- **element/** — Interaction, AspectRatio, Gradient, Dimmer
- **icon/** — Icon (329 glyphs, `ICON_NAMES`)
- **brand/** — Logo
- **platform/** — StatusBar, HomeBar, NavigationBar, SafeArea (device chrome for full-screen mockups)

### Figma family → component mapping

The .fig reports 770 component sets + 315 standalone symbols (the compiler counts 959 "families"). Most are not separate public components:
- **Resource sub-parts** (`*/Resource/*`, e.g. `Tab/Resource/Tab`, `Menu/Resource/Item/Cell`, `Textinput/Resource/Background`, `Card/Resource/*`, `Cell/Resource/Trailing Content/*`) are folded into their parent component's props.
- **Icon glyph sets** (`Icon/Normal/*`, `Name=…` variants, ~330 symbols) → one `Icon` component + `icon-data.js`.
- **Legacy duplicates** on the Basic/Element/Component/Resource pages (`Button/Round Button/*`, `Button/Text Button/*`, `Control/Checkbox` 3-variant, `Control/Switch` 2-variant, `Divider` 2-variant, `Bookmark`, `Bubble`, `Camera`…) map to the current component of the same role.
- **Avatar image/placeholder resources** (`Avatar/Resource/Image/*`, `_Avatar/*`, named people/companies/universities) → `Avatar` `src` + placeholder glyphs.
- **Platform scaffolding** (`Safe Area/*`, `Spacing/Status`, `Home Bar`, `Navigation Bar`, `Status Bar`) → `platform/` StatusBar, HomeBar, NavigationBar, SafeArea.
- **Doc-only helpers** (`_Badge/Status`, `_Badge/Value`, `_Dummy`, `_Ratio`, `Arrow with Texts`, `Content` 19-state doc blocks, `Custom Gradient`, `.Color/Overlay`, `Decorate/Opacity` swatches) are documentation furniture → skipped (opacity steps live in tokens).

### Intentionally skipped families (959 counted → 58 built)

The remaining ~909 Figma families are **intentionally not built as standalone components**:

| Skipped family pattern | Count (approx.) | Why | Where it lives instead |
|---|---|---|---|
| `Name=…` / `Icon/Normal/*` / `Icon/Navigation/*` / `Icon/Color/*` icon glyph sets | ~330 | Glyphs, not components | `Icon` + `icon-data.js` |
| `*/Resource/*` sub-parts (Tab/Resource/Tab, Menu/Resource/Item/Cell, Textinput/Resource/*, Card/Resource/*, Cell/Resource/Trailing Content/*, Pagination/Resource/*, Tooltip/Resource/*, Modal/Resource/*, Action Area/Resource/*, Category/Resource/Chip/*, Checkbox/Radio/Check Mark/Resource/Control, Segmented Control/Resource/Knob, Switch/Resource/Switch, Auto Complete/Resource/Item/*, Framed Style/Resource/*, Alert/Resource/*, Bottom Navigation/Resource/*, Top Navigation/Resource/*) | ~350 | Internal building blocks of a parent | Props of the parent component |
| `_Avartar/Resource/Placeholder/Person`, `_Avatar/Resource/Image/Person`, `Avatar/Resource/Image/*`, `Avatar/Resource/Placeholder/*`, named people/companies/universities | ~40 | Image fills | `Avatar` `src` + placeholder glyphs |
| `_Badge/Status`, `_Badge/Value`, `_Dummy`, `_Ratio`, `Arrow with Texts*`, `Content` (19 states), `badge` (상태), `Blank`, `Custom Gradient`, `.Color/Overlay`, `Decorate/Opacity` | ~60 | Documentation furniture in the Figma docs (dev-status badges, value labels, arrows) | Not product UI; opacity steps are tokens |
| Legacy duplicates: `Button/Round Button/*`, `Button/Text Button/*`, `Button/Outlined`, `Button/Icon/*` (old), `Control/Checkbox`·`Control/Radio`·`Control/Switch`·`Control/Check` (2–3 variant), `Divider`, `Basic/Divider`, `Bookmark`, `Bubble`, `Business Bag`, `Camera`, `Chevron Left/Right`, `Chip/Action`, `Chip/Filter`, `Chip/Multi-Select`, `Circular/Circular` (old), `Content Badge` (old ×2), `Badge/Push` (old), `Decorate/Interaction/*` (old) | ~90 | Older versions on the Basic/Element/Component/Resource pages | Current component of the same role |
| Platform scaffolding: `Safe Area/*`, `Spacing/Status`, `Spacing/Bottom Safe Area`, `Home Bar`, `Navigation Bar`, `Status Bar/*`, `Date Picker/iOS/Wheel`, macOS/iOS system chrome | ~40 | OS chrome, not Wanted UI | Padding inside TopNavigation / BottomNavigation / ActionArea |
| `Logo/Resource/*` lockups, `Logo/Wanted Partnership/*`, `Logo/Wanted Sub Services/*`, `agent alt 3` | ~30 | Asset variants | `Logo` (variant/service) + `assets/logo/` |

`_Badge/Status`, `_Badge/Value`, `Chip/Filter` and `Chip/Multi-Select` **are built** (StatusBadge, ValueBadge, FilterChip, MultiSelectChip).

### Intentional additions
- `Interaction` / `.wds-state` — the Figma "Interaction" overlay as a reusable layer, so hover/press is consistent.
- `renderIcon`, `ICON_NAMES` helpers — let any component take an icon by name.

## CONTENT FUNDAMENTALS

- **Language:** Korean first; English only for product names (Wanted, OneID, LaaS) and component names. Japanese is supported by the typeface.
- **Tone:** calm, polite, helpful. Sentences end in the soft polite **해요체** — "메시지에 마침표를 찍어요.", "에러 메시지를 나타내요.", "설명은 필요할 때만 써요." Never commanding (no 하십시오체), never cute.
- **Placeholder & prompts:** "텍스트를 입력해 주세요.", "선택해주세요." — request form with 주세요.
- **Buttons:** short nouns/verb stems — "메인 액션", "확인", "취소", "지원하기", "저장", "적용", "초기화". Primary first-person action ("지원하기"), never "Click here".
- **Dialogs:** title = short noun phrase ("간략한 제목"), body = one sentence stating the purpose ("목적을 명확하고 간단히 안내합니다.").
- **Person:** the user is addressed implicitly (Korean drops "you"); the product speaks as "우리" only in principles copy.
- **Punctuation:** messages end with a period ("마침표를 찍어요" is literally the guideline). Middle dot `·` separates metadata ("원티드랩 · 서울").
- **Casing (English):** Title Case for component names; sentence case elsewhere.
- **Emoji:** not used in UI. The Figma uses 💎 only as an internal variant marker — never in product copy.
- **Numbers:** counters like "1/500", page "3 / 12", "+N" for overflow; 99+ cap on push badges.

## VISUAL FOUNDATIONS

- **Colour:** one brand blue (`blue-50 #0066FF`, strong `#005EEB`, heavy `#0054D1`) on white. Neutrals are a *cool* grey ramp (`cool-neutral`, e.g. label-normal `#171719`). Text greys are **opacity steps** of `rgb(55,56,60)` (88/61/28/16%) rather than solid greys; lines and fills are opacity steps of `rgb(112,115,124)` (52/22/16/8/5%). Ten atomic accent hues (red, red-orange, orange, lime, green, cyan, light-blue, violet, purple, pink) appear only in badges/illustration. Status: green-50 / orange-50 / red-50.
- **Dark mode:** full parity via `data-theme="dark"` — background `#1B1C1E`, labels flip to `rgb(174,176,182)` opacities, primary lifts to blue-60.
- **Type:** Pretendard JP everywhere (KR/EN/JP). 7 levels / 18 styles; large sizes get negative tracking (Display 1 −3.19%), small sizes positive (Caption 2 +3.11%). Weights: Bold 700 for display/title, SemiBold 600 for headings and buttons, Medium 500 for labels/chips, Regular 400 body. Body has "Normal" and "Reading" (looser) line-heights. Wanted Sans is reserved for brand/marketing.
- **Spacing:** irregular, component-driven values (2, 4, 6, 7, 9, 11, 12, 14, 16, 20, 24, 28…) — copy exact paddings, don't snap. Page margin 20px; navigation padding 16px; content gaps 8/12/16.
- **Corner radii:** scale with size — 6 (xs chips/badges) · 8 (small) · 10 (medium) · 12 (large buttons, inputs, cards, thumbnails, toast) · 14 (framed style) · 16 (menus) · 20 (large modals); icon buttons, switches and avatars are fully round; company avatars are rounded squares (6→14).
- **Borders:** almost always a 1px **inset box-shadow** (`inset 0 0 0 1px line-neutral`), not CSS borders; focus = 2px inset ring of primary at 43%. Thumbnails/avatars get a faint inner line.
- **Shadows:** sparse. Normal (FAB): `0 0 4 .08, 0 4 8 .08, 0 6 12 .12`. Emphasize (menus/popover): `0 0 1 .06, 0 4 10 .07, 0 8 20 .1` of `#171717`. Inputs get a hairline `0 1 2 rgba(0,0,0,.03)`.
- **Materials / blur:** nav bars are 88% background + `blur(64px)`; toasts, snackbars and tooltips use a dark inverse material at 52–88% with a 5% primary tint and 64px blur. Dimmer = `rgba(23,23,25,.52)` (.74 dark).
- **Backgrounds:** flat white / `cool-neutral-99` sections; 12px thick divider bands separate sections on mobile. No textures, patterns or illustrations in UI; imagery is photographic inside 12px-radius thumbnails. The brand symbol is the only gradient (blue→violet→pink→orange).
- **Gradients:** only as protection — bottom fade under overlay captions, edge fades on scrolling Category rows, top fade above sticky action areas.
- **Hover / press:** a state layer of label-normal colour at fixed opacities — Light 3.8/6/9%, Normal 5/8/12%, Strong 7.5/12/18% (hover/focus/press). No scale/shrink on press. Disabled = 43% opacity (controls) or `interaction-disable` fill + 16–28% label (buttons).
- **Selected states:** solid chips/categories go **black** (label-strong) with white text; outlined/alternative go **blue-tinted** (5% fill + 43% ring + blue text); tabs use a 2px black underline.
- **Motion:** quiet, functional — short fades/slides (~120–200ms, standard ease), spinner rotation, skeleton pulse. No bounces.
- **Layout:** mobile 375 frames with sticky translucent TopNavigation and BottomNavigation; desktop content max 1060 (lg 1100, xl 1440). Cards: image-first, no container/border, text below the thumbnail.

## ICONOGRAPHY

- A single in-house **24px icon set** (Figma `Icon/Normal/*`, ~210 glyphs, 329 incl. variants) with systematic variants: `Fill` (solid) vs outline, `Thick` stroke, `Tight` (reduced padding), `Small`. Rounded, 1.5–2px-equivalent strokes, filled shapes with rounded joins.
- Delivered here as path data: `components/icon/icon-data.js` + `<Icon name="bell" />`, coloured via `currentColor`. Names follow Figma: `bell`, `bellFill`, `chevronRight`, `chevronRightSmall`, `chevronRightTightThick`, `search`, `close`, `navigationRecruit`…
- Includes social/brand glyphs (logoKakao, logoNaverBlog, logoApple, logoGoogle, logoLinkedIn, logoX, logoYoutube…) and 5 bottom-nav icons (채용 / 커리어 / 소셜 / MY / 전체).
- Default colours: label-normal for actions, label-assistive for chevrons/inactive, primary for active/selected, white on materials.
- No icon font, no PNG icons, no emoji or unicode symbols as icons (only "…" and "·" as text).
- Caveat: multi-colour glyphs (e.g. the colour Google logo) were flattened to currentColor by extraction.

## Fonts

`Pretendard JP` and `Wanted Sans` load from jsDelivr CDN (`tokens/fonts.css`); no font binaries were in the .fig. SF Pro / SF Mono appear only in iOS status-bar mocks and are not shipped.
