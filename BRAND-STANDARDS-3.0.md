# Bagger McGee — Brand Standards 3.0

**Version:** 3.0 (sourced from Brand Standards v2, dated 11.6.26)
**Effective:** 11.9.26
**Status:** Authoritative for all 3.0 page design decisions.

> This file supersedes `AGENTS.md` for all design rules going forward.
> `AGENTS.md` (dated 10.2.26) remains in the repo as a historical snapshot of the Littlebird-era "Sam" instructions. Where the two documents disagree, **this file wins.**
>
> Business policies that AGENTS.md established and that are still in force (locked approved pages, no live publication, min-age rules, etc.) are carried forward in Section 10 below.

---

## 1 / The Identity

### The Wordmark

- **BAGGER McGEE** — Onest ExtraBold, 25px, cream `#F4EDE1`, letter-spacing `.02em`.
- Tagline **"Search less, ride more."** — centered beneath the wordmark wherever both appear.
- The logo mark (bearded skull in helmet with flag icon emblem) sits to the **left** of the wordmark at header size.

### The Logo Mark — Two Masters, One Drawing

Two masters of the same drawing:

- **Dark master** — for light surfaces. Carries the art in black, navy, or orange.
- **Color-on-color master** — for dark surfaces. The skull, beard, and helmet stay **light**; the eye cavities, nose cavity, and helmet details stay **dark** — the surface shows through and supplies the dark.

Rules:
- The cavities are **never the lighter color**. A version where they turn light is a negative, and a negative never ships.
- Every 3.0 surface is dark, so **header, footer, and dealer band** all use the color-on-color master with its light outline.
- Clear space around the mark = width of the helmet.
- Minimum size 28px.
- The flag icon emblem in the helmet stays part of the drawing.

---

## 2 / Color Palette

| Name | Hex | Role |
|---|---|---|
| Slate Abyss | `#1E2C40` | Deepest surfaces: footer, deboss shadow lip |
| Slate Deep | `#2A3B52` | Inner panels, card wells, hero surfaces, header |
| Slate Mid | `#3F5673` | Page background, section card outer, info tiles |
| Slate Raised | `#556F90` | Raised fills, mid accents on slate |
| Slate Light | `#6A82A1` | Accent word in display headings, focus ring, labels |
| Button Deep | `#263650` | Molded button body — frame and center face (on Slate Deep/Mid) |
| Button Abyss | `#1F2D45` | Button face on Slate Abyss |
| Cream | `#F4EDE1` | Display heading fill, hover button face |
| Cream Soft | `#EFE6D6` | Hover face gradient highlight |
| Cream Matte | `#D4C9AE` | Button labels, header labels, running text on Slate Mid |
| Cream Dim | `#ADA691` | Body text on Slate Deep or darker **only** |
| Label Blue | `#9FB2C9` | State labels, specimen tags, hairline labels |
| Ink Matte | `#142033` | Button label on cream hover face; text on orange |
| Paper | `#FBF7EF` | Light wells (with cardstock texture) and inputs |
| Ink | `#22303F` | Text on cream surfaces |
| Line | `#D9CFBE` | Hairlines on light surfaces only; table column dividers |
| Orange | `#EE6C1E` | Reserved accent — kickers, EXAMPLE tag, focus borders. **Never a page background.** |

### The Mid Card & the Deep Panel

- Every section lives on a **mid card**: Slate Mid `#3F5673`, up to **1320px** wide, centered, with a 16px side gutter on small screens and **24px** outer corners on `corner-shape: superellipse(2)`.
- Cards sit **60px apart**, stacked one per row.
- Inside each mid card floats the **deep panel**: Slate Deep `#2A3B52` with its own grain texture and **12px** corners on the same superellipse curve.
- The deep panel keeps exactly **40px** of air from the mid card's left, right, and bottom edges (16px on phones). All three gaps match. Nothing inside a deep panel touches the mid card's hairline on any side.

