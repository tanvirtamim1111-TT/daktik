import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createSeed, DELIVERY_TICKETS } from "./mock";
import type { Envelope, AddaPost, AppNotification, CoinTransaction, DeliveryStage, DeliveryTicket, Letter, LetterFolder, Me, Person, Stamp, ThemePreference } from "./types";

/**
 * In-memory store backing the new UI.
 *
 * The UI only talks to the `DaktikStore` interface below. Swapping the
 * in-memory implementation for the Firestore one (Phase 07) does not
 * touch any screen.
 */
export interface DaktikStore {
  now: number;
  me: Me;
  letters: Letter[];
  stamps: Stamp[];
  envelopes: Envelope[];
  transactions: CoinTransaction[];
  adda: AddaPost[];
  notifications: AppNotification[];
  theme: ThemePreference;
  /** Letter whose arrival moment should be shown, if any. */
  arrival: Letter | null;

  lookup(postalId: string): Person | undefined;
  folder(f: LetterFolder): Letter[];
  markRead(id: string): void;
  react(id: string): void;
  archive(ids: string[]): void;
  remove(ids: string[]): void;
  restore(id: string): void;
  send(input: { to: Person; subject?: string; body: string; ticket: DeliveryTicket; stampId?: string }): Letter;
  saveDraft(input: { to?: Person; subject?: string; body: string }): void;
  collectStamp(id: string): boolean;
  buyEnvelope(id: string): boolean;
  addCoins(amount: number, reason: string): void;
  likePost(id: string): void;
  setTheme(t: ThemePreference): void;
  dismissArrival(): void;
  previewArrival(): void;
  markNotificationsRead(): void;
}

const Ctx = createContext<DaktikStore | null>(null);

export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
};

/**
 * The step a letter is currently on, derived from time — never stored.
 * "written" is complete the moment it is sent, so it is never the active step.
 */
export const deliveryStage = (l: Letter, now: number): DeliveryStage => {
  const span = Math.max(1, l.deliverAt - l.sentAt);
  const t = (now - l.sentAt) / span;
  if (now >= l.deliverAt) return "delivered";
  if (t < 0.22) return "at-post-office";
  return "on-the-way";
};

export const isArrived = (l: Letter, now: number) => now >= l.deliverAt;

const THEME_KEY = "daktik.theme";

const readTheme = (): ThemePreference => {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => createSeed(), []);
  const [now, setNow] = useState(Date.now());
  const [me, setMe] = useState(seed.me);
  const [letters, setLetters] = useState(seed.letters);
  const [stamps, setStamps] = useState(seed.stamps);
  const [envelopes, setEnvelopes] = useState(seed.envelopes);
  const [transactions, setTransactions] = useState(seed.transactions);
  const [adda, setAdda] = useState(seed.adda);
  const [notifications, setNotifications] = useState(seed.notifications);
  const [theme, setThemeState] = useState<ThemePreference>(readTheme);
  const [arrival, setArrival] = useState<Letter | null>(null);
  const announced = useRef(new Set<string>(seed.letters.filter((l) => isArrived(l, Date.now())).map((l) => l.id)));

  // A slow clock is enough: delivery is measured in hours.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Arrival detection: the first time an inbox letter crosses its deliverAt, celebrate it — once.
  useEffect(() => {
    if (arrival) return;
    const landed = letters.find((l) => l.folder === "inbox" && isArrived(l, now) && !announced.current.has(l.id));
    if (!landed) return;
    announced.current.add(landed.id);
    setArrival(landed);
    setNotifications((n) => [{ id: `n-${landed.id}`, title: "চিঠি এসেছে", body: `${landed.from.name} আপনাকে লিখেছে।`, at: landed.deliverAt, read: false, letterId: landed.id }, ...n]);
  }, [now, letters, arrival]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage unavailable — preference lasts for the session only */
    }
  }, [theme]);

  const patch = useCallback((ids: string[], fn: (l: Letter) => Letter) => {
    const set = new Set(ids);
    setLetters((ls) => ls.map((l) => (set.has(l.id) ? fn(l) : l)));
  }, []);

  const lookup = useCallback(
    (postalId: string) => Object.values(seed.people).find((p) => p.postalId === postalId) ?? (postalId === me.postalId ? me : undefined),
    [seed.people, me],
  );

  const spend = useCallback((amount: number, reason: string) => {
    setMe((m) => ({ ...m, coins: m.coins - amount }));
    setTransactions((t) => [{ id: `t-${Date.now()}`, amount: -amount, reason, at: Date.now() }, ...t]);
  }, []);

  const store: DaktikStore = {
    now,
    me,
    letters,
    stamps,
    envelopes,
    transactions,
    adda,
    notifications,
    theme,
    arrival,
    lookup,
    folder: (f) =>
      letters
        .filter((l) => l.folder === f && (f !== "inbox" || isArrived(l, now)))
        .sort((a, b) => (f === "inbox" ? b.deliverAt - a.deliverAt : b.sentAt - a.sentAt)),
    markRead: (id) => patch([id], (l) => ({ ...l, read: true })),
    react: (id) => patch([id], (l) => ({ ...l, reaction: l.reaction ? undefined : "heart" })),
    archive: (ids) => patch(ids, (l) => ({ ...l, folder: "archived" })),
    remove: (ids) => setLetters((ls) => ls.filter((l) => !ids.includes(l.id))),
    restore: (id) => patch([id], (l) => ({ ...l, folder: l.from.id === me.id ? "sent" : "inbox" })),
    send: ({ to, subject, body, ticket, stampId }) => {
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
      setLetters((ls) => [letter, ...ls.filter((l) => !(l.folder === "drafts" && l.to.id === to.id))]);
      spend(ticket.coins, `${ticket.label} টিকিট · ${to.name}কে চিঠি`);
      return letter;
    },
    saveDraft: ({ to, subject, body }) => {
      if (!body.trim()) return;
      const at = Date.now();
      const recipient: Person = to ?? { id: "unknown", name: "প্রাপক নেই", postalId: "—", hue: 0 };
      setLetters((ls) => [{ id: `d-${at}`, folder: "drafts", from: me, to: recipient, subject, body, sentAt: at, deliverAt: at, read: true }, ...ls]);
    },
    collectStamp: (id) => {
      const stamp = stamps.find((s) => s.id === id);
      if (!stamp || stamp.collected || me.coins < stamp.coins) return false;
      setStamps((ss) => ss.map((s) => (s.id === id ? { ...s, collected: true } : s)));
      spend(stamp.coins, `স্ট্যাম্প · ${stamp.name}`);
      return true;
    },
    buyEnvelope: (id) => {
      const env = envelopes.find((e) => e.id === id);
      if (!env || env.owned || me.coins < env.coins) return false;
      setEnvelopes((es) => es.map((e) => (e.id === id ? { ...e, owned: true } : e)));
      spend(env.coins, `খাম · ${env.name}`);
      return true;
    },
    addCoins: (amount, reason) => {
      setMe((m) => ({ ...m, coins: m.coins + amount }));
      setTransactions((t) => [{ id: `t-${Date.now()}`, amount, reason, at: Date.now() }, ...t]);
    },
    likePost: (id) => setAdda((ps) => ps.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p))),
    setTheme: setThemeState,
    dismissArrival: () => setArrival(null),
    previewArrival: () => setArrival(letters.find((l) => l.folder === "inbox") ?? null),
    markNotificationsRead: () => setNotifications((n) => n.map((x) => ({ ...x, read: true }))),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export const ticketById = (id?: string) => DELIVERY_TICKETS.find((t) => t.id === id);
