import { motion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { DeliveryTimeline } from "../components/domain";
import { Avatar, Button, EmptyState, IconButton } from "../components/primitives";
import { deliveryStage, ticketById, useStore } from "../data/store";
import { bn, remaining } from "../lib/format";
import { useNav } from "../nav";

/** Modern package tracking, emotionally softer. */
export function DeliveryScreen({ id, fresh }: { id: string; fresh?: boolean }) {
  const s = useStore();
  const nav = useNav();
  const letter = s.letters.find((l) => l.id === id);
  if (!letter)
    return (
      <EmptyState
        title="চিঠিটা খুঁজে পাওয়া যায়নি"
        action={
          <Button size="md" onClick={nav.pop}>
            ফিরে যান
          </Button>
        }
      />
    );

  const stage = deliveryStage(letter, s.now);
  const done = stage === "delivered";
  const ticket = ticketById(letter.ticketId);
  const pct = Math.min(1, Math.max(0, (s.now - letter.sentAt) / (letter.deliverAt - letter.sentAt)));

  return (
    <div className="flex min-h-dvh flex-col bg-dk-bg">
      <header className="dk-safe-top px-2">
        <IconButton label="ফিরে যান" onClick={nav.pop}>
          <ArrowLeft className="h-[22px] w-[22px]" />
        </IconButton>
      </header>

      <div className="flex-1 px-6 pb-36">
        {fresh && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-dk-green text-dk-on-green"
          >
            <Check className="h-7 w-7" strokeWidth={2.5} />
          </motion.div>
        )}
        <motion.h1 initial={fresh ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="dk-display text-[2.25rem]">
          {done ? "চিঠি পৌঁছে গেছে।" : fresh ? "চিঠি পাঠানো হয়েছে।" : "চিঠি পথে আছে।"}
        </motion.h1>
        <div className="mt-4 flex items-center gap-3">
          <Avatar person={letter.to} size={32} />
          <p className="text-[0.9375rem] text-dk-ink-2">
            {letter.to.name} · <span className="dk-num">{letter.to.postalId}</span>
          </p>
        </div>

        {/* Remaining time: the one number that matters */}
        {!done && (
          <div className="mt-10 rounded-dk-lg bg-dk-surface p-5">
            <p className="dk-overline">আনুমানিক</p>
            <p className="mt-2 font-display text-[1.5rem] font-semibold">{remaining(letter.deliverAt - s.now)} বাকি</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-dk-sunken" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
              <motion.div
                className="h-full rounded-full bg-dk-gold"
                initial={fresh ? { width: 0 } : false}
                animate={{ width: `${Math.max(3, pct * 100)}%` }}
                transition={{ duration: 0.8, delay: fresh ? 0.6 : 0 }}
              />
            </div>
            {ticket && (
              <p className="dk-caption mt-3">
                {ticket.label} টিকিট · {bn(ticket.hours)} ঘণ্টার ডেলিভারি
              </p>
            )}
          </div>
        )}

        <div className="mt-10">
          <DeliveryTimeline letter={letter} now={s.now} animateIn={fresh} />
        </div>
      </div>

      <div className="dk-safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[var(--dk-col,480px)] space-y-2 bg-gradient-to-t from-dk-bg via-dk-bg to-transparent px-5 pt-6">
        <Button block onClick={nav.pop}>
          {fresh ? "ঠিক আছে" : "ফিরে যান"}
        </Button>
        <Button block variant="ghost" size="md" onClick={() => nav.replace({ name: "reader", id: letter.id })}>
          চিঠিটা দেখুন
        </Button>
      </div>
    </div>
  );
}
