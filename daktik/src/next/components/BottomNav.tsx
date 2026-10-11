import { motion } from "motion/react";
import { Home, Mail, PenLine, Landmark, CircleUserRound } from "lucide-react";
import { cx } from "../lib/format";
import type { Tab } from "../nav";

const ITEMS: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "হোম", Icon: Home },
  { id: "letters", label: "চিঠি", Icon: Mail },
  { id: "postoffice", label: "ডাকঘর", Icon: Landmark },
  { id: "profile", label: "প্রোফাইল", Icon: CircleUserRound },
];

/**
 * Five destinations, one of them an action: Compose sits in the middle,
 * raised and green, always under the thumb.
 */
export function BottomNav({ tab, onTab, onCompose, unread }: { tab: Tab; onTab: (t: Tab) => void; onCompose: () => void; unread: number }) {
  const left = ITEMS.slice(0, 2);
  const right = ITEMS.slice(2);
  const render = ({ id, label, Icon }: (typeof ITEMS)[number]) => {
    const active = tab === id;
    return (
      <button key={id} onClick={() => onTab(id)} aria-current={active ? "page" : undefined} className="relative flex h-16 flex-1 flex-col items-center justify-center gap-1">
        <span className="relative">
          <Icon className={cx("h-[22px] w-[22px] transition-colors", active ? "text-dk-green" : "text-dk-ink-3")} strokeWidth={active ? 2.2 : 1.8} />
          {id === "letters" && unread > 0 && <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-dk-gold ring-2 ring-dk-surface" aria-label={`${unread}টি নতুন`} />}
        </span>
        <span className={cx("font-display text-[0.6875rem] transition-colors", active ? "font-semibold text-dk-green" : "text-dk-ink-3")}>{label}</span>
        {active && <motion.span layoutId="nav-dot" className="absolute top-0 h-[3px] w-6 rounded-b-full bg-dk-green" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
      </button>
    );
  };
  return (
    <nav className="dk-safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-dk-line bg-dk-surface/95 backdrop-blur-xl" aria-label="প্রধান নেভিগেশন">
      <div className="flex items-stretch px-2">
        {left.map(render)}
        <div className="flex flex-1 items-start justify-center">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onCompose}
            aria-label="নতুন চিঠি লিখুন"
            className="-mt-5 flex h-[60px] w-[60px] items-center justify-center rounded-[22px] bg-dk-green text-dk-on-green shadow-[var(--dk-shadow-fab)]"
          >
            <PenLine className="h-6 w-6" />
          </motion.button>
        </div>
        {right.map(render)}
      </div>
    </nav>
  );
}
