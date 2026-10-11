# Phase 01 — Product UX architecture

> **Old idea. New experience.** People once waited for letters. Daktik brings that feeling into a modern, premium mobile product. The nostalgia comes from the *concept and interactions*, never from dated UI.

## 1. Product principles

| Principle | What it means in practice |
|---|---|
| Letters are the product | Reading and writing get the most space, the calmest surfaces and the best motion. Everything else steps back. |
| Waiting is a feature | Delivery takes hours (10–24h). The UI makes the wait *visible and pleasant* (timeline, remaining time), never anxious. |
| One screen, one purpose | Each screen answers one question. No dashboards of look‑alike cards. |
| Calm over engagement | Finite feeds, no streak pressure, no red badges with counts > 9, no confetti. |
| Bengali‑first | Natural, informal Bengali microcopy. Bengali numerals inside sentences, Latin numerals for identity/currency components. |
| Modern first, emotional second | 2026 visual language: large type, whitespace, soft surfaces. Postal ideas (stamps, envelopes, postal ID) are expressed as clean digital objects. |

## 2. Information architecture

```
Daktik
├── Onboarding (3 steps) → Authentication (Google · Apple · Email · Phone)
└── App
    ├── 01 Home ─────────────── personal dashboard (editorial, not cards)
    │    ├── Hero: unread count → opens newest unread letter
    │    ├── Recent letters (≤3)
    │    ├── In‑transit strip (only when something is on the way)
    │    ├── Postal identity (copy · QR)
    │    └── Activity line: sent · received · stamps
    ├── 02 Letters ──────────── inbox / sent / drafts
    │    ├── Letter Reader  (inbox, sent‑delivered, archived)
    │    ├── Delivery status (sent, in transit)
    │    └── Compose (drafts resume here)
    ├── 03 Compose (FAB) ────── recipient · subject · body · stamp · ticket → send
    │    └── Delivery status (signature moment)
    ├── 04 Post Office (ডাকঘর)
    │    ├── Stamps (collection + detail sheet)
    │    ├── Envelopes
    │    ├── Tickets (explainer; bought at compose time)
    │    ├── Coins (balance · top‑up · history)
    │    ├── Collection (my stamps)
    │    └── Postman Adda (community)
    └── 05 Profile
         ├── Postal Identity (large ID · QR · share)
         ├── My letters → Letters tab
         ├── My collection
         ├── Saved (archived letters)
         └── Settings (Account · Experience · Privacy · Support)

Global overlays: Arrival moment · Notifications · Toast · Bottom sheet · Dialog
```

## 3. Navigation structure

* **Bottom navigation, five slots**: Home · Letters · **Compose** · Post Office · Profile.
  Compose is an *action*, not a destination: a raised green 60px rounded‑square button in the centre (thumb zone), opening Compose as a full‑screen sheet that rises from the bottom.
* **Stack on top of tabs**: detail screens push over the tab bar (slide‑in from the right, 280 ms). Compose rises from the bottom. The Reader *fades and unfolds* so opening a letter feels different from navigating.
* **Back**: Android hardware back pops the stack → returns to Home → exits. Escape and on‑screen back mirror it.
* **Tab re‑tap** scrolls to top; switching tabs restores each tab's scroll position.
* Maximum depth from any tab: 2 (e.g. Post Office → Stamps → Stamp sheet).

## 4. Core user journeys

### J1 — Write a letter (intentional)
`FAB → Compose → type Postal ID (live lookup shows name ✓) → write → (optional stamp) → choose delivery ticket → “চিঠি পাঠিয়ে দিন” → envelope seals (900 ms) → Delivery status (“চিঠি পাঠানো হয়েছে।”)`

Friction is deliberate only where it adds meaning (choosing a ticket). Everything else is removed: no paper/ink/font pickers, no postman selection, no envelope step.

### J2 — Wait (visible, calm)
`Home in‑transit strip / Letters › Sent row with gold progress → Delivery status: ✓ লেখা হয়েছে · ✓ ডাকঘরে পৌঁছেছে · ● পথে আছে · ○ প্রাপকের কাছে পৌঁছাবে · “প্রায় ১৮ ঘণ্টা বাকি”`

### J3 — Receive (rewarding)
`Letter crosses deliverAt → Arrival moment (full screen, quiet) → “চিঠি খুলুন” → Reader (paper unfolds, stamp settles) → ♡ / “এই চিঠির উত্তর দিন” → Compose prefilled`

“পরে দেখব” dismisses; the letter waits in the inbox with an unread dot and in the Home hero.

### J4 — Collect
`Post Office → Stamps (progress 6/10, filters) → tap stamp → detail sheet → “৩০ কয়েনে সংগ্রহ করুন” → stamp animates into collected state → available in Compose`

### J5 — Identity
`Home / Profile → Postal Identity → copy · share · QR (daktik://to/343-1111)`

## 5. Feature hierarchy

| Tier | Features | Treatment |
|---|---|---|
| **Core** | Read letter · Write letter · Delivery status · Arrival | Full‑screen, best motion, primary green |
| **Supporting** | Inbox/Sent/Drafts · Postal identity · Coins · Delivery tickets | One tap from tabs, standard screens |
| **Ecosystem** | Stamps · Envelopes · Collection · Postman Adda | Post Office hub, collectible tone |
| **Utility** | Notifications · Settings · Saved | Plain grouped lists |

## 6. What changed vs. the previous generation

The legacy app (`src/App.tsx`, ~17k lines) exposed **38 screens** including head office rooms, veranda, dead‑letter office, postman CVs, money orders, savings, scents, gifts, burn‑a‑letter, paper/ink/font/pen pickers and an admin panel inside the user app. The new architecture keeps the *emotional core* and removes the simulation layer:

| Legacy concept | New architecture |
|---|---|
| Veranda / head office / dead‑letter / returned‑to‑post | One honest **delivery timeline** with an ETA |
| Postman selection, postman records, excuses | Removed from the user flow (delivery speed = ticket) |
| Paper, ink, pen size, handwriting font, scent, gift | Removed from compose; letters render on one beautiful digital paper. Envelopes/stamps remain as collectibles |
| Burn / hide / save tabs | Archive (swipe right) · Delete (swipe left) · Saved list |
| Money order / savings | Coins screen (balance, history, top‑up) |
| Adda room, live postman gossip | Postman Adda — calm, finite community feed |
| Admin panel | Out of the consumer app (separate admin surface) |
