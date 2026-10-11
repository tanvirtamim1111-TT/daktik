import { motion } from "motion/react";
import { useState } from "react";
import { Check } from "lucide-react";
import { StampArt } from "../components/art";
import { CoinAmount, StampCard } from "../components/domain";
import { BottomSheet, Button, EmptyState, FilterChips, TopBar, useToast } from "../components/primitives";
import { useStore } from "../data/store";
import type { StampCategory } from "../data/types";
import { bn } from "../lib/format";
import { useNav } from "../nav";

const CATEGORY_LABEL: Record<StampCategory, string> = { bangladesh: "বাংলাদেশ", nature: "প্রকৃতি", heritage: "ঐতিহাসিক", special: "বিশেষ" };

export function StampsScreen({ mine }: { mine?: boolean }) {
  const s = useStore();
  const nav = useNav();
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | StampCategory>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [justCollected, setJustCollected] = useState<string | null>(null);

  const base = mine ? s.stamps.filter((x) => x.collected) : s.stamps;
  const list = filter === "all" ? base : base.filter((x) => x.category === filter);
  const collected = s.stamps.filter((x) => x.collected).length;
  const open = s.stamps.find((x) => x.id === openId);

  const [collecting, setCollecting] = useState(false);
  const collect = async () => {
    if (!open) return;
    if (s.me.coins < open.coins) {
      toast({ text: "পর্যাপ্ত কয়েন নেই", tone: "error", action: { label: "কয়েন", run: () => nav.push({ name: "coins" }) } });
      return;
    }
    setCollecting(true);
    const ok = await s.collectStamp(open.id);
    setCollecting(false);
    if (ok) {
      setJustCollected(open.id);
      toast({ text: `‘${open.name}’ এখন আপনার সংগ্রহে`, tone: "success" });
    }
  };

  return (
    <div className="pb-16">
      <TopBar large title={mine ? "আমার সংগ্রহ" : "স্ট্যাম্প সংগ্রহ"} onBack={nav.pop} />
      <div className="px-4">
        {/* Progress */}
        <div className="mt-2 flex items-end justify-between">
          <p className="dk-num text-[2.25rem] font-semibold leading-none">
            {collected}
            <span className="text-[1.125rem] font-normal text-dk-ink-3"> / {s.stamps.length}</span>
          </p>
          <p className="dk-caption pb-1">সংগ্রহ করা হয়েছে</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-dk-sunken" role="progressbar" aria-valuenow={collected} aria-valuemax={s.stamps.length}>
          <motion.div
            className="h-full rounded-full bg-dk-green"
            initial={{ width: 0 }}
            animate={{ width: `${(collected / s.stamps.length) * 100}%` }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>

        <div className="mt-6">
          <FilterChips value={filter} onChange={setFilter} items={[{ id: "all", label: "সব" }, ...(Object.keys(CATEGORY_LABEL) as StampCategory[]).map((id) => ({ id, label: CATEGORY_LABEL[id] }))]} />
        </div>

        {list.length === 0 ? (
          <EmptyState
            title="আপনার সংগ্রহ শুরু হয়নি।"
            action={
              <Button size="md" onClick={() => nav.replace({ name: "stamps" })}>
                স্ট্যাম্প দেখুন
              </Button>
            }
          />
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 min-[400px]:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
            {list.map((st) => (
              <StampCard key={st.id} stamp={st} onOpen={() => setOpenId(st.id)} />
            ))}
          </div>
        )}
      </div>

      <BottomSheet open={!!open} onClose={() => (setOpenId(null), setJustCollected(null))}>
        {open && (
          <div className="pb-3">
            <div className="flex justify-center rounded-dk-lg bg-dk-sunken py-8">
              <motion.div
                key={String(open.collected)}
                initial={justCollected === open.id ? { scale: 0.85, rotate: -6 } : { scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <StampArt stamp={open} locked={!open.collected} className="w-40 drop-shadow-md" />
              </motion.div>
            </div>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="dk-h1 text-[1.5rem]">{open.name}</h2>
                <p className="dk-caption mt-1">
                  {CATEGORY_LABEL[open.category]} · {bn(open.year)}
                </p>
              </div>
              {open.collected ? (
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-dk-green-tint px-3 py-1.5 text-[0.8125rem] text-dk-green">
                  <Check className="h-3.5 w-3.5" /> সংগ্রহে আছে
                </span>
              ) : (
                <CoinAmount value={open.coins} className="mt-2 text-[1.125rem] font-semibold" />
              )}
            </div>
            <p className="dk-body mt-4 text-dk-ink-2">{open.description}</p>
            {!open.collected && (
              <Button block className="mt-6" loading={collecting} onClick={collect}>
                {bn(open.coins)} কয়েনে সংগ্রহ করুন
              </Button>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
