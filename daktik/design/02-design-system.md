# Phase 02 — Design system

Source of truth in code: [`src/next/theme/daktik.css`](../src/next/theme/daktik.css) (tokens) and [`src/next/components/`](../src/next/components) (components). A living gallery is available in the app: **Profile → Settings → ডিজাইন সিস্টেম**.

## 1. Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `--dk-green` | `#173F35` Deep Postal Green | `#2E6152` | Primary CTA, active nav, selected states, identity moments |
| `--dk-bg` | `#F7F5EF` Soft Ivory | `#111413` deep charcoal | App background |
| `--dk-surface` | `#FFFFFF` | `#181C1A` | Raised surfaces (sheets, list groups) |
| `--dk-sunken` | `#EFECE4` | `#1E2320` | Inputs, chips, secondary buttons |
| `--dk-paper` | `#FCFBF7` + 3.5% grain | `#1B1F1D` + 5% grain | Letter reading surface only |
| `--dk-gold` | `#C8A24A` Warm Gold | `#B8995A` muted | In‑transit, coins, small highlights. Never large fills |
| `--dk-sage` | `#AAB9A9` Muted Sage | `#7F8F80` | Illustrations, empty‑state art |
| `--dk-ink` | `#151716` | `#EFEBE0` soft ivory | Primary text |
| `--dk-ink-2` | `#70756F` | `#A3A89F` | Secondary text |
| `--dk-error` | `#C94B4B` | `#E07A72` | Destructive, validation |
| `--dk-success` | `#4D8A68` | `#74B18E` | Confirmations, earned coins |

**Rules.** Green is used *strategically* — at most one large green element per screen (hero, primary CTA, or selected ticket). Screens stay bright and breathable. No gradients except the hero glow and the arrival moment. Images get `--dk-img-filter` (dark mode: brightness .82, saturate .9).

**Dark mode** is designed, not inverted: charcoal base, lifted green so CTAs keep contrast, ivory text (not white), muted gold, reduced image brightness, deeper shadows.

## 2. Typography

| Role | Face | Size / line‑height | Class |
|---|---|---|---|
| Display | Anek Bangla 600 | 40 / 1.08 | `.dk-display` |
| Heading 1 (screen title) | Anek Bangla 600 | 28 / 1.2 | `.dk-h1` |
| Heading 2 (section) | Anek Bangla 600 | 20 / 1.3 | `.dk-h2` |
| Body | Noto Sans Bengali 400 | 15 / 1.6 | `.dk-body` |
| Reading (letters) | Noto Sans Bengali 400 | 17 / 1.95 | `.dk-reading` |
| Caption | Noto Sans Bengali 400 | 12 / 1.4, ink‑2 | `.dk-caption` |
| Overline | Inter 500, +0.14em, caps | 11 | `.dk-overline` |
| Numbers | Inter, tabular | context | `.dk-num` |

* **Anek Bangla** is a contemporary, geometric Bengali family — it reads as 2026, not as a newspaper.
* **Noto Sans Bengali** for long reading: open counters, excellent hinting on Android.
* **Inter (tabular numerals)** for Postal ID, coins, counters, hours: `343-1111`, `120`, `0 / 1000`.
* Numbers *inside Bengali sentences* use Bengali digits: “পৌঁছাতে প্রায় ১৮ ঘণ্টা লাগবে।”
* No decorative/handwriting Bengali fonts anywhere.

## 3. Spacing & grid

* 4‑pt base. Common steps: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40.
* **Screen gutter 16 px** (20 px on Compose/Delivery/Coins for a more editorial measure).
* Single‑column layout, max content width 480 px (centred on tablets/foldables).
* Section rhythm: 40 px between major sections, 24 px between related groups.
* Lists separate rows with whitespace (16 px vertical padding); borders only between groups.

## 4. Shape & elevation

| Radius | px | Use |
|---|---|---|
| `dk-sm` | 10 | small tiles (stamp picker) |
| `dk-md` | 16 | stamp cards, tickets, toasts |
| `dk-lg` | 24 | list groups, info panels, dialogs |
| `dk-xl` | 32 | hero, sheets, paper |
| full | — | buttons, chips, inputs, avatars |

