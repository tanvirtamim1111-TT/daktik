import { motion } from "motion/react";
import { Bell } from "lucide-react";
import { HeroArt, EnvelopeGlyph } from "../components/art";
import { InlineStats, LetterRow, PostalIdChip } from "../components/domain";
import { Avatar, Button, EmptyState, IconButton, SectionTitle, TextLink } from "../components/primitives";
import { useStore } from "../data/store";
import { bn, greeting } from "../lib/format";
import { useNav } from "../nav";

export function HomeScreen() {
  const s = useStore();
  const nav = useNav();
  const inbox = s.folder("inbox");
  const sent = s.letters.filter((l) => l.folder === "sent");
  const unread = inbox.filter((l) => !l.read);
  const inTransit = sent.filter((l) => l.deliverAt > s.now);
  const recent = inbox.slice(0, 3);
  const hasNotif = s.notifications.some((n) => !n.read);

  return (
    <div className="px-4 pb-32 lg:pb-16">
      {/* Greeting */}
      <header className="dk-safe-top flex items-start justify-between pt-4">
        <div>
          <p className="dk-caption text-[0.8125rem]">{greeting()},</p>
          <h1 className="dk-h1 mt-0.5">{s.me.name}</h1>
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="নোটিফিকেশন" onClick={() => nav.push({ name: "notifications" })} className="relative">
            <Bell className="h-[22px] w-[22px]" />
            {hasNotif && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-dk-gold ring-2 ring-dk-bg" />}
          </IconButton>
          <button onClick={() => nav.setTab("profile")} aria-label="প্রোফাইল">
            <Avatar person={s.me} size={36} />
          </button>
        </div>
      </header>
      <p className="mt-2 text-[0.9375rem] text-dk-ink-2">{unread.length ? "আপনার ডাকবাক্সে নতুন কিছু এসেছে।" : inTransit.length ? "আপনার চিঠি পথে আছে।" : "আজ সব শান্ত।"}</p>

      <div className="lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
        <div>
          {/* Hero */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={() => (unread[0] ? nav.push({ name: "reader", id: unread[0].id }) : nav.setTab("letters"))}
            className="relative mt-6 block aspect-[3/2] w-full overflow-hidden rounded-dk-xl text-left text-white lg:aspect-[16/8]"
            aria-label={unread.length ? `${unread.length}টি নতুন চিঠি, খুলুন` : "ডাকবাক্স দেখুন"}
          >
            <HeroArt count={unread.length} />
            <div className="relative flex h-full flex-col justify-between p-6">
              <span className="dk-overline !text-white/60">ডাকবাক্স</span>
              <div>
                {unread.length > 0 ? (
                  <>
                    <p className="dk-display">
                      <span className="dk-num">{bn(unread.length)}</span>টি নতুন
                      <br />
                      চিঠি
                    </p>
                    <p className="mt-2 text-[0.875rem] text-white/70">{unread.map((l) => l.from.name).join(", ")} লিখেছে</p>
                  </>
                ) : (
                  <>
                    <p className="dk-display text-[2rem]">ডাকবাক্স শান্ত</p>
                    <p className="mt-2 text-[0.875rem] text-white/70">{inTransit.length ? `${bn(inTransit.length)}টি চিঠি পথে আছে` : "নতুন চিঠি এলে এখানে দেখবেন"}</p>
                  </>
                )}
              </div>
            </div>
          </motion.button>

          {/* Recent letters */}
          <section className="mt-10">
            <SectionTitle action={<TextLink onClick={() => nav.setTab("letters")}>সব দেখুন</TextLink>}>সাম্প্রতিক চিঠি</SectionTitle>
            {recent.length ? (
              <div>
                {recent.map((l) => (
                  <LetterRow key={l.id} letter={l} perspective="inbox" now={s.now} onOpen={() => nav.push({ name: "reader", id: l.id })} />
                ))}
              </div>
            ) : (
              <EmptyState
                art={<EnvelopeGlyph />}
                title="আপনার ডাকবাক্স এখনো খালি।"
                action={
                  <Button size="md" onClick={() => nav.push({ name: "compose" })}>
                    প্রথম চিঠি লিখুন
                  </Button>
                }
              />
            )}
          </section>
        </div>
        <aside className="lg:pt-6">
          {/* In transit — only when relevant */}
          {inTransit[0] && (
            <button onClick={() => nav.push({ name: "delivery", id: inTransit[0].id })} className="mt-6 flex w-full items-center gap-4 rounded-dk-lg bg-dk-gold-tint px-5 py-4 text-left lg:mt-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dk-gold opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-dk-gold" />
              </span>
              <span className="flex-1 text-[0.9375rem]">{inTransit[0].to.name}-এর কাছে যাচ্ছে</span>
              <span className="dk-caption">ট্র্যাক করুন</span>
            </button>
          )}

          {/* Postal identity + activity, deliberately compact */}
          <section className="mt-10 border-t border-dk-line pt-8 lg:mt-6 lg:rounded-dk-lg lg:border-0 lg:bg-dk-surface lg:p-6">
            <p className="dk-overline">আপনার ঠিকানা</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <PostalIdChip id={s.me.postalId} size="lg" />
              <TextLink onClick={() => nav.push({ name: "identity" })}>QR</TextLink>
            </div>
            <div className="mt-8">
              <InlineStats
                items={[
                  { value: sent.length, label: "পাঠানো" },
                  { value: inbox.length, label: "পাওয়া" },
                  { value: s.stamps.filter((x) => x.collected).length, label: "স্ট্যাম্প" },
                ]}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
