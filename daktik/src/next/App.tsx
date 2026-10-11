import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./theme/daktik.css";
import { BottomNav } from "./components/BottomNav";
import { ToastProvider } from "./components/primitives";
import { StoreProvider, useStore } from "./data/store";
import { NavCtx, type Nav, type Route, type Tab } from "./nav";
import { AddaScreen } from "./screens/Adda";
import { ArrivalOverlay } from "./screens/Arrival";
import { CoinsScreen } from "./screens/Coins";
import { ComposeScreen } from "./screens/Compose";
import { DeliveryScreen } from "./screens/Delivery";
import { HomeScreen } from "./screens/Home";
import { LettersScreen } from "./screens/Letters";
import { AuthScreen, OnboardingScreen } from "./screens/Onboarding";
import { EnvelopesScreen, PostOfficeScreen, TicketsScreen } from "./screens/PostOffice";
import { ArchiveScreen, IdentityScreen, NotificationsScreen, ProfileScreen, SettingsScreen } from "./screens/Profile";
import { ReaderScreen } from "./screens/Reader";
import { StampsScreen } from "./screens/Stamps";
import { SystemGallery } from "./screens/SystemGallery";

const ONBOARDED_KEY = "daktik.onboarded";

type Phase = "onboarding" | "auth" | "app";

const readPhase = (): Phase => {
  try {
    return localStorage.getItem(ONBOARDED_KEY) ? "app" : "onboarding";
  } catch {
    return "onboarding";
  }
};

export default function NextApp() {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </StoreProvider>
    </MotionConfig>
  );
}

function Shell() {
  const store = useStore();
  const [phase, setPhase] = useState<Phase>(readPhase);
  const [tab, setTabState] = useState<Tab>("home");
  const [stack, setStack] = useState<Route[]>([]);
  const scrollMemory = useRef<Partial<Record<Tab, number>>>({});

  const setTab = useCallback(
    (t: Tab) => {
      scrollMemory.current[tab] = window.scrollY;
      setStack([]);
      setTabState(t);
      requestAnimationFrame(() => window.scrollTo(0, t === tab ? 0 : (scrollMemory.current[t] ?? 0)));
    },
    [tab],
  );

  const nav: Nav = useMemo(
    () => ({
      tab,
      setTab,
      push: (r) => setStack((s) => [...s, r]),
      pop: () => setStack((s) => s.slice(0, -1)),
      replace: (r) => setStack((s) => [...s.slice(0, -1), r]),
      restartOnboarding: () => {
        try {
          localStorage.removeItem(ONBOARDED_KEY);
        } catch {
          /* ignore */
        }
        setStack([]);
        setTabState("home");
        setPhase("onboarding");
      },
    }),
    [tab, setTab],
  );

  // Android hardware back → close the arrival, pop the stack, return to Home, then exit.
  // The listener is registered once; it always reads the latest state through a ref.
  const onBack = useRef<() => boolean>(() => false);
  onBack.current = () => {
    if (store.arrival && stack[stack.length - 1]?.name !== "compose") store.dismissArrival();
    else if (stack.length) nav.pop();
    else if (tab !== "home") nav.setTab("home");
    else return false;
    return true;
  };
  useEffect(() => {
    let remove: (() => void) | undefined;
    let cancelled = false;
    import("@capacitor/app")
      .then(({ App }) => App.addListener("backButton", () => {
          if (!onBack.current()) void App.exitApp();
        }))
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

  // While a stacked screen is open, the tab content underneath must not scroll.
  useEffect(() => {
    document.body.style.overflow = stack.length ? "hidden" : "";
  }, [stack.length]);

  const finishOnboarding = () => setPhase("auth");
  const finishAuth = () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, "1");
    } catch {
      /* ignore */
    }
    setPhase("app");
  };

  if (phase !== "app") {
    return <Frame>{phase === "onboarding" ? <OnboardingScreen onDone={finishOnboarding} /> : <AuthScreen onDone={finishAuth} />}</Frame>;
  }

  const unread = store.folder("inbox").filter((l) => !l.read).length;
  const top = stack[stack.length - 1];

  return (
    <NavCtx.Provider value={nav}>
      <LayoutGroup>
        <Frame>
          <AnimatePresence mode="wait" initial={false}>
            <motion.main key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} aria-hidden={!!top}>
              {tab === "home" && <HomeScreen />}
              {tab === "letters" && <LettersScreen />}
              {tab === "postoffice" && <PostOfficeScreen />}
              {tab === "profile" && <ProfileScreen />}
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
      <ArrivalOverlay
        // Never interrupt someone mid‑letter: the arrival waits until Compose closes.
        letter={top?.name === "compose" ? null : store.arrival}
        onLater={store.dismissArrival}
        onOpen={() => {
          const id = store.arrival!.id;
          store.dismissArrival();
          setStack([{ name: "reader", id }]);
        }}
      />
    </NavCtx.Provider>
  );
}

/** Stacked screens slide in from the side; compose rises from the bottom; reading opens like paper. */
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

/** Phone-width column. Full-bleed on Android; centred on larger screens. */
function Frame({ children }: { children: React.ReactNode }) {
  return <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-dk-bg">{children}</div>;
}