### 3D Thickness on Every Layer

Cards, deep panels, and light wells share one shadow stack:
- 1px inner hairline
- 1px light lip above
- **3px crisp dark edge** below
- One soft drop

Text effects stay crisp: the display deboss uses 1px hard stops and **never a blur**.

### Text Color on Slate Mid

- Text on Slate Mid uses **Cream Matte `#D4C9AE`** (4.6:1 contrast).
- **Cream Dim `#ADA691`** is for Slate Deep or darker **only** — on Slate Mid it falls to 3.1:1 and fails contrast.

---

## 3 / Typography

Fonts: **Onest** (wordmark + display only), **Oswald** (card and section headings), **Inter** (body, kickers, buttons, nav, footer).

### 1. Hero Headline — Deboss

- Onest 900, `clamp(30px, 6vw, 84px)`, 8.4vw on phones.
- ALL CAPS, line-height 1.04.
- Cream `#F4EDE1` fill, accent line Slate Light `#6A82A1`.
- Deboss shadow: `0 -1px 0 rgba(0,0,0,.9), 0 1px 0 rgba(200,220,240,.22), -1px -1px 0 rgba(0,0,0,.55)` — never a blur radius.
- Each phrase locked to its own line at every width (e.g., `SEARCH LESS,` / `RIDE MORE.`).

### 1B. Section Heading — Deboss Recipe

- Onest 900, 36–53px, ALL CAPS.
- Same deboss recipe as the hero.
- Accent words sit one step lighter in Slate Light.
- Long headings break into two lines by meaning.

### 2. Kicker

- Inter 700, 12px, ALL CAPS, letter-spacing `.2em`, orange `#EE6C1E`.
- Sits **above** a section's display heading, 18px over it.
- Every section card opens with one.

### 3. Card Heading

- Oswald 600, 19px, ALL CAPS, letter-spacing `.03em`, cream `#F4EDE1`.
- Every card, step, and panel title.
- Title text in caps, never a sentence.
- Beside a 48px icon it stacks on two lines (e.g., FREE FOR / RIDERS).

### 4. Question Heading

- Oswald 600, 16.5px, Title Case, letter-spacing `.02em`, cream `#F4EDE1`.
- Turns Slate Light `#6A82A1` on hover.
- Used for accordions and FAQ questions. They are questions, not labels.

### 5. Body Text

- Inter 400, 14.5px (16px in the hero), line-height 1.7.
- Cream Dim `#ADA691` on Slate Deep.
- **Cream Matte `#D4C9AE` on Slate Mid.**
- Cream `#F4EDE1` when it must dominate.
- Normal paragraphs — never one sentence per row.
- Key phrases may sit in bright Cream bold inside the sentence.

### 6. Callout Line

- Inter 400, 14.5px.
- Its own block on a new line, 7px of air above.
- Never run into the paragraph.

### 7. Hero Callout

- Inter 700, 17px, cream `#F4EDE1` on slate.
- The short bold line beneath a hero headline.

### 8. Subtitle

- Inter 500, 15px, line-height 1.5, Cream Matte `#D4C9AE`.
- The quiet line under a heading — **only when it is a full sentence**.
- Short labels become kickers instead.

### 9. Nav Link

- Inter 600, 12px, ALL CAPS, letter-spacing `.12em`, Cream Matte `#D4C9AE` on slate.

### 10. Button Label

- Inter 700, 13px, ALL CAPS, letter-spacing `.06em`, Cream Matte `#D4C9AE` on Button Deep `#263650` centers.
- Always centered.

### 11. Footer Column Heading

- Inter 700, 14px, ALL CAPS, letter-spacing `.18em`, cream `#F4EDE1` on slate.
- Outranks the links beneath it.

### 12. The Wordmark

- Onest 800, 25px, cream `#F4EDE1`, letter-spacing `.02em`.
- Onest appears **only** in the wordmark and display headings.

