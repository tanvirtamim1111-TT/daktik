import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { DELIVERY_TICKETS } from "./catalog";
import type { AddaPost, AddaPostKind, AppNotification, CoinTransaction, DeliveryStage, DeliveryTicket, Envelope, Letter, LetterFolder, Me, Person, Stamp, ThemePreference } from "./types";

/**
 * The contract between screens and data.
 *
 * Two implementations exist:
 * - `FirebaseStoreProvider` (firebaseStore.tsx) — real accounts and letters.
 * - `DemoStoreProvider` (mockStore.tsx) — in-memory seed data for design
 *   review and screenshots (`?demo=1`).
 * Screens never import either directly.
 */

export type AuthProviderId = "google" | "apple";

export interface AuthApi {
  withProvider(p: AuthProviderId): Promise<void>;
  withEmail(input: { mode: "login" | "register"; email: string; password: string; name?: string }): Promise<void>;
  /** Sends an OTP. `recaptcha` is an empty element the invisible reCAPTCHA can attach to. */
  sendPhoneCode(phone: string, recaptcha: HTMLElement): Promise<void>;
  confirmPhoneCode(code: string): Promise<void>;
  signOut(): Promise<void>;
}

export interface DaktikStore {
  mode: "demo" | "live";
  status: "loading" | "signed-out" | "ready";
  auth: AuthApi;

  now: number;
  me: Me;
  letters: Letter[];
  stamps: Stamp[];
  envelopes: Envelope[];
  transactions: CoinTransaction[];
  adda: AddaPost[];
  /** "unavailable" when the community feed cannot be read (e.g. rules not deployed). */
  addaStatus: "loading" | "ok" | "unavailable";
  notifications: AppNotification[];
  theme: ThemePreference;
  /** Letter whose arrival moment should be shown, if any. */
  arrival: Letter | null;

  lookup(postalId: string): Promise<Person | null>;
  folder(f: LetterFolder): Letter[];
  markRead(id: string): void;
  toggleSaved(id: string): void;
  archive(ids: string[]): void;
  remove(ids: string[]): void;
  restore(id: string): void;
  send(input: { to: Person; subject?: string; body: string; ticket: DeliveryTicket; stampId?: string }): Promise<Letter>;
  saveDraft(input: { id?: string; to?: Person; subject?: string; body: string }): void;
  deleteDraft(id: string): void;
  collectStamp(id: string): Promise<boolean>;
  buyEnvelope(id: string): Promise<boolean>;
  /** Demo: adds coins. Live: files a purchase request for an admin to approve. */
  requestCoins(pack: { coins: number; price: string }): Promise<void>;
  likePost(id: string): void;
  createPost(input: { kind: AddaPostKind; text: string }): Promise<void>;
  updateProfile(input: { name: string }): Promise<void>;
  reportProblem(text: string): Promise<void>;
  setTheme(t: ThemePreference): void;
  dismissArrival(): void;
  previewArrival(): void;
  markNotificationsRead(): void;
}

export const StoreCtx = createContext<DaktikStore | null>(null);

export const useStore = () => {
  const s = useContext(StoreCtx);
  if (!s) throw new Error("useStore must be used inside a store provider");
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

export const ticketById = (id?: string) => DELIVERY_TICKETS.find((t) => t.id === id);

export const sortFolder = (letters: Letter[], f: LetterFolder, now: number) =>
  letters.filter((l) => l.folder === f && (f !== "inbox" || isArrived(l, now))).sort((a, b) => (f === "inbox" || f === "archived" ? b.deliverAt - a.deliverAt : b.sentAt - a.sentAt));

/** Stable hue from any id, so people without photos are still recognisable. */
export const hueFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
};

/* ------------------------------------------------------------------ */
/* Shared hooks                                                        */
/* ------------------------------------------------------------------ */

/** A slow clock is enough: delivery is measured in hours. */
export function useClock() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const THEME_KEY = "daktik.theme";

export function useThemePreference() {
  const [theme, setTheme] = useState<ThemePreference>(() => {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return v === "light" || v === "dark" ? v : "system";
    } catch {
      return "system";
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* preference lasts for the session only */
    }
  }, [theme]);
  return [theme, setTheme] as const;
}

/**
 * Arrival detection. The first time an unread inbox letter crosses its
 * `deliverAt`, it is announced — once per device.
 *
 * `backlog`: on first load, also announce the newest unread letter that
 * arrived while the app was closed (live mode). Older ones simply wait,
 * unread, in the inbox.
 */
export function useArrival({ letters, now, ready, storageKey, backlog }: { letters: Letter[]; now: number; ready: boolean; storageKey: string; backlog: boolean }) {
  const [arrival, setArrival] = useState<Letter | null>(null);
  const announced = useRef<{ key: string; ids: Set<string> } | null>(null);

  useEffect(() => {
    if (!ready) return;
    const persist = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify([...announced.current!.ids].slice(-300)));
      } catch {
        /* ignore */
      }
    };
    const landed = letters.filter((l) => l.folder === "inbox" && isArrived(l, now));
    if (announced.current?.key !== storageKey) {
      let saved: string[] = [];
      try {
        saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      } catch {
        /* ignore */
      }
      const ids = new Set(saved);
      announced.current = { key: storageKey, ids };
      const fresh = landed.filter((l) => !l.read && !ids.has(l.id)).sort((a, b) => b.deliverAt - a.deliverAt);
      landed.forEach((l) => ids.add(l.id));
      persist();
      if (backlog && fresh[0]) setArrival(fresh[0]);
      return;
    }
    if (arrival) return;
    const next = landed.find((l) => !l.read && !announced.current!.ids.has(l.id));
    if (!next) return;
    announced.current.ids.add(next.id);
    persist();
    setArrival(next);
  }, [letters, now, ready, arrival, storageKey, backlog]);

  return {
    arrival,
    dismiss: useCallback(() => setArrival(null), []),
    preview: () => setArrival(letters.find((l) => l.folder === "inbox" && isArrived(l, now)) ?? null),
  };
}

type StoredDraft = { id: string; to?: Person; subject?: string; body: string; at: number };

const readDrafts = (key: string): StoredDraft[] => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
};

/** Drafts live on the device — they are private until sent. */
export function useLocalDrafts(storageKey: string, me: Me) {
  const [state, setState] = useState(() => ({ key: storageKey, drafts: readDrafts(storageKey) }));
  const drafts = state.key === storageKey ? state.drafts : readDrafts(storageKey);
  const write = (next: StoredDraft[]) => {
    setState({ key: storageKey, drafts: next });
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  const asLetters: Letter[] = drafts.map((d) => ({
    id: d.id,
    folder: "drafts",
    from: me,
    to: d.to ?? { id: "unknown", name: "প্রাপক নেই", postalId: "—", hue: 0 },
    subject: d.subject,
    body: d.body,
    sentAt: d.at,
    deliverAt: d.at,
    read: true,
  }));
  return {
    drafts: asLetters,
    save: ({ id, to, subject, body }: { id?: string; to?: Person; subject?: string; body: string }) => {
      if (!body.trim()) return;
      const entry = { id: id ?? `d-${Date.now()}`, to, subject, body, at: Date.now() };
      write([entry, ...drafts.filter((d) => d.id !== entry.id)]);
    },
    remove: (id: string) => write(drafts.filter((d) => d.id !== id)),
  };
}
