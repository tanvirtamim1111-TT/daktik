import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./theme/daktik.css";
import { BottomNav } from "./components/BottomNav";
import { ToastProvider } from "./components/primitives";
import { Sidebar } from "./components/Sidebar";
import { FirebaseStoreProvider } from "./data/firebaseStore";
import { DemoStoreProvider } from "./data/mockStore";
import { useStore } from "./data/store";
import { useWide } from "./lib/useWide";
import { NavCtx, type Nav, type Route, type Tab } from "./nav";
import { AddaScreen } from "./screens/Adda";
import { ArrivalOverlay } from "./screens/Arrival";
import { CoinsScreen } from "./screens/Coins";
import { ComposeScreen } from "./screens/Compose";
import { DeliveryScreen } from "./screens/Delivery";
import { HomeScreen } from "./screens/Home";
import { LettersScreen } from "./screens/Letters";
import { AuthScreen, BrandPanel, OnboardingScreen, Splash } from "./screens/Onboarding";
import { EnvelopesScreen, PostOfficeScreen, TicketsScreen } from "./screens/PostOffice";
import { ArchiveScreen, IdentityScreen, NotificationsScreen, ProfileScreen, SettingsScreen } from "./screens/Profile";
import { ReaderScreen } from "./screens/Reader";
import { StampsScreen } from "./screens/Stamps";
import { SystemGallery } from "./screens/SystemGallery";

const ONBOARDED_KEY = "daktik.onboarded";

/** `?demo=1` runs on seed data (remembered); `?demo=0` returns to real accounts. */
const isDemo = () => {
  const p = new URLSearchParams(window.location.search).get("demo");
  try {
    if (p === "1") localStorage.setItem("daktik.demo", "1");
    if (p === "0") localStorage.removeItem("daktik.demo");
    return localStorage.getItem("daktik.demo") === "1";
  } catch {
    return p === "1";
  }
};

export default function NextApp() {
  const demo = useMemo(isDemo, []);
  const Provider = demo ? DemoStoreProvider : FirebaseStoreProvider;
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <Provider>
          <Shell />
        </Provider>
      </ToastProvider>
    </MotionConfig>
  );
}