---

## 4 / Two-Piece Clickable Buttons

Every clickable button is built in two parts with a seam between them:

- **The Frame** — the 3D outer squircle or circle. Takes the exact color of the surface behind it. **Never changes at hover.**
- **The Seam** — the 2px dark ring where frame meets center.
- **The Center Button** — the inner squircle or circle, same molded slate material. **This is the part that flips to cream at hover.**

### Squircle Ratio (fixed)

- Frame radius: **14px**
- Center radius: **7px**
- Both on `corner-shape: superellipse(2)`.

### Circles

- Perfect rounds — 50% everywhere.
- Multi-word labels **stack one word per line**.

### Interactive States

- **Hover** — face flips to cream with its own soft highlight. Frame never moves, never changes color.
- **Press** — the whole button sinks 1px; shadows go concave (inset).
- **Keyboard focus** — a visible ring in Slate Light `#6A82A1`, 2px, offset 3px. Focus is never invisible.
- **Mobile** — paired actions sit side by side, never stacked full-width twins.

### Squircle — Rest / Hover / Press

- Body `#263650` · label `#D4C9AE` matte · ring radius 14px · face radius 7px.
- **Hover:** face `#F4EDE1` · text `#142033`.
- **Press:** 1px sink, concave inset, **orange label**.

### Circle — Get Listed

- GET LISTED is always a circle.
- **102px total**: a **13px molded ring** around a **76px face**.
- Label stacked one word per line, 12px.
- Same material and states as the squircle.

### Buttons on Slate Abyss

On the darker Slate Abyss footer, the standard `#263650` face would look too light. So on Slate Abyss, buttons use:
- Face: **`#1F2D45`**
- Seam: **`#0A0F18`**
- A softer highlight

Hover and press states are unchanged.

### Tactile Labels

- Matte cream `#D4C9AE` on slate.
- Ink `#142033` on the cream hover face.
- **Bright white label text is retired**, along with the greys.

### The Sanctioned Exceptions

Exactly two departures from the rules above exist — both approved on the FAQ page:

1. **Rectangle (squircle) labeled "Get Listed"** — the retailers' Get Listed on the FAQ page. The only rectangle allowed to carry that label.
2. **Arrow (scroll-to-top)** — the only button with an arrow.

Everything else follows the standard rules.

### Not Clickable — The Inset Family

Icons that do nothing get **inset shadows** — pressed in, not raised.

- Deep slate face `#263650` · radius 10px · inset shadow both directions · matte `#D4C9AE` icon.
- Sizes: 32 / 40 / 48 / 56 — pick the one matching surrounding button scale.
- Example windows (sample results) show their icons this way. **Nothing in an example is clickable.**

### Info Tiles — Not Buttons

Labels that sit near a real button are never button-styled, or they compete with it. Use flat info tiles instead:

- Slate Mid `#3F5673` with grain · 12px squircle · 32px inset icon.
- Oswald 600 14px caps name.
- Inter 13px Cream Matte supporting line.
- A button below them is pinned to the panel bottom so side-by-side panels line up.

### The Corner Ladder

One formula everywhere: **`corner-shape: superellipse(2)`** — the squircle. Circles are perfect rounds, never squircles.

| Element | Radius |
|---|---|
| Cards | 24px |
| Panels | 12px |
| Button frame | 14px |
| Center button | 7px |
| Inputs, chips, info tiles | 12px |
| Small tags, inset icons | 10px |
| Circles | 50% (and `corner-shape: round`) |

Safari does not support `corner-shape` yet. iPads show standard rounded corners at the same radii.

### Banned

- Flat rectangles
- Drop-shadow-only buttons
- Arrows on buttons (except the sanctioned scroll-to-top)
- Frames that change color at hover
- Button styling on anything that is not clickable

---

## 5 / The Dropdown Rule (Selects)

**This rule replaces any earlier select/dropdown spec.**

