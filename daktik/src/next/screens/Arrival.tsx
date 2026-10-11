import { AnimatePresence, motion } from "motion/react";
import { Avatar, Button } from "../components/primitives";
import type { Letter } from "../data/types";

/**
 * The arrival moment. Not a system notification — a quiet full-screen
 * pause: an envelope settles, the sender is named, the first line is
 * offered. One primary action.
 */
export function ArrivalOverlay({ letter, onOpen, onLater }: { letter: Letter | null; onOpen: () => void; onLater: () => void }) {
  const preview = letter ? letter.body.split(/[।\n]/)[0].slice(0, 70) : "";
  return (
    <AnimatePresence>
      {letter && (
        <motion.div
          key={letter.id}
          role="dialog"
          aria-modal
          aria-label="নতুন চিঠি এসেছে"
          className="fixed inset-0 z-[70] flex justify-center lg:items-center lg:bg-[var(--dk-scrim)] lg:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.35 }}
        >
          <div className="relative flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-dk-green text-dk-on-green lg:h-[min(760px,92dvh)] lg:rounded-dk-xl lg:shadow-[var(--dk-shadow-2)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(200,162,74,.45),transparent_65%)]" />
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-[34%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: [0.6, 1.6], opacity: [0.5, 0] }}
                  transition={{ duration: 3.2, delay: 0.6 + i * 1.05, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
            </div>

            <div className="dk-safe-top relative flex flex-1 flex-col items-center justify-center px-8 text-center">
              {/* Envelope settles into view */}
              <motion.div
                initial={{ y: -40, rotate: -10, opacity: 0 }}
                animate={{ y: 0, rotate: -4, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.15 }}
                className="relative mb-12"
              >
                <svg width="176" height="120" viewBox="0 0 176 120" aria-hidden>
                  <rect x="2" y="2" width="172" height="116" rx="14" fill="#f7f5ef" />
                  <motion.path
                    d="M6 10l82 58 82-58"
                    fill="none"
                    stroke="#173f35"
                    strokeOpacity=".25"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  />
                  <rect x="134" y="14" width="26" height="32" rx="3" fill="#c8a24a" />
                </svg>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
                  <Avatar person={letter.from} size={44} ring />
                </div>
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="dk-overline !text-dk-gold">
                {letter.from.name}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="dk-display mt-3 text-[2rem]">
                আপনার জন্য একটি চিঠি এসেছে।
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-5 max-w-[280px] text-[1rem] leading-relaxed text-white/70">
                “{preview}…”
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }} className="dk-safe-bottom relative space-y-2 px-6 pb-4">
              <Button block onClick={onOpen} className="!bg-dk-on-green !text-[#173f35]">
                চিঠি খুলুন
              </Button>
              <Button block variant="ghost" size="md" onClick={onLater} className="!text-white/70">
                পরে দেখব
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
