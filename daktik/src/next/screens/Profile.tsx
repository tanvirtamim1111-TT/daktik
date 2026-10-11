import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Bell, Bookmark, BookOpen, Ban, CircleHelp, Fingerprint, Globe, Info, Layers, LifeBuoy, LogOut, Mail, Moon, Palette, Settings, Share2, Shield, Stamp, UserRound } from "lucide-react";
import { BottomSheet, EmptyState, ListGroup, ListItem, Switch, TopBar, Button, Dialog, useToast } from "../components/primitives";
import { PostalIdChip, ProfileHeader } from "../components/domain";
import { useStore } from "../data/store";
import type { ThemePreference } from "../data/types";
import { bn, cx, formatDate, timeAgo } from "../lib/format";
import { useNav } from "../nav";

/** Personal, not a vanity page: identity first, numbers small. */
export function ProfileScreen() {
  const s = useStore();
  const nav = useNav();
  const stats = [
    { value: s.letters.filter((l) => l.folder === "sent").length, label: "পাঠানো" },
    { value: s.folder("inbox").length, label: "পাওয়া" },
    { value: s.stamps.filter((x) => x.collected).length, label: "স্ট্যাম্প" },
    { value: s.me.coins, label: "কয়েন" },
  ];
  return (
    <div className="pb-32 lg:pb-16">
      <TopBar
        trailing={
          <button aria-label="সেটিংস" onClick={() => nav.push({ name: "settings" })} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-dk-sunken">
            <Settings className="h-[22px] w-[22px]" />
          </button>
        }
      />
      <div className="px-4 lg:mx-auto lg:grid lg:max-w-[920px] lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-14 lg:pt-6">
        <div className="lg:rounded-dk-xl lg:bg-dk-surface lg:p-8">
          <ProfileHeader person={s.me}>
            <p className="dk-caption mt-3">{formatDate(s.me.joinedAt)} থেকে Daktik-এ</p>
          </ProfileHeader>

          <dl className="mt-8 grid grid-cols-4 border-y border-dk-line py-5 text-center">
            {stats.map((st) => (
              <div key={st.label}>
                <dd className="dk-num text-[1.25rem] font-semibold">{st.value}</dd>
                <dt className="dk-caption mt-0.5">{st.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-8 lg:mt-0">
          <ListGroup>
            <ListItem icon={<Mail className="h-5 w-5" />} label="আমার চিঠি" onClick={() => nav.setTab("letters")} />
            <ListItem icon={<Stamp className="h-5 w-5" />} label="আমার সংগ্রহ" onClick={() => nav.push({ name: "stamps", mine: true })} />
            <ListItem icon={<Fingerprint className="h-5 w-5" />} label="পোস্টাল আইডেন্টিটি" onClick={() => nav.push({ name: "identity" })} />
            <ListItem icon={<Bookmark className="h-5 w-5" />} label="সংরক্ষিত" detail={bn(savedLetters(s).length)} onClick={() => nav.push({ name: "archive" })} />
          </ListGroup>
          <ListGroup>
            <ListItem icon={<Settings className="h-5 w-5" />} label="সেটিংস" onClick={() => nav.push({ name: "settings" })} />
          </ListGroup>
        </div>
      </div>
    </div>
  );
}

/** “এটাই Daktik-এ আপনার ঠিকানা।” */
export function IdentityScreen() {
  const s = useStore();
  const nav = useNav();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const share = async () => {
    const text = `Daktik-এ আমাকে চিঠি লিখুন: ${s.me.postalId}`;
    try {
      if (navigator.share) await navigator.share({ title: "Daktik", text });
      else {
        await navigator.clipboard.writeText(text);
        toast({ text: "শেয়ার করার লেখা কপি হয়েছে", tone: "success" });
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };
  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <TopBar onBack={nav.pop} />
      <div className="flex flex-1 flex-col items-center px-6 pt-4 text-center">
        <p className="dk-overline">আপনার পোস্টাল আইডেন্টিটি</p>
        <p className="dk-num mt-5 text-[3.25rem] font-semibold leading-none tracking-[0.04em] min-[400px]:text-[3.75rem]">{s.me.postalId}</p>
        <p className="mt-4 font-display text-[1.125rem] text-dk-ink-2">এটাই Daktik-এ আপনার ঠিকানা।</p>

        <div className="mt-10 rounded-dk-xl bg-white p-6 shadow-[var(--dk-shadow-2)]">
          <QRCodeSVG value={`daktik://to/${s.me.postalId}`} size={184} fgColor="#173f35" bgColor="#ffffff" level="M" />
        </div>
        <p className="dk-caption mt-4 max-w-[260px]">স্ক্যান করলে সরাসরি আপনাকে চিঠি লেখা যাবে।</p>

        <div className="mt-auto flex w-full flex-wrap justify-center gap-3 pt-10">
          <PostalIdChip id={s.me.postalId} size="lg" />
          <Button size="lg" variant="secondary" icon={<Share2 className="h-5 w-5" />} onClick={share}>
            শেয়ার
          </Button>
        </div>
        <button className="mt-6 font-display text-[0.9375rem] text-dk-green" onClick={() => setEditing(true)}>
          প্রোফাইলের তথ্য বদলান
        </button>
      </div>
      <EditProfileSheet open={editing} onClose={() => setEditing(false)} />
    </div>
  );
}

export function EditProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore();
  const toast = useToast();
  const [name, setName] = useState(s.me.name);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await s.updateProfile({ name });
      toast({ text: "প্রোফাইল আপডেট হয়েছে", tone: "success" });
      onClose();
    } catch {
      toast({ text: "সংরক্ষণ করা যায়নি", tone: "error" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <BottomSheet open={open} onClose={onClose} title="প্রোফাইল">
      <label className="block">
        <span className="dk-caption mb-1.5 block px-1">নাম</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 60))}
          className="h-13 w-full rounded-dk-md bg-dk-sunken px-4 text-[1rem] outline-none focus:ring-2 focus:ring-dk-green/30"
        />
      </label>
      <p className="dk-caption mt-3 px-1">
        পোস্টাল আইডি <span className="dk-num">{s.me.postalId}</span> বদলানো যায় না — এটাই আপনার স্থায়ী ঠিকানা।
      </p>
      <Button block className="mb-2 mt-6" loading={busy} disabled={!name.trim() || name.trim() === s.me.name} onClick={save}>
        সংরক্ষণ করুন
      </Button>
    </BottomSheet>
  );
}

function ReportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore();
  const toast = useToast();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    try {
      await s.reportProblem(text);
      setText("");
      onClose();
      toast({ text: "ধন্যবাদ — আমরা দেখছি।", tone: "success" });
    } catch {
      toast({ text: "পাঠানো যায়নি", tone: "error" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <BottomSheet open={open} onClose={onClose} title="সমস্যা জানান">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 2000))}
        rows={5}
        placeholder="কী হয়েছে, একটু খুলে বলুন…"
        className="dk-body w-full resize-none rounded-dk-md bg-dk-sunken p-4 outline-none placeholder:text-dk-ink-3 focus:ring-2 focus:ring-dk-green/30"
      />
      <Button block className="mb-2 mt-4" loading={busy} disabled={!text.trim()} onClick={send}>
        পাঠান
      </Button>
    </BottomSheet>
  );
}