- Chevron sits on the **left**, **12px in**.
- The label text **never truncates** — "Harley-Davidson" must fully show at every width, on every page.
- When a row gets too narrow, fields **wrap to their own row** before they would cut text.
- Long-value fields (Model) always take a full row.

Styling:
- Inter 600, 14.5px.
- Paper `#FBF7EF` fill, 1.5px line border, radius 12px, inset pressed shadow.
- Focus border turns **orange** `#EE6C1E`.

---

## 6 / FAQ & Accordion Rule — One Open at a Time

- Only one answer is ever open.
- When the user opens another question, the previous answer closes.
- The open question's `−` closes it.
- **The first question loads open.**

---

## 7 / Header, Hamburger & Log In

- Desktop shows the full nav.
- As the window narrows, the "Search engine for Harley & Indian parts" tagline line hides first.
- When the links would crowd, a **squircle-framed hamburger** replaces them and opens a dropdown menu.
- There is **exactly one Log In / Join** — in the header bar.
- On screens 480px and narrower, Log In / Join moves **into the hamburger menu** as a full-width squircle.

> Note: AGENTS.md's rule "hamburger at ALL viewport widths" is retired. In 3.0 the desktop shows the full text nav, with the hamburger appearing only when the links would crowd.

---

## 8 / The Alignment Lines

Everything hangs off the **skull edge** (left) and the **Log In frame edge** (right).

- The left edge of all content aligns with the **left edge of the bearded skull** in the header.
- The right edge of every deep panel aligns with the **right edge of the Log In / Join frame**.
- Header, footer, and every card share these two lines, so the page has one left edge and one right edge.
- Kickers, display headings, hero text, and deep panels start on the skull edge.
- Deep panels end on the Log In edge.

Column math:
- Content column = mid card width minus 40px each side (16px on phones).
- The header and footer use the same column.
- Inside a panel, content sits 40px in (20px on phones).

---

## 9 / Cards, Corners & Surfaces

### The Card

- Cards are a **slate stack**: a Slate Mid outer frame at 24px radius carrying the paper grain, with Slate Deep inner panels at 12px radius inside.
- This is the house stack. Pages such as search results may also run white or orange card variants where the design calls for them.
- **Content decides the row:** three steps sit three across, four trust panels sit four across. Panels in one row always match height.
- The old "rows of two, four to a section" rule is retired.

### Surfaces

- **Slate Mid** `#3F5673` — page and section frames.
- **Slate Deep** `#2A3B52` — inner panels and heroes.
- **Slate Abyss** `#1E2C40` — footer.
- **Cream** `#F4EDE1` — the hover face of a button and reserved light wells.
- **Orange** `#EE6C1E` — reserved accent.
- A button's molded body is Button Deep `#263650` (Button Abyss `#1F2D45` on Slate Abyss).

### The Light Well

- Paper `#FBF7EF` with a **cardstock texture** (warm grain with faint fibers).
- 12px squircle corners.
- Same 3D thickness stack as the slate panels.
- Text is Ink `#22303F`.
- Hairlines are Line `#D9CFBE`.

### Members-Only Locking

- Member features are **visibly locked**, never merely hidden.
- The panel dims and a **MEMBERS ONLY** tag marks the gate (Marker font, orange, slight rotation).
- **Nothing member-only functions without an account.**

---

## 10 / Spacing Rhythm

The vertical rhythm:

- **48px** above a section's kicker
- **18px** kicker → heading
- **24px** heading → subtitle (when there is one)
- **32px** subtitle → first panel
- **40px** panel inset from the card's sides and bottom
- **60px** between cards
- Grid gaps: 12–20px

The hero:
- The search panel sits 40px from the card's top, right, and bottom.
- The headline side is centered beside it.

Rules:
- **Breathing room beats a one-screen fit.**
- When content does not fit, the page scrolls — it never jumbles.
- **No page, at no width, ever scrolls sideways.**

