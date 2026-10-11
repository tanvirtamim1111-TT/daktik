import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type InputHTMLAttributes } from "react";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { HeroArt } from "../components/art";
import { useStore } from "../data/store";
import { Button } from "../components/primitives";
import { cx } from "../lib/format";

const SLIDES = [
  { title: "চিঠি লিখুন।", body: "তাড়াহুড়ো নেই। মনের কথা সময় নিয়ে লিখুন — যাকে খুশি, তার পোস্টাল আইডিতে।" },
  { title: "অপেক্ষা করুন।", body: "চিঠি ডাকঘর হয়ে পথে রওনা দেয়। কখন পৌঁছাবে, সব সময় দেখতে পাবেন।" },
  { title: "চিঠি পান।", body: "যখন আসে, তখন সত্যিই আসে। খোলার মুহূর্তটা আপনার।" },
];

/** Three steps, no more. Each visual tells one part of the journey. */
export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  return (
    <div className="dk-safe-top dk-safe-bottom flex min-h-dvh flex-col bg-dk-bg px-6 lg:min-h-0 lg:px-0">
      <div className="flex h-12 items-center justify-between">
        <Wordmark />
        {!last && (
          <button onClick={onDone} className="rounded-full px-3 py-2 text-[0.875rem] text-dk-ink-2 active:bg-dk-sunken">
            বাদ দিন
          </button>
        )}
      </div>

      <div className="relative mt-6 flex aspect-square w-full items-center justify-center overflow-hidden rounded-dk-xl bg-dk-green lg:hidden">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.35 }} className="absolute inset-0">
            {i === 0 && <WriteVisual />}
            {i === 1 && <JourneyVisual />}
            {i === 2 && <ArriveVisual />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex-1 lg:mt-6 lg:min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            <p className="dk-overline">
              <span className="dk-num">0{i + 1}</span> / 03
            </p>
            <h1 className="dk-display mt-3">{SLIDES[i].title}</h1>
            <p className="dk-body mt-4 max-w-[320px] text-dk-ink-2">{SLIDES[i].body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 pb-2 pt-6">
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {SLIDES.map((_, k) => (
            <motion.span key={k} animate={{ width: k === i ? 24 : 6 }} className={cx("h-1.5 rounded-full", k === i ? "bg-dk-green" : "bg-dk-line-strong")} />
          ))}
        </div>
        <Button onClick={() => (last ? onDone() : setI(i + 1))}>{last ? "Daktik শুরু করুন" : "পরের ধাপ"}</Button>
      </div>
    </div>
  );
}

export function Wordmark({ light }: { light?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2 font-num text-[1.0625rem] font-semibold tracking-[-0.01em]", light ? "text-white" : "text-dk-ink")}>
      <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden>
        <rect x="1" y="1" width="20" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M2 3l9 6 9-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="17" cy="4" r="2.4" fill="var(--dk-gold)" stroke="none" />
      </svg>
      Daktik
    </span>
  );
}

function WriteVisual() {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden>
      <circle cx="230" cy="70" r="90" fill="#c8a24a" opacity=".18" />
      <rect x="62" y="56" width="176" height="200" rx="14" fill="#f7f5ef" />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <motion.rect
          key={k}
          x="86"
          y={96 + k * 22}
          height="5"
          rx="2.5"
          fill="#173f35"
          opacity=".18"
          initial={{ width: 0 }}
          animate={{ width: k === 5 ? 60 : 128 - (k % 2) * 18 }}
          transition={{ delay: 0.2 + k * 0.25, duration: 0.5 }}
        />
      ))}
      <motion.g initial={{ x: 0, y: 0 }} animate={{ x: [0, 40, 0, 40], y: [0, 22, 44, 66] }} transition={{ duration: 2.4, ease: "easeInOut" }}>
        <path d="M188 92l26-26 8 8-26 26-11 3z" fill="#c8a24a" />
      </motion.g>
    </svg>
  );
}

function JourneyVisual() {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden>
      <path d="M40 220 C 100 220, 100 90, 160 90 S 230 160, 260 80" fill="none" stroke="#f7f5ef" strokeOpacity=".2" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
      <motion.path
        d="M40 220 C 100 220, 100 90, 160 90 S 230 160, 260 80"
        fill="none"
        stroke="#c8a24a"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 0.62 }}
        transition={{ duration: 1.8, ease: [0.2, 0.8, 0.2, 1] }}
      />
      {[
        [40, 220],
        [160, 90],
        [260, 80],
      ].map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r="9" fill={k < 2 ? "#c8a24a" : "none"} stroke="#c8a24a" strokeWidth="3" />
      ))}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
        <rect x="186" y="136" width="44" height="30" rx="5" fill="#f7f5ef" />
        <path d="M188 139l20 13 20-13" fill="none" stroke="#173f35" strokeOpacity=".3" strokeWidth="2" />
      </motion.g>
    </svg>
  );
}