const THEME_LABEL: Record<ThemePreference, string> = { system: "ফোনের মতো", light: "হালকা", dark: "গাঢ়" };

export function SettingsScreen() {
  const s = useStore();
  const nav = useNav();
  const toast = useToast();
  const [notify, setNotify] = useState(true);
  const [logout, setLogout] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const soon = () => toast({ text: "এই অংশটা শিগগিরই আসছে" });
  const cycleTheme = () => s.setTheme(s.theme === "system" ? "light" : s.theme === "light" ? "dark" : "system");

  return (
    <div className="pb-16">
      <TopBar large title="সেটিংস" onBack={nav.pop} />
      <div className="px-4 pt-4">
        <ListGroup title="অ্যাকাউন্ট">
          <ListItem icon={<UserRound className="h-5 w-5" />} label="প্রোফাইল" detail={s.me.name} onClick={() => setEditing(true)} />
          <ListItem icon={<Fingerprint className="h-5 w-5" />} label="পোস্টাল আইডেন্টিটি" detail={s.me.postalId} onClick={() => nav.push({ name: "identity" })} />
          <ListItem icon={<Shield className="h-5 w-5" />} label="নিরাপত্তা" onClick={soon} />
        </ListGroup>
        <ListGroup title="অভিজ্ঞতা">
          <ListItem icon={<Globe className="h-5 w-5" />} label="ভাষা" detail="বাংলা" onClick={soon} />
          <ListItem icon={<Bell className="h-5 w-5" />} label="নোটিফিকেশন" trailing={<Switch checked={notify} onChange={setNotify} label="নোটিফিকেশন" />} onClick={() => setNotify((v) => !v)} />
          <ListItem icon={<Moon className="h-5 w-5" />} label="থিম" detail={THEME_LABEL[s.theme]} onClick={cycleTheme} />
        </ListGroup>
        <ListGroup title="গোপনীয়তা">
          <ListItem icon={<Ban className="h-5 w-5" />} label="ব্লক করা মানুষ" onClick={soon} />
          <ListItem icon={<Shield className="h-5 w-5" />} label="গোপনীয়তা সেটিংস" onClick={soon} />
        </ListGroup>
        <ListGroup title="সহায়তা">
          <ListItem icon={<CircleHelp className="h-5 w-5" />} label="সাহায্য" onClick={soon} />
          <ListItem icon={<LifeBuoy className="h-5 w-5" />} label="সমস্যা জানান" onClick={() => setReporting(true)} />
          <ListItem icon={<Info className="h-5 w-5" />} label="Daktik সম্পর্কে" detail="v2.0" onClick={() => toast({ text: "Daktik — চিঠি পৌঁছায়, অনুভূতি থেকে যায়।" })} />
        </ListGroup>
        {s.mode === "demo" && (
          <ListGroup title="ডিজাইন (ডেমো)">
            <ListItem icon={<Palette className="h-5 w-5" />} label="ডিজাইন সিস্টেম" onClick={() => nav.push({ name: "system" })} />
            <ListItem icon={<Mail className="h-5 w-5" />} label="চিঠি আসার মুহূর্ত দেখুন" onClick={s.previewArrival} />
            <ListItem icon={<BookOpen className="h-5 w-5" />} label="অনবোর্ডিং আবার দেখুন" onClick={nav.restartOnboarding} />
          </ListGroup>
        )}
        <ListGroup>
          <ListItem icon={<LogOut className="h-5 w-5" />} label="লগ আউট" danger onClick={() => setLogout(true)} />
        </ListGroup>
      </div>
      <Dialog
        open={logout}
        title="লগ আউট করবেন?"
        body="আপনার চিঠি আর সংগ্রহ নিরাপদে থাকবে।"
        confirm="লগ আউট"
        danger
        onClose={() => setLogout(false)}
        onConfirm={() => {
          setLogout(false);
          void s.auth.signOut();
        }}
      />
      <EditProfileSheet open={editing} onClose={() => setEditing(false)} />
      <ReportSheet open={reporting} onClose={() => setReporting(false)} />
    </div>
  );
}

