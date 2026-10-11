import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useToast } from "../components/primitives";
import { DELIVERY_TICKETS, ENVELOPE_CATALOG, STAMP_CATALOG } from "./catalog";
import { StoreCtx, hueFor, sortFolder, useArrival, useClock, useLocalDrafts, useThemePreference, type DaktikStore } from "./store";
import type { AddaPost, AddaPostKind, AppNotification, CoinTransaction, Envelope, Letter, Me, Person, Stamp } from "./types";

/**
 * Firestore-backed store.
 *
 * Reads and writes the same collections as the previous app, within the
 * rules in `firestore.rules`:
 *   users/{uid}, users/{uid}/inventory, letters, notifications, requests,
 *   shop_items (read), adda_posts (new — see rules).
 * Letters written here stay readable by the legacy UI and vice versa.
 */

const HOUR = 3_600_000;
const RESERVED_IDS = ["111-1111", "222-2222", "333-3333", "444-4444", "555-5555", "666-6666", "777-7777", "888-8888", "999-9999", "123-4567", "987-6543", "000-0000"];
const PAGE_BREAK = "\n\n---PAGE_BREAK---\n\n";

const EMPTY_ME: Me = { id: "", name: "", postalId: "", hue: 0, coins: 0, joinedAt: Date.now() };

const toMillis = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  if (v && typeof v === "object" && "toMillis" in v && typeof (v as { toMillis: unknown }).toMillis === "function") return (v as { toMillis: () => number }).toMillis();
  if (v && typeof v === "object" && "seconds" in v) return (v as { seconds: number }).seconds * 1000;
  return 0;
};

/** Friendly Bengali messages for the auth errors people actually hit. */
const authMessage = (e: unknown) => {
  const code = (e as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/email-already-in-use": "এই ইমেইলে আগেই অ্যাকাউন্ট আছে — লগইন করুন।",
    "auth/invalid-credential": "ইমেইল বা পাসওয়ার্ড মিলছে না।",
    "auth/wrong-password": "পাসওয়ার্ড মিলছে না।",
    "auth/user-not-found": "এই ইমেইলে কোনো অ্যাকাউন্ট নেই।",
    "auth/invalid-email": "ইমেইলটা ঠিক নেই।",
    "auth/weak-password": "পাসওয়ার্ড অন্তত ৮ অক্ষরের দিন।",
    "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
    "auth/network-request-failed": "ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
    "auth/popup-closed-by-user": "লগইন উইন্ডো বন্ধ হয়ে গেছে।",
    "auth/cancelled-popup-request": "লগইন উইন্ডো বন্ধ হয়ে গেছে।",
    "auth/operation-not-allowed": "এই লগইন পদ্ধতিটা এখনো চালু করা হয়নি।",
    "auth/unauthorized-domain": "এই ওয়েবসাইটের ঠিকানা Firebase-এ অনুমোদিত নয়।",
    "auth/invalid-phone-number": "ফোন নম্বরটা ঠিক নেই।",
    "auth/invalid-verification-code": "কোডটা মিলছে না।",
    "auth/code-expired": "কোডের মেয়াদ শেষ — আবার পাঠান।",
  };
  return new Error(map[code] ?? "কিছু একটা ঠিকমতো হয়নি। আবার চেষ্টা করুন।");
};

const isNative = () => !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();

/** Legacy letters may be split into greeting / pages / closing. */
const letterBody = (d: DocumentData) => {
  const pages: string[] = Array.isArray(d.bodyPages) && d.bodyPages.length ? d.bodyPages : String(d.content ?? "").split(PAGE_BREAK);
  return [d.greeting, ...pages, d.closing].filter((x) => typeof x === "string" && x.trim()).join("\n\n");
};