function Shell() {
  const store = useStore();
  const wide = useWide();
  const [onboarded, setOnboarded] = useState(() => {
    try {
      return !!localStorage.getItem(ONBOARDED_KEY);
    } catch {
      return false;
    }
  });
  const [tab, setTabState] = useState<Tab>("home");
  const [stack, setStack] = useState<Route[]>([]);
  const scrollMemory = useRef<Partial<Record<Tab, number>>>({});
  const mainRef = useRef<HTMLElement>(null);
  const top = stack[stack.length - 1];

  const setTab = useCallback(
    (t: Tab) => {
      if (!wide) scrollMemory.current[tab] = window.scrollY;
      setStack([]);
      setTabState(t);
      if (!wide) requestAnimationFrame(() => window.scrollTo(0, t === tab ? 0 : (scrollMemory.current[t] ?? 0)));
    },
    [tab, wide],
  );

  const push = useCallback(
    (r: Route) => {
      // On the website, letters open in the inbox's reading pane.
      if (wide && r.name === "reader") {
        setTabState("letters");
        setStack([r]);
        return;
      }
      setStack((s) => [...s, r]);
    },
    [wide],
  );

  const nav: Nav = useMemo(
    () => ({
      tab,
      setTab,
      push,
      pop: () => setStack((s) => s.slice(0, -1)),
      replace: (r) => (wide && r.name === "reader" ? push(r) : setStack((s) => [...s.slice(0, -1), r])),
      restartOnboarding: () => {
        try {
          localStorage.removeItem(ONBOARDED_KEY);
        } catch {
          /* ignore */
        }
        setStack([]);
        setTabState("home");
        setOnboarded(false);
        void store.auth.signOut();
      },
    }),
    [tab, setTab, push, wide, store.auth],
  );

  // Android hardware back / Escape → close the arrival, pop the stack, return to Home, then exit.
  const onBack = useRef<() => boolean>(() => false);
  onBack.current = () => {
    if (store.arrival && top?.name !== "compose") store.dismissArrival();
    else if (stack.length) nav.pop();
    else if (tab !== "home") nav.setTab("home");
    else return false;
    return true;
  };
  useEffect(() => {
    let remove: (() => void) | undefined;
    let cancelled = false;
    import("@capacitor/app")
      .then(({ App }) =>
        App.addListener("backButton", () => {
          if (!onBack.current()) void App.exitApp();
        }),
      )
      .then((h) => {
        if (cancelled) void h.remove();
        else remove = () => void h.remove();
      })
      .catch(() => {
        /* running in a browser */
      });
    return () => {
      cancelled = true;
      remove?.();
    };
  }, []);

  // Website: Escape steps back, unless a sheet/dialog is open (they handle it themselves).
  useEffect(() => {
    if (!wide) return;
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("[aria-modal]:not([data-shell])")) return;
      onBack.current();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [wide]);

  // Phone: the tab underneath a stacked screen must not scroll.
  useEffect(() => {
    document.body.style.overflow = !wide && stack.length ? "hidden" : "";
  }, [stack.length, wide]);

  // Website: each destination starts at the top.
  const page = stack.filter((r) => r.name !== "compose").at(-1);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [tab, page?.name, wide]);

  /* ---------------- signed out / loading ---------------- */

  if (store.status === "loading") return <Splash />;

  if (store.status === "signed-out") {
    const content = !onboarded ? (
      <OnboardingScreen
        onDone={() => {
          try {
            localStorage.setItem(ONBOARDED_KEY, "1");
          } catch {
            /* ignore */
          }
          setOnboarded(true);
        }}
      />
    ) : (
      <AuthScreen />
    );
    return wide ? (
      <div className="grid min-h-dvh grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] bg-dk-bg">
        <BrandPanel />
        <div className="flex items-center justify-center px-10">
          <div className="w-full max-w-[440px]">{content}</div>
        </div>
      </div>
    ) : (
      <Frame>{content}</Frame>
    );
  }

  /* ---------------- signed in ---------------- */

  const unread = store.folder("inbox").filter((l) => !l.read).length;
  const arrivalLetter = top?.name === "compose" ? null : store.arrival;
  const openArrival = () => {
    const id = store.arrival!.id;
    store.dismissArrival();
    if (wide) push({ name: "reader", id });
    else setStack([{ name: "reader", id }]);
  };

  if (wide) {
    const compose = top?.name === "compose" ? top : null;
    const splitReader = page?.name === "reader" ? page.id : undefined;
    const viewKey = splitReader || (tab === "letters" && !page) ? "letters" : page ? `${page.name}-${stack.length}` : tab;
    return (
      <NavCtx.Provider value={nav}>
        <LayoutGroup>
          <Sidebar tab={tab} top={page} onTab={setTab} onPush={push} />
          <main ref={mainRef} className="dk-scroll fixed inset-y-0 left-[260px] right-0 [transform:translateZ(0)]" style={{ "--dk-col": "760px" } as CSSProperties}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={viewKey} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                {viewKey === "letters" ? (
                  <LettersScreen openId={splitReader} />
                ) : page ? (
                  <div className="mx-auto w-full max-w-[760px]">
                    <Screen route={page} />
                  </div>
                ) : (
                  <div className="mx-auto w-full max-w-[1120px] px-6">
                    <TabScreen tab={tab} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
          <AnimatePresence>
            {compose && (
              <motion.div key="compose" className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="absolute inset-0 bg-[var(--dk-scrim)]" />
                <motion.div
                  role="dialog"
                  aria-modal
                  data-shell
                  aria-label="নতুন চিঠি"
                  className="relative h-[min(880px,94dvh)] w-full max-w-[640px] overflow-hidden rounded-dk-xl bg-dk-bg shadow-[var(--dk-shadow-2)] [transform:translateZ(0)]"
                  style={{ "--dk-col": "640px" } as CSSProperties}
                  initial={{ y: 24, scale: 0.98 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 16, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 40 }}
                >
                  <div className="dk-scroll h-full">
                    <ComposeScreen toPostalId={compose.toPostalId} subject={compose.subject} draftId={compose.draftId} />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
        <ArrivalOverlay letter={arrivalLetter} onLater={store.dismissArrival} onOpen={openArrival} />
      </NavCtx.Provider>
    );
  }

  return (
    <NavCtx.Provider value={nav}>
      <LayoutGroup>
        <Frame>
          <AnimatePresence mode="wait" initial={false}>
            <motion.main key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} aria-hidden={!!top}>
              <TabScreen tab={tab} />
            </motion.main>
          </AnimatePresence>
          <BottomNav tab={tab} onTab={setTab} onCompose={() => nav.push({ name: "compose" })} unread={unread} />
          <AnimatePresence>
            {stack.map((r, i) => (
              <StackLayer key={`${i}-${r.name}-${"id" in r ? r.id : ""}`} route={r} depth={i} />
            ))}
          </AnimatePresence>
        </Frame>
      </LayoutGroup>
      <ArrivalOverlay letter={arrivalLetter} onLater={store.dismissArrival} onOpen={openArrival} />
    </NavCtx.Provider>
  );
}

function TabScreen({ tab }: { tab: Tab }) {
  switch (tab) {
    case "home":
      return <HomeScreen />;
    case "letters":
      return <LettersScreen />;
    case "postoffice":
      return <PostOfficeScreen />;
    case "profile":
      return <ProfileScreen />;
  }
}

/** Phone: stacked screens slide in; compose rises from the bottom; reading opens like paper. */
function StackLayer({ route, depth }: { route: Route; depth: number }) {
  const motionProps =
    route.name === "compose"
      ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "spring" as const, stiffness: 380, damping: 40 } }
      : route.name === "reader"
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } }
        : { initial: { x: "18%", opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: "12%", opacity: 0 }, transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] as const } };

  return (
    <motion.div {...motionProps} className="dk-scroll fixed inset-0 mx-auto max-w-[480px] bg-dk-bg" style={{ zIndex: 40 + depth }}>
      <Screen route={route} />
    </motion.div>
  );
}

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case "reader":
      return <ReaderScreen id={route.id} />;
    case "compose":
      return <ComposeScreen toPostalId={route.toPostalId} subject={route.subject} draftId={route.draftId} />;
    case "delivery":
      return <DeliveryScreen id={route.id} fresh={route.fresh} />;
    case "stamps":
      return <StampsScreen mine={route.mine} />;
    case "archive":
      return <ArchiveScreen />;
    case "envelopes":
      return <EnvelopesScreen />;
    case "tickets":
      return <TicketsScreen />;
    case "coins":
      return <CoinsScreen />;
    case "adda":
      return <AddaScreen />;
    case "identity":
      return <IdentityScreen />;
    case "settings":
      return <SettingsScreen />;
    case "notifications":
      return <NotificationsScreen />;
    case "system":
      return <SystemGallery />;
  }
}

/** Phone-width column. Full-bleed on Android; centred on tablets. */
function Frame({ children }: { children: ReactNode }) {
  return <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-dk-bg">{children}</div>;
}
