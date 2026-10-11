import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, ArrowLeft, Check, ChevronRight, Loader2, Search as SearchIcon, X } from "lucide-react";
import { cx, initials } from "../lib/format";
import type { Person } from "../data/types";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"> {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  block?: boolean;
}

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-dk-green text-dk-on-green active:bg-dk-green-press",
  secondary: "bg-dk-sunken text-dk-ink active:bg-dk-line-strong",
  ghost: "bg-transparent text-dk-ink active:bg-dk-sunken",
  danger: "bg-dk-error-tint text-dk-error active:opacity-80",
};

export function Button({ variant = "primary", size = "lg", loading, icon, block, disabled, className, children, ...rest }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <motion.button
      whileTap={inactive ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12 }}
      disabled={inactive}
      aria-busy={loading || undefined}
      className={cx(
        "relative inline-flex items-center justify-center gap-2 rounded-full font-display font-medium transition-colors duration-150 select-none",
        size === "lg" ? "h-14 px-7 text-[1.0625rem]" : "h-11 px-5 text-[0.9375rem]",
        BUTTON_STYLES[variant],
        block && "w-full",
        disabled && !loading && "opacity-40",
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : icon}
      <span className={cx(loading && "opacity-80")}>{children}</span>
    </motion.button>
  );
}

export function IconButton({
  label,
  children,
  tone = "plain",
  className,
  ...rest
}: { label: string; children: ReactNode; tone?: "plain" | "soft" | "inverse" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-150 disabled:opacity-40",
        tone === "plain" && "text-dk-ink active:bg-dk-sunken",
        tone === "soft" && "bg-dk-sunken text-dk-ink active:bg-dk-line-strong",
        tone === "inverse" && "bg-white/15 text-white backdrop-blur active:bg-white/25",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

export function Avatar({ person, size = 44, ring, layoutId }: { person: Pick<Person, "name" | "hue" | "photo">; size?: number; ring?: boolean; layoutId?: string }) {
  const style = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    background: `hsl(${person.hue} 32% 86%)`,
    color: `hsl(${person.hue} 38% 26%)`,
  };
  return (
    <motion.div
      layoutId={layoutId}
      className={cx("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-semibold", ring && "ring-2 ring-dk-gold ring-offset-2 ring-offset-dk-bg")}
      style={style}
      aria-hidden
    >
      {person.photo ? <img src={person.photo} alt="" className="dk-img h-full w-full object-cover" /> : initials(person.name)}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Top bar                                                             */
/* ------------------------------------------------------------------ */

export function TopBar({ title, onBack, trailing, large, subtitle }: { title?: string; onBack?: () => void; trailing?: ReactNode; large?: boolean; subtitle?: string }) {
  return (
    <header className="dk-safe-top sticky top-0 z-20 bg-dk-bg/90 px-4 pb-2 backdrop-blur-xl">
      <div className="flex h-12 items-center gap-1">
        {onBack && (
          <IconButton label="ফিরে যান" onClick={onBack} className="-ml-2">
            <ArrowLeft className="h-[22px] w-[22px]" />
          </IconButton>
        )}
        {!large && title && <h1 className="dk-h2 flex-1 truncate">{title}</h1>}
        {large && <div className="flex-1" />}
        <div className="flex items-center gap-1">{trailing}</div>
      </div>
      {large && title && (
        <div className="px-1 pt-2">
          <h1 className="dk-h1">{title}</h1>
          {subtitle && <p className="dk-caption mt-1">{subtitle}</p>}
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs & filters                                                      */
/* ------------------------------------------------------------------ */

export function Tabs<T extends string>({ value, onChange, items, id }: { value: T; onChange: (v: NoInfer<T>) => void; items: { id: NoInfer<T>; label: string; count?: number }[]; id: string }) {
  return (
    <div role="tablist" className="flex gap-6 border-b border-dk-line">
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.id)}
            className={cx("relative flex h-12 items-center gap-1.5 font-display text-[1rem] transition-colors", active ? "text-dk-ink" : "text-dk-ink-2")}
          >
            {it.label}
            {!!it.count && <span className="dk-num rounded-full bg-dk-green px-1.5 py-px text-[0.6875rem] font-semibold text-dk-on-green">{it.count}</span>}
            {active && <motion.span layoutId={`tab-${id}`} className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-dk-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          </button>
        );
      })}
    </div>
  );
}

export function FilterChips<T extends string>({ value, onChange, items }: { value: T; onChange: (v: NoInfer<T>) => void; items: { id: NoInfer<T>; label: string }[] }) {
  return (
    <div className="dk-scroll -mx-4 flex gap-2 overflow-x-auto px-4">
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            aria-pressed={active}
            onClick={() => onChange(it.id)}
            className={cx(
              "h-9 shrink-0 rounded-full px-4 font-display text-[0.875rem] transition-colors duration-150",
              active ? "bg-dk-ink text-dk-bg" : "bg-dk-sunken text-dk-ink-2 active:bg-dk-line-strong",
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-full bg-dk-sunken px-4 text-dk-ink-2 focus-within:ring-2 focus-within:ring-dk-green/30">
      <SearchIcon className="h-[18px] w-[18px]" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full flex-1 bg-transparent text-[0.9375rem] text-dk-ink outline-none placeholder:text-dk-ink-3"
      />
      {value && (
        <button aria-label="মুছুন" onClick={() => onChange("")} className="-mr-1 rounded-full p-1 active:bg-dk-line">
          <X className="h-4 w-4" />
        </button>
      )}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Lists                                                               */
/* ------------------------------------------------------------------ */

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between pb-3">
      <h2 className="dk-h2">{children}</h2>
      {action}
    </div>
  );
}

export function TextLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="-mr-2 rounded-full px-2 py-1 font-display text-[0.875rem] text-dk-green active:bg-dk-green-tint">
      {children}
    </button>
  );
}

export function ListGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mb-7">
      {title && <h3 className="dk-overline mb-2 px-1">{title}</h3>}
      <div className="overflow-hidden rounded-dk-lg bg-dk-surface">{children}</div>
    </section>
  );
}