Shadows are soft and rare: `shadow-1` for floating action buttons on paper, `shadow-2` for paper/sheets/dialogs, `shadow-fab` for Compose. Most surfaces have **no border and no shadow** — they are separated by tone.

## 5. Iconography

* **Lucide**, 1.8 px stroke (2.2 when active), 20–22 px in UI, 24 px in FAB.
* Outline only; filled state reserved for *on* states (heart reacted).
* Postal objects (stamps, envelopes, Daktik mark) are custom SVGs in `components/art.tsx`, drawn with the brand palette — never emoji, never clip‑art.

## 6. Components

All live in `src/next/components/`. States are implemented where relevant.

| Component | File | States |
|---|---|---|
| Primary / Secondary / Ghost / Danger Button | `primitives.tsx` `Button` | default · pressed (scale .98 + darker) · disabled (40%) · loading (spinner, `aria-busy`) |
| Icon Button | `IconButton` | plain · soft · inverse · pressed · disabled |
| Navigation Bar + Floating Compose | `BottomNav.tsx` | default · active (green icon + top indicator) · unread dot |
| Top Bar | `TopBar` | compact · large title · with back · with trailing actions |
| Letter Row | `domain.tsx` `LetterRow` | unread · read · in‑transit (gold ETA + progress) · draft · swipe‑archive · swipe‑delete · selection mode · selected |
| Avatar | `Avatar` | photo · initials on per‑person hue · ring (identity) · shared‑element |
| Postal ID | `PostalIdChip` | md · lg · on‑dark · copied (✓ + toast) |
| Delivery Timeline | `DeliveryTimeline` | done ✓ · active (pulsing gold) · pending ○ · delivered · animate‑in |
| Stamp Card | `StampCard` + `StampArt` | collected (✓) · locked (greyscale) · pressed |
| Coin Balance / Coin Transaction | `CoinBalance`, `CoinTransactionRow` | earned (+, success) · spent (−) |
| Profile Header | `ProfileHeader` | — |
| Tab Bar | `Tabs` | default · selected (animated underline) · with count |
| Filter | `FilterChips` | default · selected · pressed |
| Search | `SearchField` | empty · typing · clear |
| Bottom Sheet | `BottomSheet` | open · drag‑to‑dismiss · scrim tap · Esc |
| Dialog | `Dialog` | default · destructive |
| Toast | `ToastProvider` / `useToast` | default · success · error · with action (undo) |
| Empty / Loading / Error | `EmptyState`, `SkeletonRows`, `ErrorState` | — |
| Image Card | `art.tsx` `ImageCard` | photo · generated placeholder |
| List Group / Item / Switch | `ListGroup`, `ListItem`, `Switch` | default · pressed · danger · on/off |

## 7. Motion principles

| Principle | Value |
|---|---|
| Standard easing | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Micro (press, toggle) | 120–150 ms |
| Screen transitions | 250–300 ms |
| Signature moments (open letter, arrival) | 450–600 ms, staggered |
| Springs | stiff & damped (stiffness 380–500, damping 35–42); no visible bounce except the stamp settling |
| Reduced motion | `MotionConfig reducedMotion="user"` — transforms are dropped, fades kept |

Motion inventory: shared‑element avatar (row → reader), paper unfold, paragraph fade‑in, stamp settle, slide‑up compose & sheets, delivery timeline draw‑in, pulsing active step, stamp selection lift, coin purchase confirmation, tab underline glide, arrival envelope + ripples.

Never: confetti, bouncing icons, looping attention animations on idle screens, transitions > 600 ms.

## 8. Accessibility

* Touch targets ≥ 44 px (nav 64 px, primary buttons 56 px).
* Contrast: ink on ivory 16:1; ink‑2 on ivory 4.6:1; ivory on green 11:1.
* Every icon‑only control has an `aria-label`; tabs use `role=tab`; tickets and stamps in compose use `role=radio`; toasts are `aria-live`.
* Sizes in `rem` so Android font scaling works; layouts tested at 360 px with long Bengali strings.
* Focus ring: 2 px gold outline.