function ArriveVisual() {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden>
      {[0, 1, 2].map((k) => (
        <motion.circle
          key={k}
          cx="150"
          cy="150"
          r="60"
          fill="none"
          stroke="#f7f5ef"
          strokeOpacity=".15"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 2], opacity: [0.6, 0] }}
          transition={{ duration: 3, delay: k, repeat: Infinity }}
          style={{ transformOrigin: "150px 150px" }}
        />
      ))}
      <motion.g
        initial={{ y: -30, rotate: -8, opacity: 0 }}
        animate={{ y: 0, rotate: -3, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        style={{ transformOrigin: "150px 150px" }}
      >
        <rect x="82" y="106" width="136" height="90" rx="12" fill="#f7f5ef" />
        <path d="M86 112l64 44 64-44" fill="none" stroke="#173f35" strokeOpacity=".25" strokeWidth="2.5" />
        <rect x="184" y="116" width="22" height="26" rx="2" fill="#c8a24a" />
      </motion.g>
    </svg>
  );
}

type AuthView = "choose" | "email" | "phone";

/** Minimal authentication: four ways in, nothing else on screen. */
export function AuthScreen() {
  const s = useStore();
  const [view, setView] = useState<AuthView>("choose");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "কিছু একটা ঠিকমতো হয়নি।");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="dk-safe-top dk-safe-bottom flex min-h-dvh flex-col bg-dk-bg px-6 lg:min-h-0 lg:px-0">
      <div className="flex flex-1 flex-col justify-center lg:flex-none">
        {view === "choose" ? (
          <>
            <span className="lg:hidden">
              <Wordmark />
            </span>
            <h1 className="dk-display mt-8 lg:mt-0">
              চিঠি পৌঁছায়,
              <br />
              অনুভূতি থেকে যায়।
            </h1>
            <p className="dk-body mt-4 text-dk-ink-2">শুরু করতে একটি উপায় বেছে নিন।</p>
          </>
        ) : (
          <button onClick={() => (setView("choose"), setError(""))} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full active:bg-dk-sunken" aria-label="ফিরে যান">
            <ArrowLeft className="h-[22px] w-[22px]" />
          </button>
        )}
      </div>

      <div className="space-y-3 pb-4 pt-8">
        {view === "choose" && (
          <>
            <Button block loading={busy === "google"} disabled={!!busy && busy !== "google"} onClick={() => run("google", () => s.auth.withProvider("google"))} icon={<GoogleMark />}>
              Google দিয়ে চালিয়ে যান
            </Button>
            <Button block variant="secondary" loading={busy === "apple"} disabled={!!busy && busy !== "apple"} onClick={() => run("apple", () => s.auth.withProvider("apple"))} icon={<AppleMark />}>
              Apple দিয়ে চালিয়ে যান
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="md" icon={<Mail className="h-4 w-4" />} disabled={!!busy} onClick={() => setView("email")}>
                ইমেইল
              </Button>
              <Button variant="secondary" size="md" icon={<Phone className="h-4 w-4" />} disabled={!!busy} onClick={() => setView("phone")}>
                ফোন
              </Button>
            </div>
          </>
        )}
        {view === "email" && <EmailForm busy={busy === "email"} onSubmit={(v) => run("email", () => s.auth.withEmail(v))} />}
        {view === "phone" && <PhoneForm busy={busy} run={run} />}

        {error && (
          <p role="alert" className="rounded-dk-md bg-dk-error-tint px-4 py-3 text-[0.875rem] text-dk-error">
            {error}
          </p>
        )}
        <p className="dk-caption pt-2 text-center">চালিয়ে গেলে আপনি Daktik-এর শর্ত ও গোপনীয়তা নীতিতে সম্মত হচ্ছেন।</p>
        {s.mode === "demo" && <p className="dk-caption text-center">ডেমো মোড — কোনো তথ্য সংরক্ষিত হয় না।</p>}
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="dk-caption mb-1.5 block px-1">{label}</span>
      <input {...rest} className="h-13 w-full rounded-dk-md bg-dk-sunken px-4 text-[1rem] outline-none ring-dk-green/30 placeholder:text-dk-ink-3 focus:ring-2" />
    </label>
  );
}

