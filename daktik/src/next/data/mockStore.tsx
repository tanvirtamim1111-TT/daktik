import { useCallback, useMemo, useState, type ReactNode } from "react";
import { createSeed } from "./mock";
import { StoreCtx, sortFolder, useArrival, useClock, useThemePreference, type DaktikStore } from "./store";
import type { Letter, Person } from "./types";

const SIGNED_IN_KEY = "daktik.demo.signedIn";
const ANNOUNCED_KEY = "daktik.demo.announced";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * In-memory store with seed data. Used for design review (`?demo=1`):
 * everything works, nothing is saved, no account is needed.
 */
export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => {
    // Demo data is fresh on every load, so the arrival moment replays too.
    try {
      localStorage.removeItem(ANNOUNCED_KEY);
    } catch {
      /* ignore */
    }
    return createSeed();
  }, []);
  const now = useClock();
  const [signedIn, setSignedIn] = useState(() => {
    try {
      return !!localStorage.getItem(SIGNED_IN_KEY);
    } catch {
      return false;
    }
  });
  const [me, setMe] = useState(seed.me);
  const [letters, setLetters] = useState(seed.letters);
  const [stamps, setStamps] = useState(seed.stamps);
  const [envelopes, setEnvelopes] = useState(seed.envelopes);
  const [transactions, setTransactions] = useState(seed.transactions);
  const [adda, setAdda] = useState(seed.adda);
  const [notifications, setNotifications] = useState(seed.notifications);
  const [theme, setTheme] = useThemePreference();
  const arrivals = useArrival({ letters, now, ready: signedIn, storageKey: ANNOUNCED_KEY, backlog: false });

  const patch = useCallback((ids: string[], fn: (l: Letter) => Letter) => {
    const set = new Set(ids);
    setLetters((ls) => ls.map((l) => (set.has(l.id) ? fn(l) : l)));
  }, []);

  const spend = (amount: number, reason: string) => {
    setMe((m) => ({ ...m, coins: m.coins - amount }));
    setTransactions((t) => [{ id: `t-${Date.now()}`, amount: -amount, reason, at: Date.now() }, ...t]);
  };

  const signIn = async () => {
    await wait(600);
    try {
      localStorage.setItem(SIGNED_IN_KEY, "1");
    } catch {
      /* ignore */
    }
    setSignedIn(true);
  };

  const store: DaktikStore = {
    mode: "demo",
    status: signedIn ? "ready" : "signed-out",
    auth: {
      withProvider: signIn,
      withEmail: signIn,
      sendPhoneCode: async () => {
        await wait(600);
      },
      confirmPhoneCode: signIn,
      signOut: async () => {
        try {
          localStorage.removeItem(SIGNED_IN_KEY);
        } catch {
          /* ignore */
        }
        setSignedIn(false);
      },
    },
    now,
    me,
    letters,
    stamps,
    envelopes,
    transactions,
    adda,
    addaStatus: "ok",
    notifications,
    theme,
    arrival: arrivals.arrival,
    lookup: async (postalId) => {
      await wait(250);
      return Object.values(seed.people).find((p) => p.postalId === postalId) ?? (postalId === me.postalId ? me : null);
    },
    folder: (f) => sortFolder(letters, f, now),
    markRead: (id) => patch([id], (l) => ({ ...l, read: true })),
    toggleSaved: (id) => patch([id], (l) => ({ ...l, saved: !l.saved })),
    archive: (ids) => patch(ids, (l) => ({ ...l, folder: "archived" })),
    remove: (ids) => setLetters((ls) => ls.filter((l) => !ids.includes(l.id))),
    restore: (id) => patch([id], (l) => ({ ...l, folder: l.from.id === me.id ? "sent" : "inbox" })),
    send: async ({ to, subject, body, ticket, stampId }) => {
      await wait(900);
      const sentAt = Date.now();
      const letter: Letter = {
        id: `s-${sentAt}`,
        folder: "sent",
        from: me,
        to,
        subject: subject || undefined,
        body,
        sentAt,
        deliverAt: sentAt + ticket.hours * 3_600_000,
        ticketId: ticket.id,
        read: false,
        stampId,
      };
      setLetters((ls) => [letter, ...ls]);
      spend(ticket.coins, `${ticket.label} টিকিট · ${to.name}কে চিঠি`);
      return letter;
    },
    saveDraft: ({ id, to, subject, body }) => {
      if (!body.trim()) return;
      const at = Date.now();
      const recipient: Person = to ?? { id: "unknown", name: "প্রাপক নেই", postalId: "—", hue: 0 };
      const draft: Letter = { id: id ?? `d-${at}`, folder: "drafts", from: me, to: recipient, subject, body, sentAt: at, deliverAt: at, read: true };
      setLetters((ls) => [draft, ...ls.filter((l) => l.id !== draft.id)]);
    },
    deleteDraft: (id) => setLetters((ls) => ls.filter((l) => l.id !== id)),
    collectStamp: async (id) => {
      const stamp = stamps.find((s) => s.id === id);
      if (!stamp || stamp.collected || me.coins < stamp.coins) return false;
      await wait(400);
      setStamps((ss) => ss.map((s) => (s.id === id ? { ...s, collected: true } : s)));
      spend(stamp.coins, `স্ট্যাম্প · ${stamp.name}`);
      return true;
    },
    buyEnvelope: async (id) => {
      const env = envelopes.find((e) => e.id === id);
      if (!env || env.owned || me.coins < env.coins) return false;
      await wait(400);
      setEnvelopes((es) => es.map((e) => (e.id === id ? { ...e, owned: true } : e)));
      spend(env.coins, `খাম · ${env.name}`);
      return true;
    },
    requestCoins: async ({ coins }) => {
      await wait(1100);
      setMe((m) => ({ ...m, coins: m.coins + coins }));
      setTransactions((t) => [{ id: `t-${Date.now()}`, amount: coins, reason: `${coins} কয়েন প্যাক`, at: Date.now() }, ...t]);
    },
    likePost: (id) => setAdda((ps) => ps.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p))),
    createPost: async ({ kind, text }) => {
      await wait(500);
      setAdda((ps) => [{ id: `p-${Date.now()}`, author: me, kind, at: Date.now(), text, likes: 0, liked: false, comments: 0, mine: true }, ...ps]);
    },
    updateProfile: async ({ name }) => {
      await wait(400);
      setMe((m) => ({ ...m, name }));
    },
    reportProblem: async () => {
      await wait(600);
    },
    setTheme,
    dismissArrival: arrivals.dismiss,
    previewArrival: arrivals.preview,
    markNotificationsRead: () => setNotifications((n) => n.map((x) => ({ ...x, read: true }))),
  };

  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}
