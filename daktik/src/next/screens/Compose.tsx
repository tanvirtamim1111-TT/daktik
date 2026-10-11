import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { StampArt } from "../components/art";
import { CoinAmount, CoinDot } from "../components/domain";
import { Avatar, Button, Dialog, IconButton } from "../components/primitives";
import { DELIVERY_TICKETS, LETTER_LIMIT } from "../data/mock";
import { useStore } from "../data/store";
import type { DeliveryTicket } from "../data/types";
import { bn, cx, formatPostalId, isCompletePostalId } from "../lib/format";
import { useNav } from "../nav";

export function ComposeScreen({ toPostalId, subject: initialSubject, draftId }: { toPostalId?: string; subject?: string; draftId?: string }) {
  const s = useStore();
  const nav = useNav();
  const draft = draftId ? s.letters.find((l) => l.id === draftId) : undefined;

  const [to, setTo] = useState(toPostalId ?? (draft && draft.to.postalId !== "—" ? draft.to.postalId : ""));
  const [subject, setSubject] = useState(initialSubject ?? draft?.subject ?? "");
  const [body, setBody] = useState(draft?.body ?? "");
  const [ticket, setTicket] = useState<DeliveryTicket>(DELIVERY_TICKETS[0]);
  const [stampId, setStampId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [askDraft, setAskDraft] = useState(false);
  const [touched, setTouched] = useState(false);

  const recipient = useMemo(() => (isCompletePostalId(to) ? s.lookup(to) : undefined), [to, s]);
  const self = recipient?.id === s.me.id;
  const recipientError = touched && isCompletePostalId(to) && (!recipient ? "এই ঠিকানায় কেউ নেই" : self ? "নিজেকে চিঠি পাঠানো যায় না" : "");
  const owned = s.stamps.filter((x) => x.collected);
  const affordable = s.me.coins >= ticket.coins;
  const ready = !!recipient && !self && body.trim().length > 0 && affordable;

  const close = () => {
    if (draft) {
      // Editing a draft saves quietly — no question needed.
      if (body !== draft.body || subject !== (draft.subject ?? "") || to !== draft.to.postalId) {
        s.remove([draft.id]);
        s.saveDraft({ to: recipient, subject, body });
      }
      return nav.pop();
    }
    if (body.trim()) setAskDraft(true);
    else nav.pop();
  };

  const send = async () => {
    if (!ready || !recipient) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900)); // the envelope seals
    if (draft) s.remove([draft.id]);
    const letter = s.send({ to: recipient, subject, body: body.trim(), ticket, stampId });
    nav.replace({ name: "delivery", id: letter.id, fresh: true });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-dk-bg">
      <header className="dk-safe-top sticky top-0 z-20 flex items-center gap-2 bg-dk-bg/92 px-2 pb-2 backdrop-blur-xl">
        <IconButton label="বন্ধ করুন" onClick={close}>
          <X className="h-[22px] w-[22px]" />
        </IconButton>
        <h1 className="dk-h2 flex-1">নতুন চিঠি</h1>
        <span className="dk-caption mr-3 inline-flex items-center gap-1.5">
          <CoinDot size={12} />
          <span className="dk-num text-dk-ink">{s.me.coins}</span>
        </span>
      </header>

      <div className="flex-1 px-5 pb-40">
        {/* Recipient */}
        <div className="border-b border-dk-line py-3">
          <label className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-[0.875rem] text-dk-ink-2">প্রাপক</span>
            <input
              inputMode="numeric"
              autoComplete="off"
              value={to}
              onChange={(e) => setTo(formatPostalId(e.target.value))}
              onBlur={() => setTouched(true)}
              placeholder="343-1111"
              aria-invalid={!!recipientError}
              className="dk-num h-10 flex-1 bg-transparent text-[1.125rem] font-semibold tracking-[0.06em] outline-none placeholder:font-normal placeholder:text-dk-ink-3"
            />
          </label>
          {recipient && !self && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="ml-[68px] mt-1 flex items-center gap-2">
              <Avatar person={recipient} size={24} />
              <span className="text-[0.875rem]">{recipient.name}</span>
              <Check className="h-4 w-4 text-dk-success" />
            </motion.div>
          )}
          {recipientError && <p className="ml-[68px] mt-1 text-[0.8125rem] text-dk-error">{recipientError}</p>}
        </div>

        {/* Subject */}
        <label className="flex items-center gap-3 border-b border-dk-line py-3">
          <span className="w-14 shrink-0 text-[0.875rem] text-dk-ink-2">বিষয়</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value.slice(0, 80))} placeholder="ঐচ্ছিক" className="h-10 flex-1 bg-transparent font-display text-[1rem] outline-none placeholder:text-dk-ink-3" />
        </label>

        {/* Body */}
        <div className="relative pt-5">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, LETTER_LIMIT))}
            placeholder="আপনার কথা লিখুন..."
            rows={10}
            className="dk-reading min-h-[280px] w-full resize-none bg-transparent outline-none placeholder:text-dk-ink-3"
          />
          <p className={cx("dk-num text-right text-[0.75rem]", body.length > LETTER_LIMIT * 0.9 ? "text-dk-gold" : "text-dk-ink-3")} aria-live="polite">
            {body.length} / {LETTER_LIMIT}
          </p>
        </div>

        {/* Stamp */}
        {owned.length > 0 && (
          <section className="mt-8">
            <h2 className="dk-overline mb-3">স্ট্যাম্প (ঐচ্ছিক)</h2>
            <div className="dk-scroll -mx-5 flex gap-3 overflow-x-auto px-5 pb-1" role="radiogroup" aria-label="স্ট্যাম্প">
              {owned.map((st) => {
                const on = stampId === st.id;
                return (
                  <motion.button
                    key={st.id}
                    role="radio"
                    aria-checked={on}
                    aria-label={st.name}
                    onClick={() => setStampId(on ? undefined : st.id)}
                    animate={{ y: on ? -4 : 0, rotate: on ? -3 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={cx("shrink-0 rounded-dk-sm p-2 transition-colors", on ? "bg-dk-gold-tint ring-2 ring-dk-gold" : "bg-dk-surface")}
                  >
                    <StampArt stamp={st} className="w-11" />
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        {/* Delivery ticket */}
        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="dk-overline">ডেলিভারি</h2>
            <span className="dk-caption">যত বেশি কয়েন, তত দ্রুত</span>
          </div>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="ডেলিভারি টিকিট">
            {DELIVERY_TICKETS.map((t) => {
              const on = t.id === ticket.id;
              const cant = s.me.coins < t.coins;
              return (
                <motion.button
                  key={t.id}
                  role="radio"
                  aria-checked={on}
                  aria-disabled={cant}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setTicket(t)}
                  className={cx(
                    "relative flex flex-col items-start rounded-dk-md p-4 text-left transition-colors duration-150",
                    on ? "bg-dk-green text-dk-on-green" : "bg-dk-surface text-dk-ink",
                    cant && !on && "opacity-45",
                  )}
                >
                  <span className={cx("text-[0.8125rem]", on ? "text-dk-on-green/70" : "text-dk-ink-2")}>{t.label}</span>
                  <span className="mt-1 flex items-baseline gap-1">
                    <span className="dk-num text-[1.75rem] font-semibold leading-none">{t.hours}</span>
                    <span className="font-display text-[0.875rem]">ঘণ্টা</span>
                  </span>
                  <span className={cx("mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8125rem]", on ? "bg-white/12" : "bg-dk-sunken")}>
                    <CoinAmount value={t.coins} />
                  </span>
                  {on && (
                    <motion.span layoutId="ticket-check" className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-dk-gold text-dk-green">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
          {!affordable && (
            <p className="mt-3 text-[0.8125rem] text-dk-error">
              এই টিকিটের জন্য আরও {bn(ticket.coins - s.me.coins)} কয়েন দরকার।{" "}
              <button className="underline" onClick={() => nav.push({ name: "coins" })}>
                কয়েন দেখুন
              </button>
            </p>
          )}
        </section>
      </div>

      <div className="dk-safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] bg-gradient-to-t from-dk-bg via-dk-bg to-transparent px-5 pt-6">
        <Button block loading={sending} disabled={!ready} onClick={send}>
          {sending ? "খামে ভরা হচ্ছে…" : "চিঠি পাঠিয়ে দিন"}
        </Button>
        <p className="dk-caption mt-2 text-center">
          পৌঁছাতে প্রায় {bn(ticket.hours)} ঘণ্টা লাগবে · {bn(ticket.coins)} কয়েন
        </p>
      </div>

      <Dialog
        open={askDraft}
        title="খসড়া রেখে দেবেন?"
        body="পরে ‘খসড়া’ থেকে আবার লিখতে পারবেন।"
        confirm="রেখে দিন"
        cancel="ফেলে দিন"
        onClose={() => setAskDraft(false)}
        onCancel={() => {
          setAskDraft(false);
          nav.pop();
        }}
        onConfirm={() => {
          s.saveDraft({ to: recipient, subject, body });
          setAskDraft(false);
          nav.pop();
        }}
      />
    </div>
  );
}