export function NotificationsScreen() {
  const s = useStore();
  const nav = useNav();
  const list = [...s.notifications].sort((a, b) => b.at - a.at);
  return (
    <div className="pb-16">
      <TopBar large title="নোটিফিকেশন" onBack={() => (s.markNotificationsRead(), nav.pop())} />
      <div className="px-4">
        {list.length === 0 ? (
          <EmptyState title="আজ সব শান্ত।" body="নতুন কিছু হলে এখানে জানাব।" />
        ) : (
          list.map((n) => (
            <button
              key={n.id}
              onClick={() => n.letterId && nav.push(s.letters.find((l) => l.id === n.letterId)?.folder === "sent" ? { name: "delivery", id: n.letterId } : { name: "reader", id: n.letterId })}
              className="flex w-full gap-4 border-b border-dk-line py-4 text-left"
            >
              <span className={cx("mt-2 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-dk-gold")} aria-hidden />
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={cx("font-display text-[1rem]", !n.read && "font-semibold")}>{n.title}</p>
                  <span className="dk-caption shrink-0">{timeAgo(n.at, s.now)}</span>
                </div>
                <p className="mt-0.5 text-[0.875rem] text-dk-ink-2">{n.body}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/** “Saved”: letters marked ♡, plus archived ones. */
export const savedLetters = (s: ReturnType<typeof useStore>) => s.letters.filter((l) => l.folder === "archived" || (l.saved && l.folder !== "drafts")).sort((a, b) => b.deliverAt - a.deliverAt);

export function ArchiveScreen() {
  const s = useStore();
  const nav = useNav();
  const list = savedLetters(s);
  return (
    <div className="pb-16">
      <TopBar large title="সংরক্ষিত" subtitle="♡ দেওয়া আর আর্কাইভ করা চিঠি।" onBack={nav.pop} />
      <div className="px-4">
        {list.length === 0 ? (
          <EmptyState art={<Layers className="h-10 w-10" />} title="এখানে কিছু নেই" body="চিঠিতে ♡ দিলে বা ডানে টেনে আর্কাইভ করলে এখানে থাকবে।" />
        ) : (
          list.map((l) => (
            <button key={l.id} onClick={() => nav.push({ name: "reader", id: l.id })} className="flex w-full items-baseline gap-3 border-b border-dk-line py-4 text-left">
              <span className="flex-1 truncate font-display text-[1rem]">
                {l.saved && <span className="mr-1.5 text-dk-error">♡</span>}
                {l.from.id === s.me.id ? `${l.to.name}-কে` : l.from.name}
              </span>
              <span className="truncate text-[0.875rem] text-dk-ink-2">{l.subject ?? l.body.slice(0, 24)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
