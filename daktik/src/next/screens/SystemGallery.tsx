import { useState, type ReactNode } from "react";
import { Heart, PenLine } from "lucide-react";
import { EnvelopeGlyph, ImageCard } from "../components/art";
import { CoinBalance, CoinTransactionRow, DeliveryTimeline, LetterRow, PostalIdChip, StampCard } from "../components/domain";
import { Avatar, BottomSheet, Button, Dialog, EmptyState, ErrorState, FilterChips, IconButton, SearchField, SkeletonRows, Switch, Tabs, TopBar, useToast } from "../components/primitives";
import { useStore } from "../data/store";
import { useNav } from "../nav";

/**
 * Living reference for the Phase 02 component system. Every component is
 * shown in its states so design and engineering review the same thing.
 */
export function SystemGallery() {
  const s = useStore();
  const nav = useNav();
  const toast = useToast();
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [tab, setTab] = useState<"a" | "b" | "c">("a");
  const [chip, setChip] = useState("all");
  const [q, setQ] = useState("");
  const [on, setOn] = useState(true);
  const sample = s.letters.find((l) => l.folder === "inbox" && l.deliverAt <= s.now)!;
  const transit = s.letters.find((l) => l.folder === "sent" && l.deliverAt > s.now);

  return (
    <div className="pb-16">
      <TopBar large title="ডিজাইন সিস্টেম" subtitle="টোকেন, টাইপ আর কম্পোনেন্ট — সব অবস্থায়।" onBack={nav.pop} />
      <div className="space-y-12 px-4 pt-4">
        <Block title="Colour">
          <div className="grid grid-cols-4 gap-3">
            {[
              ["green", "Postal Green"],
              ["bg", "Ivory"],
              ["gold", "Gold"],
              ["sage", "Sage"],
              ["ink", "Ink"],
              ["ink-2", "Ink 2"],
              ["error", "Error"],
              ["success", "Success"],
            ].map(([t, n]) => (
              <div key={t}>
                <div className="aspect-square rounded-dk-md ring-1 ring-dk-line" style={{ background: `var(--dk-${t})` }} />
                <p className="dk-caption mt-1.5">{n}</p>
              </div>
            ))}
          </div>
          <p className="dk-caption mt-3">থিম বদলাতে: সেটিংস → থিম। গাঢ় মোড আলাদাভাবে ডিজাইন করা, উল্টানো নয়।</p>
        </Block>

        <Block title="Typography">
          <p className="dk-display">চিঠি পৌঁছায়</p>
          <p className="dk-h1 mt-3">স্ক্রিনের শিরোনাম</p>
          <p className="dk-h2 mt-2">অংশের শিরোনাম</p>
          <p className="dk-body mt-2">পড়ার জন্য সহজ বাংলা লেখা। লাইনের উচ্চতা ১.৬, যাতে চোখ আরাম পায়।</p>
          <p className="dk-reading mt-2">চিঠির লেখা আরও খোলামেলা — ১.৯৫ লাইন-উচ্চতা।</p>
          <p className="dk-caption mt-2">ক্যাপশন · সময় · মেটাডেটা</p>
          <p className="dk-num mt-2 text-[1.5rem] font-semibold">343-1111 · 120 · 18h</p>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button size="md">Primary</Button>
            <Button size="md" variant="secondary">
              Secondary
            </Button>
            <Button size="md" variant="ghost">
              Ghost
            </Button>
            <Button size="md" variant="danger">
              Danger
            </Button>
            <Button size="md" disabled>
              Disabled
            </Button>
            <Button size="md" loading>
              Loading
            </Button>
          </div>
          <div className="mt-4 flex gap-2">
            <IconButton label="লিখুন" tone="soft">
              <PenLine className="h-5 w-5" />
            </IconButton>
            <IconButton label="ভালো লাগা">
              <Heart className="h-5 w-5" />
            </IconButton>
            <IconButton label="বন্ধ" disabled>
              <Heart className="h-5 w-5" />
            </IconButton>
            <Switch checked={on} onChange={setOn} label="সুইচ" />
          </div>
        </Block>

        <Block title="Tabs · Filter · Search">
          <Tabs
            id="gallery"
            value={tab}
            onChange={setTab}
            items={[
              { id: "a", label: "প্রাপ্ত", count: 2 },
              { id: "b", label: "পাঠানো" },
              { id: "c", label: "খসড়া" },
            ]}
          />
          <div className="mt-4">
            <FilterChips
              value={chip}
              onChange={setChip}
              items={[
                { id: "all", label: "সব" },
                { id: "bd", label: "বাংলাদেশ" },
                { id: "n", label: "প্রকৃতি" },
              ]}
            />
          </div>
          <div className="mt-4">
            <SearchField value={q} onChange={setQ} placeholder="খুঁজুন" />
          </div>
        </Block>

        <Block title="Identity · Avatar">
          <div className="flex items-center gap-3">
            <Avatar person={s.me} size={56} ring />
            <Avatar person={sample.from} />
            <Avatar person={sample.from} size={32} />
            <PostalIdChip id={s.me.postalId} />
          </div>
        </Block>

        <Block title="Letter row">
          <LetterRow
            letter={sample}
            perspective="inbox"
            now={s.now}
            onOpen={() => nav.push({ name: "reader", id: sample.id })}
            onArchive={() => toast({ text: "Archive" })}
            onDelete={() => toast({ text: "Delete" })}
          />
          <LetterRow letter={{ ...sample, read: true }} perspective="inbox" now={s.now} onOpen={() => {}} selecting selected />
          {transit && <LetterRow letter={transit} perspective="sent" now={s.now} onOpen={() => nav.push({ name: "delivery", id: transit.id })} />}
        </Block>

        {transit && (
          <Block title="Delivery timeline">
            <DeliveryTimeline letter={transit} now={s.now} />
          </Block>
        )}

        <Block title="Stamp card · Coins">
          <div className="grid grid-cols-3 gap-3">
            {s.stamps.slice(0, 3).map((st) => (
              <StampCard key={st.id} stamp={st} onOpen={() => nav.push({ name: "stamps" })} />
            ))}
          </div>
          <div className="mt-6">
            <CoinBalance value={s.me.coins} />
            <CoinTransactionRow tx={s.transactions[0]} now={s.now} />
          </div>
        </Block>

        <Block title="Image card">
          <ImageCard hueA={30} hueB={160} caption="ছবি" />
        </Block>

        <Block title="Overlays">
          <div className="flex flex-wrap gap-3">
            <Button size="md" variant="secondary" onClick={() => setSheet(true)}>
              Bottom sheet
            </Button>
            <Button size="md" variant="secondary" onClick={() => setDialog(true)}>
              Dialog
            </Button>
            <Button size="md" variant="secondary" onClick={() => toast({ text: "চিঠি পাঠানো হয়েছে।", tone: "success" })}>
              Toast
            </Button>
            <Button size="md" variant="secondary" onClick={() => toast({ text: "সংযোগ নেই", tone: "error", action: { label: "আবার", run: () => {} } })}>
              Error toast
            </Button>
          </div>
        </Block>

        <Block title="Empty · Loading · Error">
          <div className="rounded-dk-lg bg-dk-surface">
            <EmptyState art={<EnvelopeGlyph />} title="আপনার ডাকবাক্স এখনো খালি।" action={<Button size="md">প্রথম চিঠি লিখুন</Button>} />
          </div>
          <div className="mt-3 rounded-dk-lg bg-dk-surface px-4">
            <SkeletonRows />
          </div>
          <div className="mt-3 rounded-dk-lg bg-dk-surface">
            <ErrorState onRetry={() => toast({ text: "আবার চেষ্টা করা হচ্ছে…" })} />
          </div>
        </Block>
      </div>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="বটম শিট">
        <p className="dk-body pb-6 text-dk-ink-2">নিচে টেনে বা বাইরে ট্যাপ করে বন্ধ করুন।</p>
      </BottomSheet>
      <Dialog open={dialog} title="চিঠিটা মুছবেন?" body="মুছে ফেললে আর ফেরত আনা যাবে না।" confirm="মুছে ফেলুন" danger onClose={() => setDialog(false)} onConfirm={() => setDialog(false)} />
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="dk-overline mb-4">{title}</h2>
      {children}
    </section>
  );
}
