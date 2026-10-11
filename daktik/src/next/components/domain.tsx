import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { Archive, Check, Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { Avatar, useToast } from "./primitives";
import { bn, cx, formatDate, remaining, timeAgo } from "../lib/format";
import { deliveryStage } from "../data/store";
import type { CoinTransaction, DeliveryStage, Letter, Person, Stamp } from "../data/types";
import { StampArt } from "./art";

/* ------------------------------------------------------------------ */
/* Postal ID                                                           */
/* ------------------------------------------------------------------ */

/** The postal address as a brand element: monospaced-feel numerals + copy. */
export function PostalIdChip({ id, size = "md", onDark }: { id: string; size?: "md" | "lg"; onDark?: boolean }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      /* clipboard can be blocked in webviews — the confirmation is still useful */
    }
    setCopied(true);
    toast({ text: "পোস্টাল আইডি কপি হয়েছে", tone: "success" });
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      onClick={copy}
      aria-label={`পোস্টাল আইডি ${id} কপি করুন`}
      className={cx(
        "group inline-flex items-center gap-3 rounded-full transition-colors",
        size === "lg" ? "h-12 pl-5 pr-4" : "h-10 pl-4 pr-3",
        onDark ? "bg-white/10 text-white active:bg-white/20" : "bg-dk-sunken text-dk-ink active:bg-dk-line-strong",
      )}
    >
      <span className={cx("dk-num whitespace-nowrap font-semibold tracking-[0.06em]", size === "lg" ? "text-[1.125rem]" : "text-[0.9375rem]")}>{id}</span>
      <span className={cx("flex h-6 w-6 items-center justify-center rounded-full", onDark ? "bg-white/15" : "bg-dk-surface")}>
        {copied ? <Check className="h-3.5 w-3.5 text-dk-success" /> : <Copy className="h-3.5 w-3.5 opacity-70" />}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Letter row                                                          */
/* ------------------------------------------------------------------ */

const SWIPE = 88;

/**
 * Swipe right → archive. Swipe left → delete. Long press → selection.
 * Rows are separated by whitespace, not borders.
 */
export function LetterRow({
  letter,
  perspective,
  now,
  onOpen,
  onArchive,
  onDelete,
  selecting,
  selected,
  onSelect,
}: {
  letter: Letter;
  perspective: "inbox" | "sent" | "drafts";
  now: number;
  onOpen: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  selecting?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const person: Person = perspective === "inbox" ? letter.from : letter.to;
  const unread = perspective === "inbox" && !letter.read;
  const x = useMotionValue(0);
  const archiveOpacity = useTransform(x, [0, SWIPE], [0, 1]);
  const deleteOpacity = useTransform(x, [-SWIPE, 0], [1, 0]);
  const press = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const longPressed = useRef(false);

  const startPress = () => {
    longPressed.current = false;
    if (!onSelect) return;
    press.current = setTimeout(() => {
      longPressed.current = true;
      navigator.vibrate?.(10);
      onSelect();
    }, 450);
  };
  const cancelPress = () => clearTimeout(press.current);

  const inTransit = perspective === "sent" && now < letter.deliverAt;
  const meta = perspective === "inbox" ? timeAgo(letter.deliverAt, now) : perspective === "drafts" ? timeAgo(letter.sentAt, now) : inTransit ? remaining(letter.deliverAt - now) : timeAgo(letter.deliverAt, now);

  return (
    <div className="relative overflow-hidden rounded-dk-md">
      {!selecting && (
        <>
          <motion.div style={{ opacity: archiveOpacity }} className="absolute inset-0 flex items-center bg-dk-green-tint pl-6 text-dk-green">
            <Archive className="h-5 w-5" />
            <span className="ml-2 font-display text-[0.875rem]">আর্কাইভ</span>
          </motion.div>
          <motion.div style={{ opacity: deleteOpacity }} className="absolute inset-0 flex items-center justify-end bg-dk-error-tint pr-6 text-dk-error">
            <span className="mr-2 font-display text-[0.875rem]">মুছুন</span>
            <Trash2 className="h-5 w-5" />
          </motion.div>
        </>
      )}
      <motion.button
        layout="position"
        drag={selecting ? false : "x"}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: onDelete ? 0.5 : 0.05, right: onArchive ? 0.5 : 0.05 }}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x > SWIPE && onArchive) onArchive();
          else if (info.offset.x < -SWIPE && onDelete) onDelete();
          else animate(x, 0, { type: "spring", stiffness: 500, damping: 40 });
        }}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        onClick={() => {
          if (longPressed.current) return;
          if (selecting) onSelect?.();
          else onOpen();
        }}
        aria-label={`${person.name}${unread ? ", নতুন" : ""}${letter.subject ? `, ${letter.subject}` : ""}`}
        className={cx("relative flex w-full items-start gap-4 bg-dk-bg px-1 py-4 text-left transition-colors", selected && "bg-dk-green-tint")}
      >
        <div className="relative">
          {selecting ? (
            <span className={cx("flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors", selected ? "border-dk-green bg-dk-green text-dk-on-green" : "border-dk-line-strong")}>
              {selected && <Check className="h-5 w-5" />}
            </span>
          ) : (
            <Avatar person={person} layoutId={`avatar-${letter.id}`} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className={cx("flex-1 truncate font-display text-[1rem]", unread ? "font-semibold text-dk-ink" : "font-medium text-dk-ink")}>
              {perspective === "inbox" ? person.name : `${person.name}-কে`}
            </span>
            <span className={cx("shrink-0 text-[0.75rem]", inTransit ? "text-dk-gold" : unread ? "font-medium text-dk-green" : "text-dk-ink-3")}>{meta}</span>
          </div>
          {letter.subject && <p className={cx("truncate text-[0.875rem]", unread ? "text-dk-ink" : "text-dk-ink-2")}>{letter.subject}</p>}
          <div className="flex items-center gap-2">
            <p className="line-clamp-1 flex-1 text-[0.875rem] text-dk-ink-2">{letter.body}</p>
            {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-dk-green" aria-hidden />}
          </div>
          {inTransit && <MiniProgress letter={letter} now={now} />}
        </div>
      </motion.button>
    </div>
  );
}

function MiniProgress({ letter, now }: { letter: Letter; now: number }) {
  const pct = Math.min(1, Math.max(0, (now - letter.sentAt) / (letter.deliverAt - letter.sentAt)));
  return (
    <div className="mt-2 h-1 overflow-hidden rounded-full bg-dk-sunken" aria-hidden>
      <div className="h-full rounded-full bg-dk-gold" style={{ width: `${Math.max(4, pct * 100)}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Delivery timeline                                                   */
/* ------------------------------------------------------------------ */

const STAGES: { id: DeliveryStage; label: string }[] = [
  { id: "written", label: "লেখা হয়েছে" },
  { id: "at-post-office", label: "ডাকঘরে পৌঁছেছে" },
  { id: "on-the-way", label: "পথে আছে" },
  { id: "delivered", label: "প্রাপকের কাছে পৌঁছাবে" },
];

export function DeliveryTimeline({ letter, now, animateIn }: { letter: Letter; now: number; animateIn?: boolean }) {
  const stage = deliveryStage(letter, now);
  const current = STAGES.findIndex((s) => s.id === stage);
  const pct = Math.min(1, Math.max(0, (now - letter.sentAt) / (letter.deliverAt - letter.sentAt)));
  const times = [letter.sentAt, letter.sentAt + Math.min(5 * 60_000, (letter.deliverAt - letter.sentAt) * 0.02), letter.sentAt + (letter.deliverAt - letter.sentAt) * 0.22, letter.deliverAt];

  return (
    <ol className="relative" aria-label="ডেলিভারির অবস্থা">
      {STAGES.map((s, i) => {
        const done = i < current || stage === "delivered";
        const active = i === current && stage !== "delivered";
        const label = s.id === "delivered" && stage === "delivered" ? "প্রাপকের কাছে পৌঁছেছে" : s.label;
        return (
          <motion.li
            key={s.id}
            className="relative flex gap-4 pb-7 last:pb-0"
            initial={animateIn ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animateIn ? 0.25 + i * 0.18 : 0, duration: 0.35 }}
          >
            {i < STAGES.length - 1 && (
              <span className="absolute left-[11px] top-7 h-[calc(100%-26px)] w-[2px] overflow-hidden rounded-full bg-dk-line-strong" aria-hidden>
                <motion.span
                  className="block w-full bg-dk-green"
                  initial={animateIn ? { height: 0 } : false}
                  animate={{ height: done ? "100%" : active ? `${Math.round(stagePortion(i, pct) * 100)}%` : 0 }}
                  transition={{ delay: animateIn ? 0.4 + i * 0.18 : 0, duration: 0.5 }}
                />
              </span>
            )}
            <span
              className={cx(
                "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                done && "bg-dk-green text-dk-on-green",
                active && "bg-dk-gold-tint",
                !done && !active && "border-2 border-dk-line-strong bg-dk-bg",
              )}
            >
              {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              {active && (
                <>
                  <motion.span className="absolute inset-0 rounded-full bg-dk-gold/40" animate={{ scale: [1, 1.7], opacity: [0.6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
                  <span className="h-2.5 w-2.5 rounded-full bg-dk-gold" />
                </>
              )}
            </span>
            <div className="flex-1">
              <p className={cx("font-display text-[1rem]", done || active ? "text-dk-ink" : "text-dk-ink-3", active && "font-semibold")}>{label}</p>
              <p className="dk-caption mt-0.5">{active && s.id === "on-the-way" ? `পৌঁছাতে ${remaining(letter.deliverAt - now)} বাকি` : done || s.id === "delivered" ? clock(times[i]) : ""}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

const stagePortion = (i: number, pct: number) => {
  const bounds = [0, 0, 0.22, 1];
  return Math.min(1, Math.max(0, (pct - bounds[i]) / (bounds[i + 1] - bounds[i])));
};

const clock = (at: number) => {
  const d = new Date(at);
  const h = d.getHours();
  const part = h < 12 ? "সকাল" : h < 17 ? "দুপুর" : h < 20 ? "সন্ধ্যা" : "রাত";
  return `${formatDate(at, true)}, ${part} ${bn(((h + 11) % 12) + 1)}:${bn(String(d.getMinutes()).padStart(2, "0"))}`;
};

/* ------------------------------------------------------------------ */
/* Stamp card                                                          */
/* ------------------------------------------------------------------ */

export function StampCard({ stamp, onOpen }: { stamp: Stamp; onOpen: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onOpen} className="flex flex-col items-stretch text-left" aria-label={`${stamp.name}${stamp.collected ? ", সংগ্রহে আছে" : ", এখনো সংগ্রহ হয়নি"}`}>
      <motion.div layoutId={`stamp-${stamp.id}`} className="relative rounded-dk-md bg-dk-surface p-4">
        <StampArt stamp={stamp} locked={!stamp.collected} className="mx-auto w-full max-w-[120px] drop-shadow-sm" />
        {stamp.collected && (
          <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-dk-green text-dk-on-green" aria-hidden>
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </motion.div>
      <div className="px-1 pt-2.5">
        <p className="truncate font-display text-[0.9375rem]">{stamp.name}</p>
        <p className="dk-caption dk-num">{stamp.collected ? "সংগ্রহে আছে" : <CoinAmount value={stamp.coins} />}</p>
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Coins                                                               */
/* ------------------------------------------------------------------ */

export function CoinDot({ size = 14 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-dk-gold" style={{ width: size, height: size }} aria-hidden>
      <span className="rounded-full border border-white/60" style={{ width: size * 0.55, height: size * 0.55 }} />
    </span>
  );
}

export function CoinAmount({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx("dk-num inline-flex items-center gap-1.5", className)}>
      <CoinDot size={12} />
      {value}
    </span>
  );
}

export function CoinBalance({ value, caption }: { value: number; caption?: ReactNode }) {
  return (
    <div>
      <p className="dk-overline">ব্যালেন্স</p>
      <div className="mt-2 flex items-center gap-3">
        <CoinDot size={28} />
        <motion.span key={value} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="dk-num text-[3.5rem] font-semibold leading-none">
          {value}
        </motion.span>
        <span className="mt-4 font-display text-dk-ink-2">কয়েন</span>
      </div>
      {caption && <div className="dk-caption mt-3">{caption}</div>}
    </div>
  );
}

export function CoinTransactionRow({ tx, now }: { tx: CoinTransaction; now: number }) {
  const earned = tx.amount > 0;
  return (
    <div className="flex items-center gap-4 py-3.5">
      <span className={cx("flex h-10 w-10 items-center justify-center rounded-full", earned ? "bg-dk-success-tint" : "bg-dk-sunken")}>
        <CoinDot size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem]">{tx.reason}</p>
        <p className="dk-caption">{timeAgo(tx.at, now)}</p>
      </div>
      <span className={cx("dk-num text-[1rem] font-semibold", earned ? "text-dk-success" : "text-dk-ink")}>
        {earned ? "+" : "−"}
        {Math.abs(tx.amount)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile header & stats                                              */
/* ------------------------------------------------------------------ */

export function InlineStats({ items }: { items: { value: number; label: string }[] }) {
  return (
    <dl className="flex items-baseline gap-5">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline gap-1.5">
          <dt className="sr-only">{it.label}</dt>
          <dd className="dk-num text-[1.25rem] font-semibold">{it.value}</dd>
          <span className="text-[0.8125rem] text-dk-ink-2" aria-hidden>
            {it.label}
          </span>
        </div>
      ))}
    </dl>
  );
}

export function ProfileHeader({ person, children }: { person: Person; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Avatar person={person} size={88} ring />
      <h1 className="dk-h1 mt-4">{person.name}</h1>
      <div className="mt-3">
        <PostalIdChip id={person.postalId} />
      </div>
      {children}
    </div>
  );
}

export function MoreButton({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="আরও" onClick={onClick} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-dk-ink active:bg-dk-sunken">
      <MoreHorizontal className="h-5 w-5" />
    </button>
  );
}
