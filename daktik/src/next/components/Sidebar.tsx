import { Bell, CircleUserRound, Home, Landmark, Mail, PenLine, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useStore } from "../data/store";
import { cx } from "../lib/format";
import type { Route, Tab } from "../nav";
import { Wordmark } from "../screens/Onboarding";
import { CoinDot } from "./domain";
import { Avatar } from "./primitives";

const ITEMS: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "হোম", Icon: Home },
  { id: "letters", label: "চিঠি", Icon: Mail },
  { id: "postoffice", label: "ডাকঘর", Icon: Landmark },
  { id: "profile", label: "প্রোফাইল", Icon: CircleUserRound },
];

/** Website navigation: the same five destinations, with Compose as the one strong action. */
export function Sidebar({ tab, top, onTab, onPush }: { tab: Tab; top?: Route; onTab: (t: Tab) => void; onPush: (r: Route) => void }) {
  const s = useStore();
  const unread = s.folder("inbox").filter((l) => !l.read).length;
  const unreadNotes = s.notifications.filter((n) => !n.read).length;

  const Item = ({ active, label, Icon, onClick, badge }: { active: boolean; label: string; Icon: typeof Home; onClick: () => void; badge?: number }) => (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cx(
        "relative flex h-11 w-full items-center gap-3 rounded-full px-4 font-display text-[0.9375rem] transition-colors",
        active ? "bg-dk-green-tint font-semibold text-dk-green" : "text-dk-ink-2 hover:bg-dk-sunken hover:text-dk-ink",
      )}
    >
      <Icon className="h-[20px] w-[20px]" strokeWidth={active ? 2.2 : 1.8} />
      <span className="flex-1 text-left">{label}</span>
      {!!badge && <span className="dk-num rounded-full bg-dk-green px-2 py-px text-[0.6875rem] font-semibold text-dk-on-green">{badge}</span>}
    </button>
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col border-r border-dk-line bg-dk-bg px-4 pb-5 pt-7" aria-label="প্রধান নেভিগেশন">
      <div className="px-3">
        <Wordmark />
      </div>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onPush({ name: "compose" })}
        className="mt-8 flex h-12 items-center justify-center gap-2 rounded-full bg-dk-green font-display text-[1rem] text-dk-on-green shadow-[var(--dk-shadow-fab)] hover:bg-dk-green-press"
      >
        <PenLine className="h-[18px] w-[18px]" />
        নতুন চিঠি
      </motion.button>
      <nav className="mt-8 space-y-1">
        {ITEMS.map((it) => (
          <Item key={it.id} active={tab === it.id && (!top || top.name === "reader")} label={it.label} Icon={it.Icon} onClick={() => onTab(it.id)} badge={it.id === "letters" ? unread : undefined} />
        ))}
      </nav>
      <div className="mt-6 space-y-1 border-t border-dk-line pt-6">
        <Item active={top?.name === "notifications"} label="নোটিফিকেশন" Icon={Bell} onClick={() => onPush({ name: "notifications" })} badge={unreadNotes} />
        <Item active={top?.name === "settings"} label="সেটিংস" Icon={Settings} onClick={() => onPush({ name: "settings" })} />
      </div>
      <div className="mt-auto">
        <button onClick={() => onPush({ name: "coins" })} className="mb-3 flex w-full items-center justify-between rounded-dk-md bg-dk-surface px-4 py-3 text-left hover:bg-dk-sunken">
          <span className="text-[0.8125rem] text-dk-ink-2">কয়েন</span>
          <span className="dk-num inline-flex items-center gap-1.5 font-semibold">
            <CoinDot size={12} />
            {s.me.coins}
          </span>
        </button>
        <button onClick={() => onPush({ name: "identity" })} className="flex w-full items-center gap-3 rounded-dk-md px-2 py-2 text-left hover:bg-dk-sunken">
          <Avatar person={s.me} size={36} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-[0.9375rem]">{s.me.name}</span>
            <span className="dk-num block text-[0.75rem] text-dk-ink-2">{s.me.postalId}</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
