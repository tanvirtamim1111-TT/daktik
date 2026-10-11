# Phase 07 — Android implementation structure

Daktik ships to Android through **Capacitor 8** (already configured: `capacitor.config.ts`, `com.dakghor.app`). The new UI is a React 19 + Tailwind 4 + Motion web app inside that shell.

## 1. Source layout

```
src/
├── main.tsx                 UI switch (next | legacy), lazy‑loads one of them
├── App.tsx                  legacy UI (unchanged behaviour)
└── next/                    ← new Daktik UI
    ├── App.tsx              shell: onboarding/auth gate, tabs, stack, arrival, back button
    ├── nav.tsx              Tab + Route types, useNav()
    ├── theme/daktik.css     design tokens (light/dark), type scale, utilities
    ├── lib/format.ts        Bengali digits, Postal ID mask, relative time, ETA phrases
    ├── data/
    │   ├── types.ts         UI domain model
    │   ├── store.tsx        DaktikStore interface + in‑memory provider
    │   └── mock.ts          seed data, delivery tickets
    ├── components/
    │   ├── primitives.tsx   Button, IconButton, Avatar, TopBar, Tabs, FilterChips, Search,
    │   │                    ListGroup/Item, Switch, Empty/Skeleton/Error, BottomSheet, Dialog, Toast
    │   ├── domain.tsx       PostalIdChip, LetterRow, DeliveryTimeline, StampCard, Coin*, ProfileHeader
    │   ├── art.tsx          StampArt, HeroArt, EnvelopeGlyph, ImageCard (SVG)
    │   └── BottomNav.tsx    5‑slot nav with raised Compose
    └── screens/             Home, Letters, Reader, Compose, Delivery, Arrival, PostOffice
                             (+Envelopes, Tickets), Stamps, Coins, Adda, Profile (+Identity,
                             Settings, Notifications, Archive), Onboarding (+Auth), SystemGallery
```

## 2. Switching the app to the new UI

| Context | How |
|---|---|
| Default | The new UI (website and app) |
| Previous UI | `?ui=legacy` (persisted) or build with `VITE_DAKTIK_UI=legacy` |
| Demo data | `?demo=1` (persisted), `?demo=0` for real accounts |

The legacy UI and its CSS are code‑split; a device running the new UI never downloads them.

## 3. Data layer (Firestore) — implemented in `data/firebaseStore.tsx`

Screens depend only on `DaktikStore` (`data/store.tsx`). `FirebaseStoreProvider` implements it on the existing collections (see also [08-website.md](08-website.md)):

| UI model | Firestore source | Mapping |
|---|---|---|
| `Me` | `users/{uid}` | `displayName → name`, `postcode → postalId`, `coins`, `photoURL → photo`, `createdAt → joinedAt` |
| `Person` | `users` where `postcode == id` | `lookup()` = one indexed query, cached |
| `Letter` | `letters` where `receiverUid == uid` / `senderUid == uid` | `timestamp → sentAt`, `timestamp + deliveryDelay → deliverAt`, `isRead → read`, `isHidden → folder: archived`, `bodyPages/greeting/closing` joined into `body` |
| `DeliveryTicket` | price → hours (`getDeliveryHours` in legacy: 35→10, 30→15, 20→20, else 24) | identical tiers |
| `Stamp`, `Envelope` | `shop_items` + `users/{uid}/inventory` | `collected/owned` = present in inventory |
| `CoinTransaction` | derived: sent letters (`coinsSpent`), inventory purchases, `requests` of type `coin_purchase` | no extra collection needed |
| `AppNotification` | `users/{uid}/notifications` | unchanged |
| `AddaPost` | new `adda_posts` | rules added in `firestore.rules` |

Rules:
* Coin spend + letter create happen in **one Firestore transaction** (as legacy `SendProcess` does).
* `deliveryStage` stays derived from time on the client; the server only stores `sentAt` and `deliverAt`.
* Arrival detection: FCM data message when `deliverAt` passes (Cloud Scheduler / Functions) + the client clock check already in `StoreProvider` for foreground.

## 4. Native integration

| Concern | Approach (✓ built · ○ planned) |
|---|---|
| Back button | ✓ `@capacitor/app` `backButton` → overlay → stack → Home → `exitApp()` (in `next/App.tsx`) |
| Status bar | ○ `@capacitor/status-bar`: `setStyle(Light/Dark)` following `data-theme`; overlay webview so safe‑area insets apply |
| Safe areas | ✓ `viewport-fit=cover` (already in `index.html`) + `.dk-safe-top/.dk-safe-bottom` |
| Keyboard | ○ `@capacitor/keyboard` `resize: "body"`; Compose's send bar is fixed and rides above the IME; inputs use `inputMode="numeric"` for Postal ID |
| Haptics | ○ (web `navigator.vibrate` on long‑press ✓) `@capacitor/haptics` `impact({style: Light})` on long‑press select, send, collect (web fallback `navigator.vibrate`) |
| Push | ○ `@capacitor/push-notifications`; tapping a “চিঠি এসেছে” push opens the Arrival moment, not the inbox |
| Deep links | ○ (QR encodes the link ✓) `daktik://to/{postalId}` (QR) → Compose prefilled; add intent filter in `AndroidManifest.xml` |
| Fonts | ○ Ship Anek Bangla, Noto Sans Bengali and Inter as local `woff2` in `public/fonts` for offline first paint (currently Google Fonts) |
| Splash | ○ Ivory background, centred Daktik mark; no animation |

## 5. Responsive targets

360 / 390 / 412 px phones are the primary frames; content column is capped at 480 px and centred on tablets and unfolded foldables. All type is in `rem` (Android font scale honoured), touch targets ≥ 44 px, bottom navigation height constant.

## 6. Quality gates

* `npm run lint` (tsc) — zero errors.
* `npm run build` — both UIs build; new UI CSS ≈ 42 kB.
* Visual check at 360 px and 390 px in light and dark (Phase 05 screenshots).
* Accessibility: labels on icon buttons, roles on tabs/radios, `aria-live` toasts, reduced‑motion support.

## 7. Next steps

1. ✓ Firestore store and Firebase Auth (Google, Apple, email, phone).
2. Online coin payments (currently an admin‑approved request).
3. Blocked users, privacy, security and language settings; Adda comments + reporting.
4. Server‑side delivery (Cloud Function) so letters can't be read before `deliverAt`, plus FCM push on arrival.
5. Android: status bar, keyboard, haptics, deep links, bundled fonts — then remove the legacy screens.
