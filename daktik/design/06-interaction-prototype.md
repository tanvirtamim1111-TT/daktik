# Phase 06 — Interaction prototype

The prototype *is* the app: a fully interactive build with in‑memory data.

## Run it

```bash
cd daktik
npm install
npm run dev            # http://localhost:3000/?demo=1
```

`?demo=1` runs the prototype on seed data (remembered; `?demo=0` returns to real accounts). Use Chrome DevTools device mode (Pixel 7, 412 px; or 360 px) for the phone frame, or a normal window ≥ 1024 px for the website layout.

## Scripted moments to try

| # | Flow | What to look for |
|---|---|---|
| 1 | First launch → onboarding (3) → auth | Slide visuals animate their part of the journey; “বাদ দিন” always available |
| 2 | Wait ~6 s on Home | **Arrival moment**: Mitu's letter lands (seeded to arrive just after launch) |
| 3 | “চিঠি খুলুন” | Reader opens: paper unfolds, paragraphs fade, stamp settles; avatar is a shared element |
| 4 | ♡ → “এই চিঠির উত্তর দিন” | Compose rises with recipient + subject prefilled |
| 5 | Pick Express → send | Button → “খামে ভরা হচ্ছে…” → Delivery status draws the timeline in; coins deducted |
| 6 | Letters → swipe a row right / left; long‑press | Archive + undo toast; delete confirm; selection mode header |
| 7 | Letters → Sent → in‑transit row | Opens Delivery status, not the reader |
| 8 | Compose → type `208-7731`, `343-1111`, `999-0000` | Recipient ✓ / “নিজেকে চিঠি পাঠানো যায় না” / “এই ঠিকানায় কেউ নেই” |
| 9 | Compose → write → ✕ | “খসড়া রেখে দেবেন?” → appears in Drafts; tapping a draft resumes it |
| 10 | Post Office → Stamps → locked stamp → collect | Sheet, coin spend, stamp animates to collected, now selectable in Compose |
| 11 | Coins → কয়েন নিন | Pack selection → processing → confirmation (prototype only, no payment) |
| 12 | Settings → থিম | Cycles system → light → dark; dark is a separate palette |
| 13 | Settings → ডিজাইন সিস্টেম | Every component in every state |
| 14 | Settings → চিঠি আসার মুহূর্ত দেখুন | Replays the arrival moment |

## Motion spec (as built)

| Interaction | Animation | Duration / curve |
|---|---|---|
| Tab switch | cross‑fade | 150 ms |
| Push screen | x 18% → 0, fade | 280 ms, standard ease |
| Compose open/close | y 100% → 0 | spring 380/40 |
| Letter open | page fade 250 ms; paper y 28 → 0, scaleY .97 → 1 | 550 ms, delay 80 ms |
| Paragraphs | fade, stagger 80 ms | 500 ms |
| Stamp settle (reader) | rotate −14° → 4°, scale .8 → 1 | spring 220/16, delay 500 ms |
| Delivery timeline | steps rise + connector fills, stagger 180 ms | 350–500 ms |
| Active delivery step | gold ring pulse | 1.8 s loop, only on that dot |
| Stamp select (compose) | lift −4 px, rotate −3° | spring 400/22 |
| Ticket select | fill + check glides (`layoutId`) | 150 ms |
| Bottom sheet | y 100% → 0; drag to dismiss (>120 px or fast flick) | spring 420/42 |
| Dialog | fade + scale .96 → 1 | 180 ms |
| Toast | y 12 → 0, fade | 200 ms; 2.6 s (4.5 s with action) |
| Arrival | fade in; envelope drops & settles; flap draws; text staggers; two ripples | 350 ms → ~1.1 s total |
| Coin purchase | coin pops in, balance re‑counts | spring 300/16 |
| Press | scale .98 (buttons) / .97 (cards) | 120 ms |

All motion respects the OS “reduce motion” setting.
