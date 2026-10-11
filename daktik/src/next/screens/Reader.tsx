import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Archive, ArrowLeft, Heart, MoreHorizontal, Reply, Trash2, X } from "lucide-react";
import { StampArt } from "../components/art";
import { Avatar, BottomSheet, Dialog, EmptyState, IconButton, ListItem, useToast } from "../components/primitives";
import { useStore } from "../data/store";
import { bn, cx, formatDate, remaining } from "../lib/format";
import { useNav } from "../nav";

/**
 * The emotional centre of Daktik. The letter takes the whole screen on a
 * quiet digital-paper surface; everything else steps back.
 */
export function ReaderScreen({ id, embedded }: { id: string; /** In the website's reading pane. */ embedded?: boolean }) {
  const s = useStore();
  const nav = useNav();
  const toast = useToast();
  const letter = s.letters.find((l) => l.id === id);
  const [more, setMore] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (letter && !letter.read && letter.folder === "inbox" && Date.now() >= letter.deliverAt) s.markRead(letter.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter?.id]);

  if (!letter) {
    return (
      <div className="dk-safe-top px-4">
        <IconButton label="ফিরে যান" onClick={nav.pop} className="-ml-2">
          <ArrowLeft className="h-[22px] w-[22px]" />
        </IconButton>
        <EmptyState title="চিঠিটা আর নেই" body="হয়তো মুছে ফেলা হয়েছে।" />
      </div>
    );
  }

  const incoming = letter.from.id !== s.me.id;

  // A letter can't be read before it arrives — not even via a notification link.
  if (incoming && letter.folder !== "drafts" && s.now < letter.deliverAt) {
    return (
      <div className="dk-safe-top px-4">
        <IconButton label="ফিরে যান" onClick={nav.pop} className="-ml-2">
          <ArrowLeft className="h-[22px] w-[22px]" />
        </IconButton>
        <EmptyState title="চিঠিটা এখনো পথে আছে" body={`${letter.from.name}-এর চিঠি পৌঁছাতে ${remaining(letter.deliverAt - s.now)} বাকি।`} />
      </div>
    );
  }
  const person = incoming ? letter.from : letter.to;
  const stamp = s.stamps.find((x) => x.id === letter.stampId);
  const hours = Math.round((letter.deliverAt - letter.sentAt) / 3_600_000);
  const paragraphs = letter.body.split(/\n{2,}/);

  const reply = () => nav.push({ name: "compose", toPostalId: person.postalId, subject: letter.subject ? `উত্তর: ${letter.subject}` : undefined });

  return (
    <div className="flex min-h-dvh flex-col bg-dk-bg">
      <header className="dk-safe-top sticky top-0 z-20 flex items-center gap-1 bg-dk-bg/90 px-2 pb-1 backdrop-blur-xl">
        {embedded ? (
          <IconButton label="বন্ধ করুন" onClick={nav.pop}>
            <X className="h-[22px] w-[22px]" />
          </IconButton>
        ) : (
          <IconButton label="ফিরে যান" onClick={nav.pop}>
            <ArrowLeft className="h-[22px] w-[22px]" />
          </IconButton>
        )}
        <div className="flex-1" />
        {incoming && (
          <IconButton
            label="আর্কাইভ"
            onClick={() => {
              s.archive([letter.id]);
              nav.pop();
              toast({ text: "আর্কাইভ হয়েছে", action: { label: "ফেরত আনুন", run: () => s.restore(letter.id) } });
            }}
          >
            <Archive className="h-5 w-5" />
          </IconButton>
        )}
      </header>

      {/* Sender */}
      <div className="flex items-center gap-4 px-5 pb-6 pt-2">
        <Avatar person={person} size={52} layoutId={embedded ? undefined : `avatar-${letter.id}`} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[1.125rem] font-semibold">{incoming ? person.name : `${person.name}-কে`}</p>
          <p className="dk-caption">
            <span className="dk-num">{person.postalId}</span> · {formatDate(incoming ? letter.deliverAt : letter.sentAt)}
          </p>
        </div>
      </div>

      {/* The letter */}
      <motion.article
        initial={{ opacity: 0, y: 28, scaleY: 0.97 }}
        animate={{ opacity: 1, y: 0, scaleY: 1 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1], delay: 0.08 }}
        style={{ transformOrigin: "top center" }}
        className="dk-paper mx-3 flex-1 rounded-t-dk-xl px-6 pb-40 pt-8 shadow-[var(--dk-shadow-2)] lg:mx-6 lg:px-12 lg:pt-12"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {letter.subject && <h1 className="dk-h1 text-[1.5rem]">{letter.subject}</h1>}
            <p className="dk-caption mt-1">{hours > 0 ? `${bn(hours)} ঘণ্টার পথ পেরিয়ে এসেছে` : "খসড়া"}</p>
          </div>
          {stamp && (
            <motion.div initial={{ rotate: -14, opacity: 0, scale: 0.8 }} animate={{ rotate: 4, opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 220, damping: 16 }}>
              <StampArt stamp={stamp} className="w-12" />
            </motion.div>
          )}
        </div>
        <div className="mt-8 space-y-5">
          {paragraphs.map((p, i) => (
            <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }} className="dk-reading whitespace-pre-line select-text">
              {p}
            </motion.p>
          ))}
        </div>
        <p className="mt-10 font-display text-[1rem] text-dk-ink-2">— {letter.from.name}</p>
      </motion.article>

      {/* Actions */}
      <div className="dk-safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[var(--dk-col,480px)] bg-gradient-to-t from-dk-bg via-dk-bg/95 to-transparent px-4 pt-8">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => s.toggleSaved(letter.id)}
            aria-pressed={!!letter.saved}
            aria-label="ভালো লেগেছে — সংরক্ষণ করুন"
            className={cx(
              "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
              letter.saved ? "bg-dk-error-tint text-dk-error" : "bg-dk-surface text-dk-ink shadow-[var(--dk-shadow-1)]",
            )}
          >
            <motion.span key={String(!!letter.saved)} initial={{ scale: letter.saved ? 0.6 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
              <Heart className="h-[22px] w-[22px]" fill={letter.saved ? "currentColor" : "none"} />
            </motion.span>
          </motion.button>
          {incoming ? (
            <motion.button whileTap={{ scale: 0.98 }} onClick={reply} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-dk-green font-display text-[1rem] text-dk-on-green">
              <Reply className="h-5 w-5" />
              এই চিঠির উত্তর দিন
            </motion.button>
          ) : (
            <div className="flex-1" />
          )}
          <IconButton label="আরও" tone="soft" className="h-14 w-14 bg-dk-surface shadow-[var(--dk-shadow-1)]" onClick={() => setMore(true)}>
            <MoreHorizontal className="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      <BottomSheet open={more} onClose={() => setMore(false)}>
        <div className="-mx-1 pb-2">
          {incoming && <ListItem icon={<Reply className="h-5 w-5" />} label="উত্তর দিন" onClick={() => (setMore(false), reply())} />}
          {incoming && (
            <ListItem
              icon={<Archive className="h-5 w-5" />}
              label="আর্কাইভ করুন"
              onClick={() => {
                setMore(false);
                s.archive([letter.id]);
                nav.pop();
              }}
            />
          )}
          <ListItem icon={<Trash2 className="h-5 w-5" />} label="মুছে ফেলুন" danger onClick={() => (setMore(false), setConfirm(true))} />
        </div>
      </BottomSheet>
      <Dialog
        open={confirm}
        title="চিঠিটা মুছবেন?"
        body="মুছে ফেললে আর ফেরত আনা যাবে না।"
        confirm="মুছে ফেলুন"
        danger
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          nav.pop();
          s.remove([letter.id]);
          toast({ text: "মুছে ফেলা হয়েছে" });
        }}
      />
    </div>
  );
}
