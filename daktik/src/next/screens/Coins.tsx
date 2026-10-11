import { motion } from "motion/react";
import { useState } from "react";
import { Check } from "lucide-react";
import { CoinBalance, CoinDot, CoinTransactionRow } from "../components/domain";
import { BottomSheet, Button, SectionTitle, TopBar } from "../components/primitives";
import { useStore } from "../data/store";
import { bn, cx } from "../lib/format";
import { useNav } from "../nav";

const PACKS = [
  { coins: 50, price: "৳৪৯" },
  { coins: 120, price: "৳৯৯", note: "জনপ্রিয়" },
  { coins: 300, price: "৳১৯৯" },
];

/** An in-app collectible economy — not a bank statement. */
export function CoinsScreen() {
  const s = useStore();
  const nav = useNav();
  const [buying, setBuying] = useState(false);
  const [pack, setPack] = useState(1);
  const [stage, setStage] = useState<"pick" | "processing" | "done">("pick");

  const lettersLeft = Math.floor(s.me.coins / 10);

  const confirm = async () => {
    setStage("processing");
    await new Promise((r) => setTimeout(r, 1100));
    s.addCoins(PACKS[pack].coins, `${PACKS[pack].coins} কয়েন প্যাক`);
    setStage("done");
  };

  return (
    <div className="pb-16">
      <TopBar title="আমার কয়েন" onBack={nav.pop} />
      <div className="px-5">
        <div className="pb-8 pt-6">
          <CoinBalance value={s.me.coins} caption={<>প্রায় {bn(lettersLeft)}টি সাধারণ চিঠি পাঠানো যাবে</>} />
          <Button size="md" className="mt-6" onClick={() => (setStage("pick"), setBuying(true))}>
            কয়েন নিন
          </Button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3">
          <div className="rounded-dk-md bg-dk-surface p-4">
            <p className="dk-caption">বন্ধুকে আমন্ত্রণ</p>
            <p className="mt-1 font-display text-[1rem]">
              +<span className="dk-num">50</span> প্রতিজন
            </p>
          </div>
          <div className="rounded-dk-md bg-dk-surface p-4">
            <p className="dk-caption">প্রতিদিন চিঠি পড়ুন</p>
            <p className="mt-1 font-display text-[1rem]">
              +<span className="dk-num">5</span> দিনে একবার
            </p>
          </div>
        </div>

        <SectionTitle>ইতিহাস</SectionTitle>
        <div className="divide-y divide-dk-line">
          {s.transactions.map((tx) => (
            <CoinTransactionRow key={tx.id} tx={tx} now={s.now} />
          ))}
        </div>
      </div>

      <BottomSheet open={buying} onClose={() => setBuying(false)} title={stage === "done" ? undefined : "কয়েন নিন"}>
        {stage === "done" ? (
          <div className="flex flex-col items-center pb-4 pt-4 text-center">
            <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-dk-gold-tint">
              <CoinDot size={30} />
            </motion.span>
            <p className="dk-h2 mt-5">
              <span className="dk-num">{PACKS[pack].coins}</span> কয়েন যোগ হয়েছে
            </p>
            <p className="dk-caption mt-1">প্রোটোটাইপ — আসল লেনদেন হয়নি।</p>
            <Button block className="mt-6" onClick={() => setBuying(false)}>
              ঠিক আছে
            </Button>
          </div>
        ) : (
          <div className="pb-2">
            <div className="space-y-2" role="radiogroup" aria-label="কয়েন প্যাক">
              {PACKS.map((p, i) => (
                <button
                  key={p.coins}
                  role="radio"
                  aria-checked={pack === i}
                  onClick={() => setPack(i)}
                  className={cx("flex h-16 w-full items-center gap-4 rounded-dk-md px-4 text-left transition-colors", pack === i ? "bg-dk-green-tint ring-2 ring-dk-green" : "bg-dk-sunken")}
                >
                  <CoinDot size={20} />
                  <span className="dk-num flex-1 text-[1.125rem] font-semibold">{p.coins}</span>
                  {p.note && <span className="rounded-full bg-dk-gold-tint px-2 py-0.5 text-[0.75rem] text-dk-ink">{p.note}</span>}
                  <span className="font-display text-[1rem]">{p.price}</span>
                  {pack === i && <Check className="h-4 w-4 text-dk-green" />}
                </button>
              ))}
            </div>
            <Button block className="mt-6" loading={stage === "processing"} onClick={confirm}>
              {PACKS[pack].price} দিয়ে নিন
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
