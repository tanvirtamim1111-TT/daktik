const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Bengali numerals for numbers that live inside Bengali sentences. */
export const bn = (value: number | string) => String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);

export const toLatinDigits = (value: string) => value.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

/** "3431111" → "343-1111". Accepts Bengali digits too. */
export const formatPostalId = (value: string) => {
  const digits = toLatinDigits(value).replace(/\D/g, "").slice(0, 7);
  return digits.length <= 3 ? digits : `${digits.slice(0, 3)}-${digits.slice(3)}`;
};

export const isCompletePostalId = (value: string) => /^\d{3}-\d{4}$/.test(value);

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Short relative time for lists: "এইমাত্র", "১২ মি.", "৩ ঘ.", "গতকাল", "১২ অক্টো." */
export const timeAgo = (at: number, now = Date.now()) => {
  const diff = Math.max(0, now - at);
  if (diff < MINUTE) return "এইমাত্র";
  if (diff < HOUR) return `${bn(Math.floor(diff / MINUTE))} মি.`;
  if (diff < DAY) return `${bn(Math.floor(diff / HOUR))} ঘ.`;
  if (diff < 2 * DAY) return "গতকাল";
  return formatDate(at, true);
};

const MONTHS = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
const MONTHS_FULL = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export const formatDate = (at: number, short = false) => {
  const d = new Date(at);
  return short ? `${bn(d.getDate())} ${MONTHS[d.getMonth()]}` : `${bn(d.getDate())} ${MONTHS_FULL[d.getMonth()]} ${bn(d.getFullYear())}`;
};

/** Natural remaining-time phrase: "প্রায় ১৮ ঘণ্টা", "৪০ মিনিট", "কয়েক সেকেন্ড". */
export const remaining = (ms: number) => {
  if (ms <= 0) return "এখনই";
  if (ms < MINUTE) return "কয়েক সেকেন্ড";
  if (ms < HOUR) return `${bn(Math.ceil(ms / MINUTE))} মিনিট`;
  return `প্রায় ${bn(Math.round(ms / HOUR))} ঘণ্টা`;
};

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 5) return "শুভ রাত্রি";
  if (h < 12) return "শুভ সকাল";
  if (h < 17) return "শুভ দুপুর";
  if (h < 20) return "শুভ সন্ধ্যা";
  return "শুভ রাত্রি";
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");