---

## 11 / Tables & Examples

### Light-Well Table Pattern

Results tables sit in a light well with a top bar showing:
- Title (Oswald 600 caps) + subtitle (Slate Raised)
- **EXAMPLE tag** on the right if the content is static sample data

### Table Rules

- **Dividers** — a 1px vertical hairline in Line `#D9CFBE` between every column.
- **Headers** — all centered, horizontally and vertically.
- **Shipping Score column** — the header stacks SHIPPING / SCORE so the column stays narrow. Badges sit centered under it. Brand terms are never shortened (no "Ship Score").
- **Phones** — rows become **stacked cards with left-aligned labels and no dividers**. No sideways scroll.
- **The EXAMPLE tag** — orange `#EE6C1E` fill, Ink `#142033` text, 12–13px caps.
- **Example windows are fully static** — retailer names in plain bold, icons as inset tiles, no links, no hover. A footnote never promises an action the example can't do.

> Note: AGENTS.md said Landing and Search Results must keep horizontal listing rows at every width and must not stack to cards on mobile. The v2 table rule here (phones → stacked cards) supersedes that for all data tables going forward. The Landing page keeps its orange sortable column headers visually, but the mobile presentation now stacks.

---

## 12 / The Ten Non-Negotiables

Every build, every page:

1. No horizontal scrolling anywhere, at any width — tables wrap, grids flow.
2. No awkward line breaks — text uses the full width of its line before wrapping; never break early when room remains; keep compound words whole; a heading stays on one line whenever the space allows it.
3. No zero-padded numbers — 1, never 01.
4. No colored left-border accent bars.
5. Every button and link goes to a real destination.
6. Members-only areas lock visibly: dim plus diagonal band.
7. The tagline centers under the wordmark.
8. Exactly one Log In / Join button in the header.
9. No pre-launch hedging; the footer's design-preview note is the only disclosure.
10. Tone is plain-spoken rider-to-rider: short sentences, no marketing filler, no hedging.

---

## 13 / Business & Content Policies (Carried Over)

These policies are from AGENTS.md and remain in force in 3.0:

### Locked Approved Pages

- **Terms of Use** is locked as **AP-012**. The approved PDF is the historical record.
- **Affiliate Disclosure** is locked as **AP-011**. The approved PDF is the historical record.
- Do not revise these pages without an explicit decision to re-open them.

### Site-Wide Content Rules

- **Omit the business address** and any holding-company name from the site.
- Market: **US customers**; browsing is available worldwide.
- Minimum age for accounts and reviews: **16**.

### Pre-Launch Status

- **Bagger McGee LLC** will be registered before launch.
- **The site is not published live yet.** Pages are design-preview only.
- Preview buttons may be interactive but **must not imply** that real accounts, transactions, or messages are being processed.

### Source Archives

- Full source zip: `docs/approved-pages/source/Bagger-McGee-Editable-Source-2026-10-02.zip`
- Terms of Use source zip: `docs/approved-pages/terms-of-use/source/Bagger-McGee-Terms-of-Use-Editable-Source-2026-10-02.zip`

### Shared Components (still in force)

- `PublicHeader` and `PublicFooter` components with shared CSS on all public pages.
- The **Sign Up page** remains the reference page for shared component styling.
- **Shipping Score** badges reuse the shared `shippingBadge` style.
- On search result cards, the positions for Shipping Score, coupon, Share, and Flag are stable across cards.

---

## 14 / Internal Glossary

- **PCW** — Price Comparison Website.
- **EYES** — individuals visiting baggermcgee.com looking for the best deals on Harley / Indian parts.
- **PSPX** — ecommerce Harley / Indian parts retailers that are **not yet** paying monthly fees. Prospective customers.
- **VNDRZ** — ecommerce Harley / Indian parts retailers who **are** paying a monthly fee to be listed. Paying customers.

---

*End of Brand Standards 3.0.*
