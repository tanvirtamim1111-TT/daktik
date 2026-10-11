# Daktik — Modern premium UI/UX

> চিঠি পৌঁছায়, অনুভূতি থেকে যায়। · *Slow Messages. Real Emotion.*

A complete redesign of Daktik: the idea belongs to the age of letters; the interface belongs to 2026.

| Phase | Document |
|---|---|
| 01 | [Product UX architecture, IA, navigation, journeys, feature hierarchy](01-ux-architecture.md) |
| 02 | [Design system: colour, type, spacing, grid, components, icons, motion](02-design-system.md) |
| 03 | [Low‑fidelity wireframes](03-wireframes.md) |
| 04 | [UX structure review](04-ux-review.md) |
| 05 | [High‑fidelity UI (screenshots)](05-high-fidelity.md) |
| 06 | [Interaction prototype & motion spec](06-interaction-prototype.md) |
| 07 | [Android implementation structure](07-android-implementation.md) |
| 08 | [Website first: layouts, Firebase data, setup & deploy](08-website.md) |

**Try it:** `npm install && npm run dev`, then open `http://localhost:3000` (real accounts) or `http://localhost:3000/?demo=1` (demo data).

The new UI lives in [`src/next/`](../src/next) and is the default, running on the real Firebase data. The previous UI is still reachable with `?ui=legacy`.