export function ListItem({ icon, label, detail, onClick, danger, trailing }: { icon?: ReactNode; label: string; detail?: string; onClick?: () => void; danger?: boolean; trailing?: ReactNode }) {
  return (
    <button onClick={onClick} className="flex min-h-14 w-full items-center gap-4 px-4 text-left transition-colors active:bg-dk-sunken [&+&]:border-t [&+&]:border-dk-line">
      {icon && <span className={cx("flex h-5 w-5 items-center justify-center", danger ? "text-dk-error" : "text-dk-ink-2")}>{icon}</span>}
      <span className={cx("flex-1 py-4 text-[0.9375rem]", danger && "text-dk-error")}>{label}</span>
      {detail && <span className="dk-caption">{detail}</span>}
      {trailing ?? (onClick && !danger && <ChevronRight className="h-4 w-4 text-dk-ink-3" aria-hidden />)}
    </button>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx("relative h-7 w-12 rounded-full transition-colors", checked ? "bg-dk-green" : "bg-dk-line-strong")}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 35 }} className={cx("absolute top-1 h-5 w-5 rounded-full bg-white shadow", checked ? "right-1" : "left-1")} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* States: empty / loading / error                                     */
/* ------------------------------------------------------------------ */

export function EmptyState({ art, title, body, action }: { art?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      {art && <div className="mb-6 text-dk-sage">{art}</div>}
      <p className="dk-h2">{title}</p>
      {body && <p className="dk-caption mt-2 max-w-[260px] text-[0.875rem]">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <div aria-busy aria-label="লোড হচ্ছে" className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <div className="dk-skeleton h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="dk-skeleton h-3.5 w-1/3" />
            <div className="dk-skeleton h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ title = "কিছু একটা ঠিকমতো হয়নি", body = "ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।", onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center px-8 py-14 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-dk-error-tint text-dk-error">
        <AlertCircle className="h-6 w-6" />
      </span>
      <p className="dk-h2">{title}</p>
      <p className="dk-caption mt-2 text-[0.875rem]">{body}</p>
      {onRetry && (
        <Button variant="secondary" size="md" className="mt-6" onClick={onRetry}>
          আবার চেষ্টা করুন
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom sheet & dialog                                               */
/* ------------------------------------------------------------------ */

export function BottomSheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:p-6">
          <motion.div className="absolute inset-0 bg-[var(--dk-scrim)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={title}
            className="dk-safe-bottom dk-scroll relative max-h-[92dvh] w-full max-w-[480px] rounded-t-dk-xl bg-dk-surface px-5 pt-3 shadow-[var(--dk-shadow-2)] lg:max-w-[520px] lg:rounded-dk-xl lg:px-7 lg:pb-6"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 42 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-dk-line-strong" aria-hidden />
            {title && <h2 className="dk-h2 mb-4">{title}</h2>}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Dialog({
  open,
  title,
  body,
  confirm,
  cancel = "বাতিল",
  danger,
  onConfirm,
  onClose,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirm: string;
  cancel?: string;
  danger?: boolean;
  onConfirm: () => void;
  /** Scrim tap / Escape / back — dismiss without deciding. */
  onClose: () => void;
  /** The cancel button. Defaults to `onClose`. */
  onCancel?: () => void;
}) {
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <motion.div className="absolute inset-0 bg-[var(--dk-scrim)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="alertdialog"
            aria-modal
            aria-label={title}
            className="relative w-full max-w-[340px] rounded-dk-lg bg-dk-surface p-6 shadow-[var(--dk-shadow-2)]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h2 className="dk-h2">{title}</h2>
            {body && <p className="dk-body mt-2 text-dk-ink-2">{body}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" size="md" onClick={onCancel ?? onClose}>
                {cancel}
              </Button>
              <Button variant={danger ? "danger" : "primary"} size="md" onClick={onConfirm}>
                {confirm}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function useEscape(active: boolean, fn: () => void) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && fn();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [active, fn]);
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

interface ToastItem {
  id: number;
  text: string;
  tone: "default" | "success" | "error";
  action?: { label: string; run: () => void };
}

const ToastCtx = createContext<(t: Omit<ToastItem, "id" | "tone"> & { tone?: ToastItem["tone"] }) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = useCallback((t: Omit<ToastItem, "id" | "tone"> & { tone?: ToastItem["tone"] }) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), tone: "default", ...t });
    timer.current = setTimeout(() => setToast(null), t.action ? 4500 : 2600);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex min-h-12 w-full max-w-[420px] items-center gap-3 rounded-dk-md bg-dk-ink px-4 py-3 text-dk-bg shadow-[var(--dk-shadow-2)]"
            >
              {toast.tone === "success" && <Check className="h-4 w-4 text-dk-sage" />}
              {toast.tone === "error" && <AlertCircle className="h-4 w-4 text-dk-error" />}
              <span className="flex-1 text-[0.875rem]">{toast.text}</span>
              {toast.action && (
                <button
                  className="font-display text-[0.875rem] font-semibold text-dk-gold"
                  onClick={() => {
                    toast.action!.run();
                    setToast(null);
                  }}
                >
                  {toast.action.label}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