function EmailForm({ busy, onSubmit }: { busy: boolean; onSubmit: (v: { mode: "login" | "register"; email: string; password: string; name?: string }) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 8 && (mode === "login" || name.trim().length > 0);
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit({ mode, email, password, name });
      }}
    >
      <h2 className="dk-h1 pb-2">{mode === "login" ? "ইমেইলে লগইন" : "নতুন অ্যাকাউন্ট"}</h2>
      {mode === "register" && <Field label="আপনার নাম" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
      <Field label="ইমেইল" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <Field label="পাসওয়ার্ড (অন্তত ৮ অক্ষর)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
      <Button block type="submit" loading={busy} disabled={!valid} className="!mt-5">
        {mode === "login" ? "লগইন করুন" : "অ্যাকাউন্ট খুলুন"}
      </Button>
      <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="block w-full py-2 text-center font-display text-[0.9375rem] text-dk-green">
        {mode === "login" ? "অ্যাকাউন্ট নেই? নতুন খুলুন" : "আগে থেকেই অ্যাকাউন্ট আছে? লগইন"}
      </button>
    </form>
  );
}

function PhoneForm({ busy, run }: { busy: string | null; run: (key: string, fn: () => Promise<void>) => Promise<void> }) {
  const s = useStore();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const recaptcha = useRef<HTMLDivElement>(null);
  const digits = phone.replace(/\D/g, "");
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!sent)
          void run("phone", async () => {
            await s.auth.sendPhoneCode(phone, recaptcha.current!);
            setSent(true);
          });
        else void run("phone", () => s.auth.confirmPhoneCode(code));
      }}
    >
      <h2 className="dk-h1 pb-2">{sent ? "কোডটা লিখুন" : "ফোন নম্বর দিয়ে"}</h2>
      {!sent ? (
        <Field label="মোবাইল নম্বর" type="tel" inputMode="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
      ) : (
        <Field label={`${phone}-এ পাঠানো ৬ সংখ্যার কোড`} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      )}
      <div ref={recaptcha} />
      <Button block type="submit" loading={busy === "phone"} disabled={sent ? code.length !== 6 : digits.length < 10} className="!mt-5">
        {sent ? "যাচাই করুন" : "কোড পাঠান"}
      </Button>
      {sent && (
        <button type="button" onClick={() => (setSent(false), setCode(""))} className="block w-full py-2 text-center font-display text-[0.9375rem] text-dk-green">
          নম্বর বদলান
        </button>
      )}
    </form>
  );
}

/** First paint while the session is restored. */
export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-dk-bg" aria-busy aria-label="লোড হচ্ছে">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }}>
        <Wordmark />
      </motion.div>
    </div>
  );
}

/** Website: the left half of the sign-in page. */
export function BrandPanel() {
  return (
    <div className="relative m-4 overflow-hidden rounded-dk-xl text-white">
      <HeroArt count={2} />
      <div className="relative flex h-full flex-col justify-between p-12">
        <Wordmark light />
        <div>
          <p className="dk-overline !text-white/60">Slow Messages. Real Emotion.</p>
          <p className="dk-display mt-4 max-w-[520px] text-[3.25rem]">চিঠি লিখুন। অপেক্ষা করুন। চিঠি পান।</p>
          <p className="mt-5 max-w-[440px] text-[1rem] leading-relaxed text-white/70">পুরোনো দিনের চিঠির অপেক্ষা, আজকের সহজ অভিজ্ঞতায়। একটা পোস্টাল আইডি — আর যাকে খুশি তাকে লিখুন।</p>
        </div>
      </div>
    </div>
  );
}

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="currentColor"
      d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22zM6.4 14a6 6 0 010-3.9V7.5H3.1a10 10 0 000 9zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003.1 7.5L6.4 10C7.2 7.8 9.4 6 12 6z"
    />
  </svg>
);
const AppleMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="currentColor"
      d="M16.4 12.6c0-2.5 2-3.6 2.1-3.7a4.6 4.6 0 00-3.6-2c-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.8A4.8 4.8 0 004 9.4c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7 0 0-2.4-.9-2.4-3.8zM14.1 5.3c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z"
    />
  </svg>
);
