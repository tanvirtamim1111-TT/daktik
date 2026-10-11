import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Archive, Search, Trash2, X } from "lucide-react";
import { EnvelopeGlyph } from "../components/art";
import { LetterRow } from "../components/domain";
import { Button, Dialog, EmptyState, IconButton, SearchField, Tabs, useToast } from "../components/primitives";
import { useStore } from "../data/store";
import type { Letter } from "../data/types";
import { bn } from "../lib/format";
import { useNav } from "../nav";

type Folder = "inbox" | "sent" | "drafts";

export function LettersScreen() {
  const s = useStore();
  const nav = useNav();
  const toast = useToast();
  const [folder, setFolder] = useState<Folder>("inbox");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selection, setSelection] = useState<string[] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);

  const all = s.folder(folder);
  const q = query.trim();
  const letters = q ? all.filter((l) => [l.from.name, l.to.name, l.subject ?? "", l.body].some((t) => t.includes(q))) : all;
  const unread = s.folder("inbox").filter((l) => !l.read).length;

  const toggle = (id: string) =>
    setSelection((sel) => {
      const base = sel ?? [];
      const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
      return next.length ? next : null;
    });

  const archive = (ids: string[]) => {
    s.archive(ids);
    setSelection(null);
    toast({ text: ids.length > 1 ? `${bn(ids.length)}টি চিঠি আর্কাইভ হয়েছে` : "আর্কাইভ হয়েছে", action: ids.length === 1 ? { label: "ফেরত আনুন", run: () => s.restore(ids[0]) } : undefined });
  };

  const open = (l: Letter) => {
    if (folder === "drafts") nav.push({ name: "compose", draftId: l.id });
    else if (folder === "sent" && l.deliverAt > s.now) nav.push({ name: "delivery", id: l.id });
    else nav.push({ name: "reader", id: l.id });
  };

  return (
    <div className="pb-32">
      <header className="dk-safe-top sticky top-0 z-20 bg-dk-bg/92 px-4 backdrop-blur-xl">
        <AnimatePresence mode="wait" initial={false}>
          {selection ? (
            <motion.div key="sel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-[88px] items-center gap-2 pt-4">
              <IconButton label="বাছাই বাতিল" onClick={() => setSelection(null)} className="-ml-2">
                <X className="h-5 w-5" />
              </IconButton>
              <p className="dk-h2 flex-1">
                <span className="dk-num">{bn(selection.length)}</span>টি বাছাই
              </p>
              {folder === "inbox" && (
                <IconButton label="আর্কাইভ" onClick={() => archive(selection)}>
                  <Archive className="h-5 w-5" />
                </IconButton>
              )}
              <IconButton label="মুছুন" onClick={() => setConfirmDelete(selection)}>
                <Trash2 className="h-5 w-5" />
              </IconButton>
            </motion.div>
          ) : (
            <motion.div key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-[88px] items-end justify-between pb-2 pt-4">
              <h1 className="dk-h1">আমার চিঠি</h1>
              <IconButton label="খুঁজুন" onClick={() => setSearching((v) => !v)} className="-mr-2">
                <Search className="h-[22px] w-[22px]" />
              </IconButton>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {searching && !selection && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pb-3">
                <SearchField value={query} onChange={setQuery} placeholder="নাম, বিষয় বা কথা খুঁজুন" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Tabs
          id="letters"
          value={folder}
          onChange={(f) => {
            setFolder(f);
            setSelection(null);
          }}
          items={[
            { id: "inbox", label: "প্রাপ্ত", count: unread },
            { id: "sent", label: "পাঠানো" },
            { id: "drafts", label: "খসড়া" },
          ]}
        />
      </header>

      <div className="px-4 pt-2">
        {letters.length === 0 ? (
          q ? (
            <EmptyState title="কিছু পাওয়া যায়নি" body={`“${q}” দিয়ে কোনো চিঠি নেই।`} />
          ) : folder === "inbox" ? (
            <EmptyState art={<EnvelopeGlyph />} title="আপনার ডাকবাক্স এখনো খালি।" body="কাউকে লিখুন — উত্তর আসতে সময় লাগে, সেটাই আনন্দ।" action={<Button size="md" onClick={() => nav.push({ name: "compose" })}>প্রথম চিঠি লিখুন</Button>} />
          ) : folder === "sent" ? (
            <EmptyState art={<EnvelopeGlyph open />} title="এখনো কোনো চিঠি পাঠাননি।" action={<Button size="md" onClick={() => nav.push({ name: "compose" })}>চিঠি লিখুন</Button>} />
          ) : (
            <EmptyState title="কোনো খসড়া নেই" body="অর্ধেক লেখা চিঠি এখানে জমা থাকবে।" />
          )
        ) : (
          <motion.div layout>
            <AnimatePresence initial={false}>
              {letters.map((l) => (
                <motion.div key={l.id} layout exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
                  <LetterRow
                    letter={l}
                    perspective={folder}
                    now={s.now}
                    onOpen={() => open(l)}
                    onArchive={folder === "inbox" ? () => archive([l.id]) : undefined}
                    onDelete={() => setConfirmDelete([l.id])}
                    selecting={!!selection}
                    selected={selection?.includes(l.id)}
                    onSelect={() => toggle(l.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {folder === "inbox" && !selection && <p className="dk-caption py-6 text-center">ডানে টানলে আর্কাইভ · বামে টানলে মুছে যাবে · চেপে ধরলে বাছাই</p>}
          </motion.div>
        )}
      </div>

      <Dialog
        open={!!confirmDelete}
        title={confirmDelete && confirmDelete.length > 1 ? `${bn(confirmDelete.length)}টি চিঠি মুছবেন?` : "চিঠিটা মুছবেন?"}
        body="মুছে ফেললে আর ফেরত আনা যাবে না।"
        confirm="মুছে ফেলুন"
        danger
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) s.remove(confirmDelete);
          setConfirmDelete(null);
          setSelection(null);
          toast({ text: "মুছে ফেলা হয়েছে" });
        }}
      />
    </div>
  );
}
