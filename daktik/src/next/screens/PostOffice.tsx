import { motion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { StampArt } from "../components/art";
import { CoinAmount, CoinDot } from "../components/domain";
import { Button, TopBar, useToast } from "../components/primitives";
import { DELIVERY_TICKETS } from "../data/catalog";
import { useStore } from "../data/store";
import { bn, cx } from "../lib/format";
import { useNav, type Route } from "../nav";

/**
 * ডাকঘর — the ecosystem hub. A typographic index rather than a grid of
 * look-alike cards: each row says what it is and shows one live detail.
 */
export function PostOfficeScreen() {
  const s = useStore();
  const nav = useNav();
  const collected = s.stamps.filter((x) => x.collected);
  const preview = s.stamps.slice(0, 3);

  const Row = ({ to, title, detail, children }: { to: Route; title: string; detail: ReactNode; children?: ReactNode }) => (
    <motion.button whileTap={{ scale: 0.99 }} onClick={() => nav.push(to)} className="flex w-full items-center gap-4 border-t border-dk-line py-5 text-left">
      <div className="min-w-0 flex-1">
        <p className="font-display text-[1.375rem] font-semibold leading-tight">{title}</p>
        <p className="dk-caption mt-1 text-[0.8125rem]">{detail}</p>
      </div>
      {children}
      <ArrowUpRight className="h-5 w-5 shrink-0 text-dk-ink-3" aria-hidden />
    </motion.button>
  );

  return (
    <div className="pb-32 lg:pb-16">
      <TopBar large title="ডাকঘর" subtitle="সংগ্রহ, খাম, টিকিট আর আড্ডা — এক জায়গায়।" />
      <div className="px-4">
        {/* Balance strip */}
        <button onClick={() => nav.push({ name: "coins" })} className="mt-4 flex w-full items-center justify-between rounded-dk-lg bg-dk-green px-5 py-5 text-left text-dk-on-green">
          <div>
            <p className="text-[0.8125rem] text-dk-on-green/70">আমার কয়েন</p>
            <p className="mt-1 flex items-center gap-2">
              <CoinDot size={18} />
              <span className="dk-num text-[2rem] font-semibold leading-none">{s.me.coins}</span>
            </p>
          </div>
          <span className="rounded-full bg-white/12 px-4 py-2 font-display text-[0.875rem]">বিস্তারিত</span>
        </button>

        <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-x-12">
          <Row to={{ name: "stamps" }} title="স্ট্যাম্প" detail={`${bn(collected.length)} / ${bn(s.stamps.length)} সংগ্রহ করা হয়েছে`}>
            <div className="flex -space-x-3">
              {preview.map((st, i) => (
                <div key={st.id} style={{ rotate: `${(i - 1) * 6}deg` }}>
                  <StampArt stamp={st} locked={!st.collected} className="w-8" />
                </div>
              ))}
            </div>
          </Row>
          <Row to={{ name: "envelopes" }} title="খাম" detail={`${bn(s.envelopes.filter((e) => e.owned).length)}টি আপনার, ${bn(s.envelopes.filter((e) => !e.owned).length)}টি নতুন`}>
            <div className="flex -space-x-2">
              {s.envelopes.slice(0, 3).map((e) => (
                <span key={e.id} className="h-6 w-9 rounded-[4px] ring-2 ring-dk-bg" style={{ background: e.tone }} />
              ))}
            </div>
          </Row>
          <Row to={{ name: "tickets" }} title="টিকিট" detail={`১০ থেকে ২৪ ঘণ্টার ডেলিভারি`} />
          <Row to={{ name: "coins" }} title="কয়েন" detail="আয়, খরচ আর ইতিহাস" />
          <Row to={{ name: "stamps", mine: true }} title="সংগ্রহ" detail="আপনার জমানো স্ট্যাম্প আর খাম" />
          <Row to={{ name: "adda" }} title="পোস্টম্যান আড্ডা" detail="চিঠি, স্মৃতি আর গল্পের জায়গা" />
        </div>
      </div>
    </div>
  );
}

/** খাম — envelope designs. */
export function EnvelopesScreen() {
  const s = useStore();
  const nav = useNav();
  const toast = useToast();
  return (
    <div className="pb-16">
      <TopBar large title="খাম" subtitle="প্রতিটা চিঠির জন্য আলাদা একটা মুখ।" onBack={nav.pop} />
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-4 pt-4 lg:grid-cols-3 lg:gap-x-5">
        {s.envelopes.map((e) => {
          const has = e.owned;
          return (
            <div key={e.id}>
              <div className="relative flex aspect-[4/3] items-center justify-center rounded-dk-md bg-dk-surface">
                <svg viewBox="0 0 120 80" className="dk-img w-[72%]" aria-hidden>
                  <rect width="120" height="80" rx="8" fill={e.tone} />
                  <path d="M4 6l56 38 56-38" fill="none" stroke="#000" strokeOpacity=".14" strokeWidth="2" />
                </svg>
                {has && (
                  <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-dk-green text-dk-on-green">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between px-1 pt-2.5">
                <p className="font-display text-[0.9375rem]">{e.name}</p>
                {has ? (
                  <span className="dk-caption">আপনার</span>
                ) : (
                  <button
                    className={cx("rounded-full bg-dk-sunken px-3 py-1 text-[0.8125rem]", s.me.coins < e.coins && "opacity-40")}
                    disabled={s.me.coins < e.coins}
                    aria-label={`${e.name} খাম, ${e.coins} কয়েন`}
                    onClick={async () => {
                      if (await s.buyEnvelope(e.id)) toast({ text: `‘${e.name}’ খাম আপনার সংগ্রহে`, tone: "success" });
                    }}
                  >
                    <CoinAmount value={e.coins} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** টিকিট — explains delivery tiers; purchase happens at compose time. */
export function TicketsScreen() {
  const nav = useNav();
  return (
    <div className="pb-16">
      <TopBar large title="টিকিট" subtitle="টিকিট ঠিক করে চিঠি কত দ্রুত পৌঁছাবে।" onBack={nav.pop} />
      <div className="px-4 pt-4">
        {DELIVERY_TICKETS.map((t, i) => (
          <div key={t.id} className="flex items-center gap-4 border-b border-dk-line py-5">
            <div className="flex-1">
              <p className="font-display text-[1.125rem] font-semibold">{t.label}</p>
              <p className="dk-caption">পৌঁছাতে প্রায় {bn(t.hours)} ঘণ্টা</p>
            </div>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-dk-sunken" aria-hidden>
              <div className="h-full rounded-full bg-dk-gold" style={{ width: `${40 + i * 20}%` }} />
            </div>
            <CoinAmount value={t.coins} className="w-12 justify-end font-semibold" />
          </div>
        ))}
        <p className="dk-caption mt-6 text-[0.8125rem]">টিকিট আলাদা করে কিনতে হয় না — চিঠি পাঠানোর সময় বেছে নিন।</p>
        <Button block className="mt-8" onClick={() => nav.replace({ name: "compose" })}>
          চিঠি লিখুন
        </Button>
      </div>
    </div>
  );
}