const generatePostalId = async () => {
  for (let attempt = 0; attempt < 12; attempt++) {
    const id = `${Math.floor(100 + Math.random() * 900)}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
    if (RESERVED_IDS.includes(id)) continue;
    const taken = await getDocs(query(collection(db, "users"), where("postcode", "==", id), limit(1)));
    if (taken.empty) return id;
  }
  throw new Error("পোস্টাল আইডি তৈরি করা যায়নি। আবার চেষ্টা করুন।");
};

const referralCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export function FirebaseStoreProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const now = useClock();
  const [theme, setTheme] = useThemePreference();

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profile, setProfile] = useState<DocumentData | null>(null);
  const [incoming, setIncoming] = useState<{ id: string; d: DocumentData }[]>([]);
  const [outgoing, setOutgoing] = useState<{ id: string; d: DocumentData }[]>([]);
  const [inventory, setInventory] = useState<DocumentData[]>([]);
  const [shopStamps, setShopStamps] = useState<DocumentData[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [requests, setRequests] = useState<{ id: string; d: DocumentData }[]>([]);
  const [addaDocs, setAddaDocs] = useState<{ id: string; d: DocumentData }[]>([]);
  const [addaStatus, setAddaStatus] = useState<DaktikStore["addaStatus"]>("loading");
  const [people, setPeople] = useState<Record<string, Person>>({});
  const pendingName = useRef<string | null>(null);
  const phoneConfirm = useRef<ConfirmationResult | null>(null);
  const recaptcha = useRef<RecaptchaVerifier | null>(null);

  const fail = (e: unknown) => {
    console.error(e);
    const code = (e as { code?: string })?.code;
    toast({ text: code === "permission-denied" ? "এই কাজের অনুমতি নেই।" : "সংযোগে সমস্যা — আবার চেষ্টা করুন।", tone: "error" });
  };

  /* ---------------- auth + profile ---------------- */

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let unsub = () => {};
    let cancelled = false;
    (async () => {
      const ref = doc(db, "users", user.uid);
      try {
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            uid: user.uid,
            email: user.email ?? "",
            displayName: pendingName.current || user.displayName || "নতুন বন্ধু",
            photoURL: user.photoURL ?? "",
            postcode: await generatePostalId(),
            village: "",
            thana: "",
            district: "",
            postOffice: "",
            role: "user",
            coins: 50,
            referralCode: referralCode(),
            usedReferralCode: false,
            createdAt: new Date().toISOString(),
          });
        } else if (pendingName.current && snap.data().displayName !== pendingName.current) {
          await updateDoc(ref, { displayName: pendingName.current });
        }
        pendingName.current = null;
      } catch (e) {
        fail(e);
      }
      if (cancelled) return;
      // If the profile can't be read, fall back to what auth knows so the app still opens.
      const fallback = { displayName: user.displayName ?? "", postcode: "", coins: 0, photoURL: user.photoURL ?? "" };
      unsub = onSnapshot(
        ref,
        (s) => setProfile(s.exists() ? s.data() : fallback),
        (e) => {
          fail(e);
          setProfile(fallback);
        },
      );
    })();
    return () => {
      cancelled = true;
      unsub();
    };
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------- live subscriptions ---------------- */

  useEffect(() => {
    if (!user) {
      setIncoming([]);
      setOutgoing([]);
      setInventory([]);
      setNotifications([]);
      setRequests([]);
      return;
    }
    const uid = user.uid;
    const subs = [
      onSnapshot(query(collection(db, "letters"), where("receiverUid", "==", uid)), (s) => setIncoming(s.docs.map((x) => ({ id: x.id, d: x.data() }))), fail),
      onSnapshot(query(collection(db, "letters"), where("senderUid", "==", uid)), (s) => setOutgoing(s.docs.map((x) => ({ id: x.id, d: x.data() }))), fail),
      onSnapshot(collection(db, "users", uid, "inventory"), (s) => setInventory(s.docs.map((x) => ({ ...x.data(), id: x.id }))), fail),
      onSnapshot(
        query(collection(db, "notifications"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(40)),
        (s) =>
          setNotifications(
            s.docs.map((x) => {
              const d = x.data();
              return { id: x.id, title: d.title ?? "", body: d.body ?? "", at: toMillis(d.createdAt) || Date.now(), read: !!d.isRead, letterId: d.letterId };
            }),
          ),
        (e) => console.warn("notifications unavailable", e),
      ),
      onSnapshot(
        query(collection(db, "requests"), where("userId", "==", uid)),
        (s) => setRequests(s.docs.map((x) => ({ id: x.id, d: x.data() }))),
        (e) => console.warn("requests unavailable", e),
      ),
      onSnapshot(
        query(collection(db, "adda_posts"), orderBy("createdAt", "desc"), limit(40)),
        (s) => {
          setAddaDocs(s.docs.map((x) => ({ id: x.id, d: x.data() })));
          setAddaStatus("ok");
        },
        () => setAddaStatus("unavailable"),
      ),
    ];
    getDocs(query(collection(db, "shop_items"), where("category", "==", "stamp")))
      .then((s) => setShopStamps(s.docs.map((x) => ({ ...x.data(), id: x.id }))))
      .catch(() => setShopStamps([]));
    return () => subs.forEach((u) => u());
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------- mapping ---------------- */

  const me: Me = useMemo(() => {
    if (!user || !profile) return EMPTY_ME;
    return {
      id: user.uid,
      name: profile.displayName || user.displayName || "নতুন বন্ধু",
      postalId: profile.postcode ?? "",
      photo: profile.photoURL || undefined,
      hue: hueFor(user.uid),
      email: profile.email || user.email || undefined,
      coins: typeof profile.coins === "number" ? profile.coins : 0,
      joinedAt: toMillis(profile.createdAt) || Date.now(),
    };
  }, [user, profile]);

  // Fill in names/photos for people we exchange letters with.
  useEffect(() => {
    const unknown = new Set<string>();
    for (const { d } of incoming) if (d.senderUid && !people[d.senderUid]) unknown.add(d.senderUid);
    for (const { d } of outgoing) if (d.receiverUid && !people[d.receiverUid]) unknown.add(d.receiverUid);
    unknown.delete(me.id);
    if (!unknown.size) return;
    Promise.all(
      [...unknown].map(async (uid) => {
        try {
          const s = await getDoc(doc(db, "users", uid));
          const d = s.data();
          return d ? ({ id: uid, name: d.displayName || d.postcode, postalId: d.postcode ?? "", photo: d.photoURL || undefined, hue: hueFor(uid) } as Person) : null;
        } catch {
          return null;
        }
      }),
    ).then((list) =>
      setPeople((p) => {
        const next = { ...p };
        list.forEach((x) => x && (next[x.id] = x));
        return next;
      }),
    );
  }, [incoming, outgoing, me.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const person = (uid: string | null | undefined, name?: string, postalId?: string): Person =>
    (uid && uid === me.id ? me : uid ? people[uid] : undefined) ?? { id: uid ?? `pc-${postalId}`, name: name || postalId || "অজানা", postalId: postalId ?? "", hue: hueFor(uid ?? postalId ?? "x") };

  const letters: Letter[] = useMemo(() => {
    const map = new Map<string, Letter>();
    const toLetter = (id: string, d: DocumentData, asReceiver: boolean): Letter | null => {
      if (d.isBurnt || d.status === "writing") return null;
      const sentAt = toMillis(d.timestamp);
      const delivered = d.deliveryStatus === "delivered";
      const deliverAt = delivered ? Math.min(sentAt + (d.deliveryDelay ?? 0), now) : sentAt + (d.deliveryDelay ?? 0);
      return {
        id,
        folder: d.isHidden ? "archived" : asReceiver ? "inbox" : "sent",
        from: person(d.senderUid, d.senderName, d.senderPostcode),
        to: person(d.receiverUid, d.receiverName, d.receiverPostcode),
        subject: d.subject || undefined,
        body: letterBody(d),
        sentAt,
        deliverAt,
        ticketId: d.ticketId,
        read: !!d.isRead,
        saved: !!d.isSaved,
        stampId: d.stampId ?? undefined,
      };
    };
    for (const { id, d } of outgoing) {
      const l = toLetter(id, d, false);
      if (l) map.set(id, l);
    }
    for (const { id, d } of incoming) {
      const l = toLetter(id, d, true); // a letter to yourself counts as received
      if (l) map.set(id, l);
    }
    return [...map.values()];
    // `now` only matters for legacy "delivered" letters; recomputing per minute is enough.
  }, [incoming, outgoing, people, me, Math.floor(now / 60_000)]); // eslint-disable-line react-hooks/exhaustive-deps

  const drafts = useLocalDrafts(`daktik.drafts.${me.id}`, me);
  const arrivals = useArrival({ letters, now, ready: !!profile, storageKey: `daktik.announced.${me.id}`, backlog: true });

  const owned = useMemo(() => new Set(inventory.map((i) => i.id as string)), [inventory]);

  const stamps: Stamp[] = useMemo(() => {
    const list: Stamp[] = STAMP_CATALOG.map((s) => ({ ...s, collected: owned.has(s.id) }));
    const known = new Set(list.map((s) => s.id));
    const extra = [...shopStamps, ...inventory.filter((i) => i.category === "stamp")];
    for (const it of extra) {
      if (known.has(it.id) || (!it.image && !owned.has(it.id))) continue;
      known.add(it.id);
      list.push({
        id: it.id,
        name: it.name ?? "স্ট্যাম্প",
        description: it.description ?? "Daktik সংগ্রহের স্ট্যাম্প।",
        category: "special",
        year: new Date(toMillis(it.purchasedAt) || Date.now()).getFullYear(),
        coins: typeof it.price === "number" ? it.price : 0,
        palette: ["#173f35", "#c8a24a"],
        motif: "boat",
        image: it.image,
        collected: owned.has(it.id),
      });
    }
    return list;
  }, [shopStamps, inventory, owned]);

  const envelopes: Envelope[] = useMemo(() => {
    const list = ENVELOPE_CATALOG.map((e) => ({ ...e, owned: e.coins === 0 || owned.has(e.id) }));
    const known = new Set(list.map((e) => e.id));
    for (const it of inventory) if (it.category === "envelope" && !known.has(it.id)) list.push({ id: it.id, name: it.name ?? "খাম", coins: it.price ?? 0, tone: "#e9e4d6", owned: true });
    return list;
  }, [inventory, owned]);

  const transactions: CoinTransaction[] = useMemo(() => {
    const tx: CoinTransaction[] = [];
    for (const { id, d } of outgoing) {
      if (typeof d.coinsSpent === "number" && d.coinsSpent > 0) {
        const t = DELIVERY_TICKETS.find((x) => x.id === d.ticketId);
        tx.push({
          id: `l-${id}`,
          amount: -d.coinsSpent,
          reason: `${t?.label ?? "ডেলিভারি"} টিকিট · ${person(d.receiverUid, d.receiverName, d.receiverPostcode).name}কে চিঠি`,
          at: toMillis(d.timestamp),
        });
      }
    }
    for (const it of inventory)
      if (typeof it.price === "number" && it.price > 0 && it.purchasedAt)
        tx.push({ id: `i-${it.id}`, amount: -it.price, reason: `${it.category === "envelope" ? "খাম" : "স্ট্যাম্প"} · ${it.name}`, at: toMillis(it.purchasedAt) });
    for (const { id, d } of requests) {
      if (d.type !== "coin_purchase" || typeof d.amount !== "number") continue;
      if (d.status === "rejected") continue;
      tx.push({
        id: `r-${id}`,
        amount: d.amount,
        reason: d.status === "approved" ? `${d.amount} কয়েন প্যাক` : `${d.amount} কয়েন প্যাক · অনুমোদনের অপেক্ষায়`,
        at: toMillis(d.createdAt) || Date.now(),
        pending: d.status !== "approved",
      });
    }
    if (me.id) tx.push({ id: "welcome", amount: 50, reason: "স্বাগতম উপহার", at: me.joinedAt });
    return tx.sort((a, b) => b.at - a.at);
  }, [outgoing, inventory, requests, me, people]); // eslint-disable-line react-hooks/exhaustive-deps

  const adda: AddaPost[] = useMemo(
    () =>
      addaDocs.map(({ id, d }) => {
        const likedBy: string[] = Array.isArray(d.likedBy) ? d.likedBy : [];
        return {
          id,
          author: d.authorUid === me.id ? me : { id: d.authorUid, name: d.authorName ?? "অজানা", postalId: d.authorPostcode ?? "", photo: d.authorPhoto || undefined, hue: hueFor(d.authorUid ?? id) },
          kind: (["story", "memory", "question", "photo", "topic"].includes(d.kind) ? d.kind : "story") as AddaPostKind,
          at: toMillis(d.createdAt),
          text: d.text ?? "",
          likes: likedBy.length,
          liked: likedBy.includes(me.id),
          comments: typeof d.commentCount === "number" ? d.commentCount : 0,
          mine: d.authorUid === me.id,
        };
      }),
    [addaDocs, me],
  );

  /* ---------------- actions ---------------- */

  const letterRef = (id: string) => doc(db, "letters", id);
  const raw = (id: string) => incoming.find((x) => x.id === id)?.d ?? outgoing.find((x) => x.id === id)?.d;

  const purchase = async (item: { id: string; name: string; category: "stamp" | "envelope"; price: number; image?: string }) => {
    if (!user || me.coins < item.price || owned.has(item.id)) return false;
    const batch = writeBatch(db);
    batch.set(doc(db, "users", user.uid, "inventory", item.id), {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: 1,
      price: item.price,
      ...(item.image ? { image: item.image } : {}),
      purchasedAt: serverTimestamp(),
    });
    batch.update(doc(db, "users", user.uid), { coins: increment(-item.price) });
    try {
      await batch.commit();
      return true;
    } catch (e) {
      fail(e);
      return false;
    }
  };

  const store: DaktikStore = {
    mode: "live",
    status: user === undefined || (user && !profile) ? "loading" : user ? "ready" : "signed-out",
    auth: {
      withProvider: async (p) => {
        const provider = p === "google" ? new GoogleAuthProvider() : new OAuthProvider("apple.com");
        if (p === "google") (provider as GoogleAuthProvider).setCustomParameters({ prompt: "select_account" });
        try {
          if (isNative()) await signInWithRedirect(auth, provider);
          else await signInWithPopup(auth, provider);
        } catch (e) {
          if ((e as { code?: string }).code === "auth/popup-blocked") return signInWithRedirect(auth, provider);
          throw authMessage(e);
        }
      },
      withEmail: async ({ mode, email, password, name }) => {
        try {
          if (mode === "register") {
            pendingName.current = name?.trim() || null;
            const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            if (name?.trim()) await fbUpdateProfile(cred.user, { displayName: name.trim() });
          } else {
            await signInWithEmailAndPassword(auth, email.trim(), password);
          }
        } catch (e) {
          pendingName.current = null;
          throw authMessage(e);
        }
      },
      sendPhoneCode: async (phone, el) => {
        try {
          recaptcha.current?.clear();
          recaptcha.current = new RecaptchaVerifier(auth, el, { size: "invisible" });
          const digits = phone.replace(/[^\d+]/g, "");
          const e164 = digits.startsWith("+") ? digits : digits.startsWith("880") ? `+${digits}` : `+88${digits.replace(/^0?/, "0")}`;
          phoneConfirm.current = await signInWithPhoneNumber(auth, e164, recaptcha.current);
        } catch (e) {
          throw authMessage(e);
        }
      },
      confirmPhoneCode: async (code) => {
        if (!phoneConfirm.current) throw new Error("আগে কোড পাঠান।");
        try {
          await phoneConfirm.current.confirm(code.trim());
        } catch (e) {
          throw authMessage(e);
        }
      },
      signOut: () => fbSignOut(auth),
    },
    now,
    me,
    letters: [...letters, ...drafts.drafts],
    stamps,
    envelopes,
    transactions,
    adda,
    addaStatus,
    notifications,
    theme,
    arrival: arrivals.arrival,

    lookup: async (postalId) => {
      const s = await getDocs(query(collection(db, "users"), where("postcode", "==", postalId), limit(1)));
      const hit = s.docs[0];
      if (!hit) return null;
      const d = hit.data();
      const p: Person = { id: hit.id, name: d.displayName || postalId, postalId, photo: d.photoURL || undefined, hue: hueFor(hit.id) };
      setPeople((x) => ({ ...x, [p.id]: p }));
      return p;
    },
    folder: (f) => sortFolder([...letters, ...drafts.drafts], f, now),
    markRead: (id) => {
      const d = raw(id);
      if (!d || d.receiverUid !== me.id || d.isRead) return;
      updateDoc(letterRef(id), { isRead: true, status: "delivered", deliveryStatus: "delivered" }).catch(fail);
    },
    toggleSaved: (id) => {
      const d = raw(id);
      if (d) updateDoc(letterRef(id), { isSaved: !d.isSaved }).catch(fail);
    },
    archive: (ids) => ids.forEach((id) => updateDoc(letterRef(id), { isHidden: true }).catch(fail)),
    restore: (id) => updateDoc(letterRef(id), { isHidden: false }).catch(fail),
    // Rules only allow hard deletes for burnt letters, so “delete” burns it for both sides' views of this user.
    remove: (ids) =>
      ids.forEach((id) => {
        if (id.startsWith("d-")) drafts.remove(id);
        else updateDoc(letterRef(id), { isBurnt: true, burntAt: Date.now() }).catch(fail);
      }),

    send: async ({ to, subject, body, ticket, stampId }) => {
      if (!user) throw new Error("লগইন করা নেই");
      if (me.coins < ticket.coins) throw new Error("পর্যাপ্ত কয়েন নেই");
      const ref = doc(collection(db, "letters"));
      const sentAt = Date.now();
      const batch = writeBatch(db);
      batch.set(ref, {
        senderUid: user.uid,
        senderName: me.name,
        senderPostcode: me.postalId,
        receiverUid: to.id,
        receiverPostcode: to.postalId,
        receiverName: to.name,
        subject: subject?.trim() || null,
        content: body,
        status: "sent",
        deliveryStatus: "in-transit",
        timestamp: sentAt,
        dispatchTime: sentAt,
        deliveryDelay: ticket.hours * HOUR,
        ticketId: ticket.id,
        coinsSpent: ticket.coins,
        isRead: false,
        // Defaults so the legacy reader can still render letters written here.
        postmanId: "pm1",
        paperType: "white",
        inkColor: "#151716",
        fontFamily: "sans",
        envelopeStyle: "classic",
        scent: null,
        sealId: null,
        stampId: stampId ?? null,
        client: "daktik-web",
      });
      batch.update(doc(db, "users", user.uid), { coins: increment(-ticket.coins) });
      try {
        await batch.commit();
      } catch (e) {
        fail(e);
        throw e;
      }
      return { id: ref.id, folder: "sent", from: me, to, subject, body, sentAt, deliverAt: sentAt + ticket.hours * HOUR, ticketId: ticket.id, read: false, stampId };
    },
    saveDraft: drafts.save,
    deleteDraft: drafts.remove,
    collectStamp: async (id) => {
      const s = stamps.find((x) => x.id === id);
      return s ? purchase({ id: s.id, name: s.name, category: "stamp", price: s.coins, image: s.image }) : false;
    },
    buyEnvelope: async (id) => {
      const e = envelopes.find((x) => x.id === id);
      return e ? purchase({ id: e.id, name: e.name, category: "envelope", price: e.coins }) : false;
    },
    requestCoins: async ({ coins, price }) => {
      if (!user) return;
      await addDoc(collection(db, "requests"), {
        userId: user.uid,
        userEmail: me.email ?? "",
        type: "coin_purchase",
        amount: coins,
        details: `${coins} কয়েন · ${price}`,
        status: "pending",
        createdAt: serverTimestamp(),
      });
    },
    likePost: (id) => {
      const post = adda.find((p) => p.id === id);
      if (!post || !user) return;
      updateDoc(doc(db, "adda_posts", id), { likedBy: post.liked ? arrayRemove(user.uid) : arrayUnion(user.uid) }).catch(fail);
    },
    createPost: async ({ kind, text }) => {
      if (!user) return;
      await addDoc(collection(db, "adda_posts"), {
        authorUid: user.uid,
        authorName: me.name,
        authorPostcode: me.postalId,
        authorPhoto: me.photo ?? "",
        kind,
        text: text.trim(),
        likedBy: [],
        commentCount: 0,
        createdAt: Date.now(),
      });
    },
    updateProfile: async ({ name }) => {
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid), { displayName: name.trim() });
      await fbUpdateProfile(user, { displayName: name.trim() }).catch(() => {});
    },
    reportProblem: async (text) => {
      if (!user) return;
      await addDoc(collection(db, "requests"), { userId: user.uid, userEmail: me.email ?? "", type: "support_problem", details: text.slice(0, 4900), status: "pending", createdAt: serverTimestamp() });
    },
    setTheme,
    dismissArrival: arrivals.dismiss,
    previewArrival: arrivals.preview,
    markNotificationsRead: () => notifications.filter((n) => !n.read).forEach((n) => updateDoc(doc(db, "notifications", n.id), { isRead: true }).catch(() => {})),
  };

  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}
