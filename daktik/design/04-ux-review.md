# Phase 04 — UX structure review

Review of the Phase 03 wireframes before high‑fidelity work. Each finding lists the decision taken.

## Redundant screens

| Finding | Decision |
|---|---|
| “Tracking” and “Sent letters” were separate legacy screens showing the same letters. | Merged: Sent tab shows ETA + progress inline; tapping an in‑transit letter opens Delivery status, a delivered one opens the Reader. |
| Tickets as a shop is redundant — a ticket is only meaningful at send time. | Tickets screen is an explainer; selection happens inside Compose. |
| “Collection” in Post Office duplicates Stamps. | Kept as a filtered view of Stamps (`mine`) rather than a new screen. |
| Profile “My Letters” duplicates the Letters tab. | Row switches tab instead of opening a copy. |
| Notification detail screen. | Removed: notifications deep‑link straight to the letter / delivery. |

## Missing states (added)

* Empty: inbox (“আপনার ডাকবাক্স এখনো খালি।” + “প্রথম চিঠি লিখুন”), sent, drafts, search no‑results, stamps (“আপনার সংগ্রহ শুরু হয়নি।” + “স্ট্যাম্প দেখুন”), notifications (“আজ সব শান্ত।”), saved.
* Loading: skeleton rows (not spinners) for lists.
* Error: inline error state with retry; error toasts with action.
* Compose: unknown Postal ID, sending to self, insufficient coins (with link to Coins), character limit warning at 90%, unsaved draft on close.
* Reader: letter deleted while open.
* Home hero: zero unread, something in transit, nothing at all.

## Navigation problems

| Problem | Fix |
|---|---|
| Legacy app had 38 screens reachable from many entry points, no consistent back. | Two levels max; hardware back has a defined order (overlay → stack → Home → exit). |
| Compose was buried behind a multi‑step send flow (address → stamp → postman → envelope → seal). | One screen; the only required choices are recipient, words and ticket. |
| Arrival interrupting compose. | The arrival moment is held while Compose is open and shown when it closes. |
| After sending a reply, where does the user land? | Delivery status → “ঠিক আছে” returns to the letter they were replying to. |

## Unnecessary features (cut from the user app)

Veranda/head‑office/dead‑letter simulation, postman selection and excuses, money orders, savings, scents, gifts, ink/paper/pen/font pickers, burn animation, live AI postman gossip, in‑app admin panel. These created *noise* around the core emotion and most of the legacy complexity.

## UX friction (resolved)

* **Postal ID entry**: auto‑format `3431111 → 343-1111`, Bengali digits accepted, live recipient confirmation (avatar + name ✓).
* **Ticket price anxiety**: unaffordable tickets are dimmed (still focusable) and explain how many coins are missing.
* **Swipe discoverability**: a one‑line hint under the inbox; archive offers “ফেরত আনুন” undo; delete always confirms.
* **Thumb reach**: every primary action is pinned to the bottom (Reader reply, Compose send, Delivery “ঠিক আছে”, sheets).
* **Reading comfort**: 17 px / 1.95 line‑height, 24 px side padding on paper, text is selectable.

## Open questions for product

1. Should recipients see the sender's ticket/ETA before arrival (“কেউ আপনাকে লিখছে…”)? Currently: no — arrival stays a surprise.
2. Coin pricing for envelopes vs. stamps — current values are placeholders from the legacy shop.
3. Adda moderation & reporting flow (needs policy before launch).
